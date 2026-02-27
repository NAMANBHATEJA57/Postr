# POSTR_FIREBASE_IMPLEMENTATION_GUIDE.md

> **Stack:** Next.js 14 App Router · TypeScript · Tailwind · Framer Motion · Zod · NanoID · bcrypt · Firebase Firestore · Firebase Storage · Firebase Admin SDK  
> **Version:** 1.0.0 | Feb 2026  
> **Doctrine:** Zero ambiguity. Production-ready. Mobile-first. Minimal.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Firebase Project Setup](#2-firebase-project-setup)
3. [Firestore Setup](#3-firestore-setup)
4. [Firebase Storage Setup](#4-firebase-storage-setup)
5. [Security Rules](#5-security-rules)
6. [Admin SDK Setup](#6-admin-sdk-setup)
7. [Environment Variables](#7-environment-variables)
8. [API Route Integration](#8-api-route-integration)
9. [Upload Flow Architecture](#9-upload-flow-architecture)
10. [Expiry Logic](#10-expiry-logic)
11. [Password Protection](#11-password-protection)
12. [Rate Limiting Strategy](#12-rate-limiting-strategy)
13. [Mobile Optimization](#13-mobile-optimization)
14. [Deployment Guide (Vercel + Firebase)](#14-deployment-guide-vercel--firebase)
15. [Testing Checklist](#15-testing-checklist)
16. [Production Hardening Checklist](#16-production-hardening-checklist)
17. [Cost Estimation](#17-cost-estimation)
18. [Common Mistakes](#18-common-mistakes)
19. [Scaling Considerations](#19-scaling-considerations)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser / Mobile)               │
│                                                                  │
│  1. POST /api/upload       → Get signed upload URL              │
│  2. PUT  <signed-url>      → Upload file directly to Storage     │
│  3. POST /api/postcards    → Create Firestore document           │
│  4. GET  /p/[id]           → Server-fetches + renders postcard   │
│  5. POST /api/postcards/unlock → Verify password (bcrypt)        │
└──────────────────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
  Next.js API Routes         Next.js Server Components
  (Firebase Admin SDK)       (Firebase Admin SDK — read only)
         │                           │
         ▼                           ▼
  Firestore (postcards/)     Firebase Storage (postcards/{id}/media)
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| All Firestore writes go through API routes | Client SDK cannot enforce server-side business logic (expiry, password hashing, rate limits) |
| Signed upload URLs, not raw proxying | Files never pass through your server → cheaper egress, lower latency |
| Admin SDK server-only | Service account key never touches the client bundle |
| Expiry enforced server-side | Client timestamps can be manipulated |
| bcrypt for passwords | One-way hash — not JWT, not AES, not plaintext |

---

## 2. Firebase Project Setup

### 2.1 Create Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `postr-prod`
3. Disable Google Analytics (not needed)
4. Click **Create project**

### 2.2 Enable Firestore

1. Sidebar → **Firestore Database** → **Create database**
2. Select **Production mode** (not test mode)
3. **Location:** Choose the region closest to your users (e.g., `nam5` for US, `eur3` for Europe)

> ⚠️ **Region is permanent.** You cannot change it after creation.

### 2.3 Enable Storage

1. Sidebar → **Storage** → **Get started**
2. Select **Production mode**
3. Use the **same region** as Firestore

### 2.4 Enable Web App

1. Project Overview → **Add app** → Web icon `</>`
2. App nickname: `postr-web`
3. Do **NOT** enable Firebase Hosting (using Vercel)
4. Copy the `firebaseConfig` object — save it for environment variables

### 2.5 Install Dependencies

```bash
npm install firebase firebase-admin
npm install -D @types/bcryptjs
npm install bcryptjs nanoid zod
```

---

## 3. Firestore Setup

### 3.1 Collection Structure

```
postcards/
  {nanoid}/
    id          : string       # Same as document ID (NanoID)
    mediaUrl    : string       # Firebase Storage download URL
    mediaType   : "image" | "video"
    title       : string       # max 40 chars
    message     : string       # max 120 chars
    toName      : string       # max 60 chars
    fromName    : string       # max 60 chars
    theme       : string       # "minimal-light" | "framed" | "full-bleed"
    expiryAt    : Timestamp | null
    passwordHash: string | null
    createdAt   : Timestamp
    updatedAt   : Timestamp
```

### 3.2 Zod Schema (matches Firestore document)

```typescript
// lib/schemas.ts
import { z } from "zod";

export const createPostcardSchema = z.object({
  mediaUrl: z.string().url("Invalid media URL"),
  mediaType: z.enum(["image", "video"]),
  title: z.string().min(1).max(40),
  message: z.string().min(1).max(120),
  toName: z.string().min(1).max(60),
  fromName: z.string().min(1).max(60),
  theme: z.enum(["minimal-light", "framed", "full-bleed"]).default("minimal-light"),
  expiryAt: z.string().datetime().nullable().optional(),
  password: z.string().min(4).max(100).optional(),
});

export const unlockPostcardSchema = z.object({
  password: z.string().min(1).max(100),
});

export const uploadMetaSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum(["image/jpeg", "image/png", "image/webp", "video/mp4"]),
  fileSize: z.number().positive(),
});

export type CreatePostcardInput = z.infer<typeof createPostcardSchema>;
export type UnlockPostcardInput = z.infer<typeof unlockPostcardSchema>;
export type UploadMetaInput = z.infer<typeof uploadMetaSchema>;
```

### 3.3 TypeScript Types

```typescript
// types/postcard.ts
import { Timestamp } from "firebase-admin/firestore";

export type MediaType = "image" | "video";
export type Theme = "minimal-light" | "framed" | "full-bleed";

export interface PostcardDocument {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  title: string;
  message: string;
  toName: string;
  fromName: string;
  theme: Theme;
  expiryAt: Timestamp | null;
  passwordHash: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Safe version — strip passwordHash before sending to client
export type PostcardPublic = Omit<PostcardDocument, "passwordHash"> & {
  isPasswordProtected: boolean;
};
```

---

## 4. Firebase Storage Setup

### 4.1 Storage Path Convention

```
postcards/{postcardId}/media.{ext}
```

Examples:
- `postcards/abc123/media.jpg`
- `postcards/xyz789/media.mp4`

**Why one file per postcard?** Simplifies rules, prevents accumulation, enforces 1:1 relationship.

### 4.2 Direct Upload vs Signed Upload

| Approach | Pros | Cons |
|---|---|---|
| **Direct client upload** (client SDK) | Simple, no server needed | Cannot enforce server-side auth or size limits reliably |
| **Server-proxied upload** | Full control | File passes through your server — egress costs, slower |
| **Signed upload URL** (recommended ✅) | File goes directly to Storage, server validates metadata first | Slightly more complex to implement |

**postr uses signed upload URLs.** The flow:
1. Client → `POST /api/upload` with file metadata (type, size, name)
2. API validates metadata → generates a signed URL (expires in 5 minutes)
3. Client uploads directly to Firebase Storage using the signed URL
4. Client → `POST /api/postcards` with the resulting Storage path

### 4.3 Generating Signed Upload URLs (Admin SDK)

```typescript
// lib/firebase-storage.ts
import { getStorage } from "firebase-admin/storage";
import { adminApp } from "./firebase-admin";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

export function validateFileSize(
  fileType: string,
  fileSize: number
): { valid: boolean; error?: string } {
  if (fileType.startsWith("video/")) {
    if (fileSize > MAX_VIDEO_SIZE) return { valid: false, error: "Video must be under 25MB" };
  } else {
    if (fileSize > MAX_IMAGE_SIZE) return { valid: false, error: "Image must be under 5MB" };
  }
  return { valid: true };
}

export async function generateSignedUploadUrl(
  path: string,
  contentType: string
): Promise<string> {
  const bucket = getStorage(adminApp).bucket();
  const file = bucket.file(path);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    contentType,
  });

  return url;
}

export function buildStoragePath(postcardId: string, ext: string): string {
  return `postcards/${postcardId}/media.${ext}`;
}

export function buildPublicDownloadUrl(storagePath: string): string {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
  const encoded = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media`;
}
```

---

## 5. Security Rules

### 5.1 Firestore Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Block everything by default
    match /{document=**} {
      allow read, write: if false;
    }

    match /postcards/{postcardId} {

      // READ: Allow only if document exists AND is not expired
      allow get: if
        resource != null &&
        (
          resource.data.expiryAt == null ||
          resource.data.expiryAt > request.time
        );

      // LIST: Deny all — individual lookups only
      allow list: if false;

      // WRITE: Deny all client writes
      // All writes go through Admin SDK via API routes
      allow create, update, delete: if false;
    }
  }
}
```

> ⚠️ **Why deny client writes entirely?**  
> The Admin SDK bypasses Firestore security rules by default. All writes in postr happen through your API routes using the Admin SDK — so client-side write rules are irrelevant. Denying them adds defense-in-depth.

> ⚠️ **Expiry is enforced server-side too** (in the API route). The Firestore rule is an additional safety net, not the primary enforcement point.

### 5.2 Storage Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Block everything by default
    match /{allPaths=**} {
      allow read, write: if false;
    }

    // Allow public reads of postcard media
    match /postcards/{postcardId}/media.{ext} {
      allow read: if true; // Public — served to postcard viewers
      allow write: if false; // All writes via signed URLs (Admin SDK)
    }
  }
}
```

> **Note:** Writes use signed URLs generated by the Admin SDK. Signed URLs bypass Storage security rules — they contain embedded auth. The `allow write: if false` prevents any unauthenticated or client SDK writes.

### 5.3 Deploy Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init (select only Firestore + Storage rules)
firebase init

# Deploy rules only (not hosting)
firebase deploy --only firestore:rules,storage:rules
```

---

## 6. Admin SDK Setup

### 6.1 Generate Service Account Key

1. Firebase Console → Project Settings → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file — store it securely (never commit to git)
4. The JSON contains:
   ```json
   {
     "type": "service_account",
     "project_id": "...",
     "private_key_id": "...",
     "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...",
     "client_email": "...",
     "client_id": "...",
     ...
   }
   ```

### 6.2 Initialize Admin SDK (Singleton Pattern)

```typescript
// lib/firebase-admin.ts
import { getApps, initializeApp, cert, App } from "firebase-admin/app";

function createAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) return existingApps[0]!;

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key comes from env with literal \n — replace to actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminApp = createAdminApp();
```

### 6.3 Firestore Admin Client

```typescript
// lib/firestore.ts
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { adminApp } from "./firebase-admin";

export const db = getFirestore(adminApp);
export { Timestamp };

export async function getPostcard(id: string) {
  const doc = await db.collection("postcards").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as PostcardDocument;
}
```

### 6.4 Why Admin SDK Is Server-Only

The Admin SDK uses your service account private key — exposing it to the client would compromise your entire Firebase project. In Next.js 14:

- Any file in `app/` that is a **Server Component** runs only on the server ✅
- Any file imported by a **Client Component** (`"use client"`) runs in the browser ❌

**Rules:**
- `lib/firebase-admin.ts` → **never** import in a Client Component
- `lib/firestore.ts` → **never** import in a Client Component  
- `lib/firebase-storage.ts` → **never** import in a Client Component

The **client SDK** (`firebase` package) is for real-time listeners — postr does not use it. All data fetching in postr is server-side via Admin SDK.

---

## 7. Environment Variables

### 7.1 `.env.local` (local development only, never committed)

```bash
# Firebase Admin SDK (server-only — NEVER prefix with NEXT_PUBLIC_)
FIREBASE_PROJECT_ID=postr-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@postr-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAK...\n-----END RSA PRIVATE KEY-----\n"

# Firebase Storage Bucket (safe to expose — bucket name only)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=postr-prod.firebasestorage.app

# Firebase Client SDK (safe to expose — these only identify the project)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=postr-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=postr-prod
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Rate limiting (Upstash Redis recommended or Firebase-based fallback)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7.2 `.env.example` (committed — no real values)

```bash
# Firebase Admin SDK — Server only. Obtain from Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Firebase Client SDK — Safe to expose (public config)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Rate limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
```

### 7.3 Critical: Private Key Formatting

The private key in the service account JSON has literal `\n` characters. When stored in environment variables:

```
# ❌ WRONG — will fail silently
FIREBASE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAK...
-----END RSA PRIVATE KEY-----

# ✅ CORRECT — single line with \n escaped
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAK...\n-----END RSA PRIVATE KEY-----\n"
```

In code, always replace `\\n` → `\n`:
```typescript
privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
```

---

## 8. API Route Integration

### 8.1 Upload Signed URL — `POST /api/upload`

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { uploadMetaSchema } from "@/lib/schemas";
import {
  validateFileSize,
  generateSignedUploadUrl,
  buildStoragePath,
  buildPublicDownloadUrl,
} from "@/lib/firebase-storage";
import { ratelimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
};

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = headers().get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = uploadMetaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload metadata", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { fileType, fileSize } = parsed.data;
  const ext = ALLOWED_TYPES[fileType];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: JPG, PNG, WebP, MP4." },
      { status: 400 }
    );
  }

  const sizeCheck = validateFileSize(fileType, fileSize);
  if (!sizeCheck.valid) {
    return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
  }

  const postcardId = nanoid(12);
  const path = buildStoragePath(postcardId, ext);

  try {
    const uploadUrl = await generateSignedUploadUrl(path, fileType);
    const publicUrl = buildPublicDownloadUrl(path);
    return NextResponse.json(
      { uploadUrl, publicUrl, postcardId, storagePath: path },
      { status: 200 }
    );
  } catch (err) {
    console.error("Storage signed URL error:", err);
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
```

### 8.2 Create Postcard — `POST /api/postcards`

```typescript
// app/api/postcards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { Timestamp } from "firebase-admin/firestore";
import { createPostcardSchema } from "@/lib/schemas";
import { db } from "@/lib/firestore";
import { ratelimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const ip = headers().get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createPostcardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const {
    mediaUrl, mediaType, title, message,
    toName, fromName, theme, expiryAt, password,
  } = parsed.data;

  const id = nanoid(12);
  const now = Timestamp.now();

  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  const doc = {
    id,
    mediaUrl,
    mediaType,
    title,
    message,
    toName,
    fromName,
    theme,
    expiryAt: expiryAt ? Timestamp.fromDate(new Date(expiryAt)) : null,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await db.collection("postcards").doc(id).set(doc);
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error("Firestore write error:", err);
    return NextResponse.json({ error: "Failed to create postcard" }, { status: 500 });
  }
}
```

### 8.3 Get Postcard — `GET /api/postcards/[id]`

```typescript
// app/api/postcards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firestore";
import { PostcardPublic } from "@/types/postcard";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || id.length > 32) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const doc = await db.collection("postcards").doc(id).get();

  if (!doc.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = doc.data()!;

  // Server-side expiry enforcement
  if (data.expiryAt !== null) {
    const expiry = data.expiryAt as Timestamp;
    if (expiry.toDate() < new Date()) {
      return NextResponse.json({ error: "This postcard has expired" }, { status: 410 });
    }
  }

  const postcard: PostcardPublic = {
    id: data.id,
    mediaUrl: data.mediaUrl,
    mediaType: data.mediaType,
    title: data.title,
    message: data.message,
    toName: data.toName,
    fromName: data.fromName,
    theme: data.theme,
    expiryAt: data.expiryAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    isPasswordProtected: data.passwordHash !== null,
    // passwordHash is NEVER included in the response
  };

  return NextResponse.json(postcard, { status: 200 });
}
```

### 8.4 Unlock Postcard — `POST /api/postcards/[id]/unlock`

```typescript
// app/api/postcards/[id]/unlock/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { unlockPostcardSchema } from "@/lib/schemas";
import { db } from "@/lib/firestore";
import { ratelimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = headers().get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = unlockPostcardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const doc = await db.collection("postcards").doc(id).get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = doc.data()!;

  if (!data.passwordHash) {
    return NextResponse.json({ error: "Not password protected" }, { status: 400 });
  }

  const match = await bcrypt.compare(parsed.data.password, data.passwordHash);

  if (!match) {
    // Generic error — don't reveal reason
    return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
  }

  // Return a short-lived unlock token (or just confirm unlock, use session/cookie)
  // Simplest stateless approach: set a signed cookie
  const response = NextResponse.json({ unlocked: true }, { status: 200 });
  response.cookies.set(`unlock_${id}`, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 2, // 2 hours
    path: `/p/${id}`,
  });

  return response;
}
```

---

## 9. Upload Flow Architecture

### 9.1 Complete Client-Side Flow

```typescript
// hooks/usePostcardUpload.ts
"use client";

import { useState } from "react";
import { compressImage } from "@/lib/compress"; // See mobile section

interface UploadResult {
  postcardId: string;
  publicUrl: string;
  storagePath: string;
}

export function usePostcardUpload() {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<UploadResult | null> {
    setError(null);
    setProgress(0);

    // Step 1: Client-side compress if image
    const processedFile = file.type.startsWith("image/")
      ? await compressImage(file)
      : file;

    setProgress(10);

    // Step 2: Get signed upload URL from API
    const metaRes = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: processedFile.name,
        fileType: processedFile.type,
        fileSize: processedFile.size,
      }),
    });

    if (!metaRes.ok) {
      const { error } = await metaRes.json();
      setError(error ?? "Upload failed");
      return null;
    }

    const { uploadUrl, publicUrl, postcardId, storagePath } = await metaRes.json();

    setProgress(30);

    // Step 3: Upload directly to Firebase Storage via signed URL
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": processedFile.type },
      body: processedFile,
    });

    if (!uploadRes.ok) {
      setError("Storage upload failed. Please try again.");
      return null;
    }

    setProgress(100);
    return { postcardId, publicUrl, storagePath };
  }

  return { upload, progress, error };
}
```

### 9.2 Create Postcard (after upload)

```typescript
// Client component creates the postcard document after upload
async function createPostcard(data: CreatePostcardInput): Promise<string | null> {
  const res = await fetch("/api/postcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? "Failed to create postcard");
  }

  const { id } = await res.json();
  return id;
}
```

---

## 10. Expiry Logic

### 10.1 Setting Expiry

Expiry is an ISO 8601 datetime string (or null for no expiry):

```typescript
// Client: user selects duration
const expiryOptions = [
  { label: "Never", value: null },
  { label: "24 hours", value: () => new Date(Date.now() + 86400000).toISOString() },
  { label: "7 days", value: () => new Date(Date.now() + 604800000).toISOString() },
  { label: "30 days", value: () => new Date(Date.now() + 2592000000).toISOString() },
];
```

### 10.2 Server-Side Expiry Enforcement

```typescript
// In GET /api/postcards/[id] — always check before returning
if (data.expiryAt !== null) {
  const expiry = (data.expiryAt as Timestamp).toDate();
  if (expiry < new Date()) {
    return NextResponse.json(
      { error: "This postcard has expired", expired: true },
      { status: 410 } // 410 Gone — semantically correct
    );
  }
}
```

### 10.3 Displaying Time Remaining

```typescript
// lib/expiry.ts
export function getExpiryStatus(expiryAt: FirebaseTimestamp | null): {
  isExpired: boolean;
  timeLeft: string | null;
} {
  if (!expiryAt) return { isExpired: false, timeLeft: null };

  const now = new Date();
  const expiry = new Date(expiryAt.seconds * 1000);

  if (expiry < now) return { isExpired: true, timeLeft: null };

  const diff = expiry.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return { isExpired: false, timeLeft: `${days}d left` };
  if (hours > 0) return { isExpired: false, timeLeft: `${hours}h left` };

  const minutes = Math.floor(diff / (1000 * 60));
  return { isExpired: false, timeLeft: `${minutes}m left` };
}
```

### 10.4 Cleanup Expired Documents

Firebase does not auto-delete documents. Use a scheduled Cloud Function or a cron job via Vercel Cron:

```typescript
// app/api/cron/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db, Timestamp } from "@/lib/firestore";
import { getStorage } from "firebase-admin/storage";
import { adminApp } from "@/lib/firebase-admin";

// Protect with a shared secret
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Timestamp.now();
  const expired = await db
    .collection("postcards")
    .where("expiryAt", "<=", now)
    .limit(50) // process in batches
    .get();

  const bucket = getStorage(adminApp).bucket();
  const batch = db.batch();

  for (const doc of expired.docs) {
    const { id } = doc.data();
    // Delete Storage file
    try {
      await bucket.deleteFiles({ prefix: `postcards/${id}/` });
    } catch {
      // File may already be gone
    }
    batch.delete(doc.ref);
  }

  await batch.commit();
  return NextResponse.json({ deleted: expired.size }, { status: 200 });
}
```

**Vercel Cron configuration (`vercel.json`):**
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

---

## 11. Password Protection

### 11.1 Hashing on Write

```typescript
// In POST /api/postcards
const passwordHash = password
  ? await bcrypt.hash(password, 12) // cost factor 12 — good balance of security/speed
  : null;
```

**Never store plaintext passwords. Never use MD5/SHA1. bcrypt with cost 12 is correct.**

### 11.2 Verification on Unlock

```typescript
// In POST /api/postcards/[id]/unlock
const match = await bcrypt.compare(parsed.data.password, data.passwordHash);
```

### 11.3 Client-Side Gate

```typescript
// app/p/[id]/page.tsx — Server Component
import { cookies } from "next/headers";

export default async function PostcardPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = cookies();
  const isUnlocked = cookieStore.get(`unlock_${id}`)?.value === "1";

  // Fetch postcard (server-side)
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/postcards/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const { error, expired } = await res.json();
    if (expired) return <ExpiredView />;
    return <NotFoundView />;
  }

  const postcard = await res.json();

  if (postcard.isPasswordProtected && !isUnlocked) {
    return <PasswordGate id={id} />;
  }

  return <PostcardView postcard={postcard} />;
}
```

### 11.4 Password Gate Component

```typescript
// components/PasswordGate.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PasswordGate({ id }: { id: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/postcards/${id}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Incorrect password. Try again.");
      return;
    }

    // Cookie is set by server — refresh to show postcard
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        autoFocus
      />
      {error && <p>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Checking..." : "Unlock"}
      </button>
    </form>
  );
}
```

---

## 12. Rate Limiting Strategy

### 12.1 Recommended: Upstash Redis (Edge-Compatible)

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute per IP
  analytics: false,
  prefix: "postr:rl",
});

export const strictRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"), // stricter for sensitive routes
  analytics: false,
  prefix: "postr:rl:strict",
});
```

**Apply to routes:**
- `/api/upload` → standard (10/min)  
- `/api/postcards` (POST) → standard (10/min)  
- `/api/postcards/[id]/unlock` → strict (3/min) — brute force protection

### 12.2 Firebase-Only Fallback (No Redis)

If you cannot use Upstash, use Firestore-based rate limiting:

```typescript
// lib/ratelimit-firebase.ts
import { db, Timestamp } from "@/lib/firestore";
import { FieldValue } from "firebase-admin/firestore";

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const key = `ratelimit_${ip.replace(/[:.]/g, "_")}`;
  const ref = db.collection("_ratelimits").doc(key);
  const now = Date.now();

  const result = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);

    if (!doc.exists) {
      tx.set(ref, { count: 1, windowStart: now, expireAt: Timestamp.fromMillis(now + 86400000) });
      return { allowed: true };
    }

    const { count, windowStart } = doc.data()!;

    if (now - windowStart > WINDOW_MS) {
      // Reset window
      tx.update(ref, { count: 1, windowStart: now });
      return { allowed: true };
    }

    if (count >= MAX_REQUESTS) {
      return { allowed: false };
    }

    tx.update(ref, { count: FieldValue.increment(1) });
    return { allowed: true };
  });

  return result;
}
```

> ⚠️ Firestore transactions add latency. Upstash Redis is strongly preferred for rate limiting.

---

## 13. Mobile Optimization

### 13.1 Client-Side Image Compression

```typescript
// lib/compress.ts
const MAX_DIMENSION = 1920;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file); // fallback to original
          resolve(new File([blob], file.name, { type: "image/webp" }));
        },
        "image/webp",
        QUALITY
      );
    };

    img.onerror = () => resolve(file); // fallback
    img.src = url;
  });
}
```

### 13.2 Video Size Enforcement

```typescript
// Validate before even attempting upload
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

if (file.type.startsWith("video/") && file.size > MAX_VIDEO_SIZE) {
  setError("Video must be under 25MB. Compress it first.");
  return;
}
```

### 13.3 Upload Progress on Slow Networks

Firebase Storage signed URLs use `PUT` — native `fetch` doesn't support progress. Use `XMLHttpRequest` for progress tracking:

```typescript
// lib/uploadWithProgress.ts
export function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    xhr.send(file);
  });
}
```

### 13.4 Accept/Capture Attributes for Mobile

```tsx
{/* Opens camera directly on mobile */}
<input
  type="file"
  accept="image/jpeg,image/png,image/webp,video/mp4"
  capture="environment"
  onChange={handleFileChange}
/>
```

---

## 14. Deployment Guide (Vercel + Firebase)

### 14.1 Step-by-Step

1. **Push to GitHub** (ensure `.env.local` is in `.gitignore`)

2. **Deploy to Vercel**
   - Import repository in [vercel.com](https://vercel.com)
   - Framework preset: **Next.js**
   - Build command: `next build`
   - Output directory: `.next` (auto-detected)

3. **Set Environment Variables in Vercel**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.example` with real values
   - For `FIREBASE_PRIVATE_KEY`: paste the full key **exactly as it appears in the JSON**, including `-----BEGIN RSA PRIVATE KEY-----` — Vercel handles newlines correctly via the UI

4. **Deploy Firebase Rules**
   ```bash
   firebase login
   firebase deploy --only firestore:rules,storage:rules
   ```

5. **Verify Functions**
   - Test `POST /api/upload` → receives `uploadUrl`
   - Upload to `uploadUrl` with `PUT`
   - Test `POST /api/postcards` → receives `id`
   - Test `GET /p/{id}` → renders postcard

### 14.2 Vercel Edge Runtime Consideration

The Firebase Admin SDK **does not work on Edge Runtime** (it requires Node.js APIs). Ensure all API routes using Admin SDK specify:

```typescript
// At the top of every API route using Admin SDK
export const runtime = "nodejs"; // NOT "edge"
```

Or leave unset — the default in Next.js 14 is `nodejs`.

### 14.3 Firebase Rules Deployment CI (Optional)

```yaml
# .github/workflows/deploy-rules.yml
name: Deploy Firebase Rules
on:
  push:
    branches: [main]
    paths:
      - "firestore.rules"
      - "storage.rules"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: w9jds/firebase-action@master
        with:
          args: deploy --only firestore:rules,storage:rules
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## 15. Testing Checklist

### 15.1 API Routes

- [ ] `POST /api/upload` rejects oversized images (>5MB)
- [ ] `POST /api/upload` rejects oversized videos (>25MB)
- [ ] `POST /api/upload` rejects invalid MIME types (e.g., `text/html`)
- [ ] `POST /api/upload` returns valid signed URL (can PUT to it successfully)
- [ ] Rate limit triggers after 10 requests in 60 seconds
- [ ] `POST /api/postcards` validates all required fields
- [ ] `POST /api/postcards` rejects title > 40 chars
- [ ] `POST /api/postcards` rejects message > 120 chars
- [ ] `POST /api/postcards` stores `passwordHash`, not plaintext
- [ ] `GET /api/postcards/[id]` returns 404 for non-existent IDs
- [ ] `GET /api/postcards/[id]` returns 410 for expired postcards
- [ ] `GET /api/postcards/[id]` never returns `passwordHash`
- [ ] `POST /api/postcards/[id]/unlock` returns 403 for wrong password
- [ ] `POST /api/postcards/[id]/unlock` sets `unlock_{id}` cookie on success

### 15.2 Storage

- [ ] Signed URL expires after 5 minutes (attempt PUT after 6 min fails)
- [ ] PUT with wrong Content-Type is rejected
- [ ] Client cannot list files in `postcards/` via Storage SDK
- [ ] Overwriting an existing object via a new signed URL is prevented (check Storage rules)

### 15.3 Firestore

- [ ] Client cannot directly write to `postcards` collection
- [ ] Client cannot read an expired document (Firestore rules)
- [ ] Expired documents are cleaned up by cron job

### 15.4 Password Protection

- [ ] Protected postcard shows password gate (not content)
- [ ] Wrong password returns 403
- [ ] Correct password sets cookie, page refreshes to show content
- [ ] Cookie is `httpOnly` and `sameSite: strict`
- [ ] Cookie expires after 2 hours

### 15.5 Expiry

- [ ] Postcard with `expiryAt` in the past returns 410
- [ ] Postcard with `expiryAt: null` is served regardless of time
- [ ] Time remaining displays correctly on postcard view

---

## 16. Production Hardening Checklist

- [ ] Service account key is **not** in source code or git history
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` has no real values
- [ ] Firestore rules deny all client writes
- [ ] Storage rules deny all client writes
- [ ] `passwordHash` never returned in any API response
- [ ] All API routes validate input with Zod before any DB operation
- [ ] Rate limiting applied to all mutation endpoints
- [ ] Strict rate limiting on `/unlock` (brute force protection)
- [ ] `CRON_SECRET` is set and checked in cleanup cron
- [ ] `runtime = "nodejs"` confirmed on Admin SDK routes
- [ ] HTTPS enforced (Vercel default)
- [ ] `secure: true` on cookies in production
- [ ] Error responses don't leak stack traces or internal details
- [ ] Firebase project is on **Blaze plan** (required for Storage signed URLs and Admin SDK)

---

## 17. Cost Estimation

Firebase pricing is based on usage (Blaze plan). Estimated costs for a small-to-medium launch:

| Service | Operation | Free Tier | Cost Beyond |
|---|---|---|---|
| Firestore | Reads | 50,000/day | $0.06 per 100K |
| Firestore | Writes | 20,000/day | $0.18 per 100K |
| Firestore | Deletes | 20,000/day | $0.02 per 100K |
| Storage | Stored data | 1 GB | $0.026/GB/month |
| Storage | Download | 10 GB/month | $0.12/GB |
| Storage | Upload operations | 50,000/month | $0.05 per 10K |

**Rough estimate for 1,000 postcards/month:**
- Writes: ~4,000 (create + metadata) → free tier
- Reads: ~20,000 (views + unlocks) → free tier  
- Storage: ~5GB (images + videos) → ~$0.13/month
- Downloads: ~50GB → ~$6/month

**Total: ~$6–10/month at 1K postcards/month.**

**Cost control tips:**
- Set a [Firebase budget alert](https://console.firebase.google.com/u/0/project/_/settings/general) at $20
- Limit video size to 25MB aggressively (video downloads are expensive)
- Add TTL expiry to most postcards (shorter = less storage cost)
- Enable Cloud Storage lifecycle rules to auto-delete old files

---

## 18. Common Mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| Importing `firebase-admin` in a Client Component | Crashes build or exposes service account key | Only import in API routes and Server Components |
| Not replacing `\\n` in `FIREBASE_PRIVATE_KEY` | `Error: DECODER routines::unsupported` at runtime | `key.replace(/\\n/g, "\n")` |
| Using `test` mode in Firestore | All data publicly readable/writable | Always use `production` mode |
| Not checking expiry server-side (only in Firestore rules) | Stale cached responses bypass rules | Always check in the API route |
| Returning `passwordHash` in API responses | Exposes bcrypt hash — enables offline brute force | Explicitly omit with `Omit<>` type and destructuring |
| Using the Firebase Client SDK for Firestore writes | Cannot enforce server-side logic | Use Admin SDK in API routes only |
| Starting Storage path with `/` | Signed URL generation fails | Path must be `postcards/{id}/media.ext` (no leading slash) |
| Using `edge` runtime with Admin SDK | `ReferenceError: process is not defined` | Set `export const runtime = "nodejs"` |
| Not setting `storageBucket` in Admin SDK init | `Error: Storage bucket not configured` | Always pass `storageBucket` in `initializeApp` |
| Trusting client-provided `postcardId` for uploads | Path traversal or overwrite attacks | Generate ID server-side in `/api/upload`, return to client |

---

## 19. Scaling Considerations

| Concern | Scale Threshold | Solution |
|---|---|---|
| Firestore reads getting expensive | >50K reads/day | Add server-side caching with `unstable_cache` or Redis |
| Storage egress costs | >100GB/month | Use Firebase CDN or Cloudflare Cache for Storage |
| Rate limiting per IP | >100 concurrent users | Upstash Redis horizontal scaling (already handles this) |
| Cold start latency on Admin SDK | >1K req/min on Vercel | Keep functions warm with `keepAlive` or move to Cloud Run |
| Slow bcrypt on unlock | bcrypt cost 12 ~300ms | Acceptable. Don't lower cost factor below 10 |
| Large video uploads | >25MB videos | Implement resumable uploads via Firebase Storage JS SDK instead of signed PUT |
| Expired document accumulation | >100K documents | Move to Firestore TTL policies (currently in preview) or increase cron frequency |

### Caching Strategy

```typescript
// app/p/[id]/page.tsx — cache postcard for 60s
import { unstable_cache } from "next/cache";

const getPostcard = unstable_cache(
  async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/postcards/${id}`);
    if (!res.ok) return null;
    return res.json();
  },
  ["postcard"],
  { revalidate: 60, tags: ["postcard"] }
);
```

> **Do not cache password-protected or expired postcards.** Always re-validate expiry server-side, and invalidate cache via `revalidateTag("postcard")` if manual deletion is added.

---

*POSTR_FIREBASE_IMPLEMENTATION_GUIDE.md — End of Document*  
*Generated: Feb 2026 · postr minimal doctrine*
