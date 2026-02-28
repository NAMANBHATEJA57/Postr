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
│  • No secrets, no DB access          → Signed R2 presigned URLs  │
│  • Calls server API only            • POST /api/postcards        │
│                                      → Create postcard (Prisma)  │
│                                     • GET  /api/postcards/:id    │
│                                      → Fetch postcard (auth)     │
│                                     • POST /api/postcards/:id/unlock
│                                      → Verify password, JWT      │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    Cloudflare R2 (images) + SQLite (postcards)
```

- **Client** — Pure frontend. Only env: `NEXT_PUBLIC_API_URL`. No secrets.
- **Server** — All business logic: validation, password hashing (bcrypt), JWT, rate limiting, R2 presigned URLs, Prisma DB.
- **Storage** — Cloudflare R2 for media (10GB free, unlimited egress). SQLite for postcard metadata.

---

## Quick start

### 1. Prerequisites

- Node.js 18+
- Cloudflare account ([dash.cloudflare.com](https://dash.cloudflare.com))

### 2. Cloudflare R2 setup

1. In Cloudflare Dashboard, go to **R2 Object Storage** → **Create bucket** (e.g. `postr-uploads`)
2. Enable **Allow public access** on the bucket → copy the public URL (e.g. `https://pub-xxxxxxxxxx.r2.dev`)
3. Go to **R2 → Manage R2 API Tokens** → **Create API token** with Object Read & Write
4. Copy **Account ID**, **Access Key ID**, and **Secret Access Key**
5. Configure **CORS** on the bucket. Either:
   - **Dashboard:** Bucket → Settings → CORS policy → Add policy, paste:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["Content-Type"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
   - **CLI:** `cd server && npx tsx scripts/set-r2-cors.ts` (uses your `.env`)

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
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="postr-uploads"
R2_PUBLIC_URL="https://pub-xxxxxxxxxx.r2.dev"
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
│   │   ├── lib/            # R2, Prisma, JWT, bcrypt, schemas
│   │   └── routes/         # upload, postcards, unlock
│   └── prisma/             # Schema + migrations
│
├── storage.rules          # (legacy; R2 uses CORS instead)
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

## Cloudflare R2

- **Free tier:** 10 GB storage, 1M writes, 10M reads/month, unlimited egress
- Uploads use presigned PUT URLs (client uploads directly to R2)
- Public read via `R2_PUBLIC_URL` (r2.dev subdomain or custom domain)
