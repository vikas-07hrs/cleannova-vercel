# Cleannova – Vercel Ready

Property & Home Services website with Express API + multi-page frontend.

## Deploy to Vercel (3 ways)

### 1. Vercel Website (easiest)

1. Push this folder to a **GitHub** repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import the repo
4. Framework: **Other**
5. Click **Deploy**

### 2. Vercel CLI

```bash
npm i -g vercel
cd cleannova-vercel
vercel
```

Follow prompts → login → deploy.

### 3. Local test before deploy

```bash
npm install
npm start
# open http://localhost:3000
```

> Note: Local `npm start` runs the Express app directly.  
> On Vercel the same `api/index.js` runs as a serverless function.

## Environment Variables (Vercel Dashboard)

| Name | Required | Description |
|------|----------|-------------|
| `SUPABASE_URL` | No | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role key (server only) |
| `ADMIN_SECRET` | No | Secret for GET /api/quotes |

Without Supabase keys the app runs in **demo mode** (quotes stored in memory).

## Project structure

```
├── api/
│   └── index.js          ← Express app (Vercel serverless)
├── public/
│   ├── index.html        ← Home
│   ├── dry-cleaning.html
│   ├── home-cleaning.html
│   ├── maintenance.html
│   ├── electrical.html
│   ├── plumbing.html
│   └── decorating.html
├── package.json
├── vercel.json
└── .env.example
```

## Features

- Multi-page service pages
- Quote form → API → Supabase (or demo)
- EN / NL language toggle (home page)
- Cookie banner + Privacy / Cookies / Terms
- Mobile responsive
- Footer: Design by Rakpal.com

## Supabase setup (optional)

1. Create project at supabase.com
2. SQL Editor → run `supabase/schema.sql` (if included) or create `quotes` table
3. Add env vars in Vercel

---

© 2026 Cleannova · Design by [Rakpal.com](https://rakpal.com)
