# postr

A calm, minimal digital postcard. Send a moment to someone you care about.

---

## What is postr?

**postr** lets you create and share digital postcards as a link. No accounts, no sign-up—just compose a moment (photo or video + message), add optional password protection and expiry, and share the link.

**Flow:**
1. **Create** — Upload a photo/video, write a title and message, choose a theme (Minimal, Framed, Full Bleed), set optional expiry and password
2. **Share** — Copy the link and send it to the recipient
3. **Reveal** — Recipient opens the link, optionally enters the password, taps the envelope animation, and sees the postcard

---

## How it works

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT (Next.js)                    SERVER (Express)             │
│  localhost:3000                      localhost:4000               │
│                                                                  │
│  • Landing, Create, View pages      • POST /api/upload           │
│  • No secrets, no DB access          → Signed Firebase Storage   │
│  • Calls server API only            • POST /api/postcards        │
│                                      → Create postcard (Prisma)  │
│                                     • GET  /api/postcards/:id    │
│                                      → Fetch postcard (auth)     │
│                                     • POST /api/postcards/:id/unlock
│                                      → Verify password, JWT      │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    Firebase Storage (images) + SQLite (postcards)
```

- **Client** — Pure frontend. Only env: `NEXT_PUBLIC_API_URL`. No secrets.
- **Server** — All business logic: validation, password hashing (bcrypt), JWT, rate limiting, Firebase Storage signed URLs, Prisma DB.
- **Storage** — Firebase Cloud Storage for media (free tier). SQLite for postcard metadata.

---

## Quick start

### 1. Prerequisites

- Node.js 18+
- Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

### 2. Firebase setup

1. Create a Firebase project
2. Enable **Storage** (Production mode)
3. Go to **Project Settings → Service accounts → Generate new private key**
4. Save the JSON as `server/firebase-service-account.json`

### 3. Environment

**client/.env**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**server/.env**
```
PORT=4000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
FIREBASE_SERVICE_ACCOUNT_PATH="./firebase-service-account.json"
FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
CLIENT_ORIGIN="http://localhost:3000"
```

### 4. Install and run

```bash
npm install
cd server && npx prisma migrate dev && cd ..
npm run dev
```

- **Client:** http://localhost:3000  
- **Server:** http://localhost:4000  

---

## Project structure

```
postr/
├── client/                 # Next.js frontend
│   ├── app/                # Pages (/, /create, /p/[id])
│   ├── components/         # UI, create form, postcard, envelope
│   ├── themes/             # Minimal, Framed, Full Bleed
│   ├── types/              # TypeScript types
│   └── lib/api.ts          # API URL helper (no secrets)
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── index.ts        # Express app, CORS, routes
│   │   ├── lib/            # Firebase, Prisma, JWT, bcrypt, schemas
│   │   └── routes/         # upload, postcards, unlock
│   └── prisma/             # Schema + migrations
│
├── storage.rules          # Firebase Storage rules
└── package.json            # Monorepo scripts
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run client + server together |
| `npm run dev:client` | Run client only (port 3000) |
| `npm run dev:server` | Run server only (port 4000) |
| `npm run build` | Build client and server |
| `npm run db:migrate` | Run Prisma migrations |

---

## Firebase Storage rules

Deploy rules:

```bash
firebase deploy --only storage
```

Rules file: `storage.rules` — allows public read of `uploads/*`, no direct client writes (uploads use signed URLs from the server).
