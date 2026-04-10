# Organigram Label Generator

A full-stack labelling operations tool built with Next.js 14, Supabase, and Claude AI.

---

## Features
- AI-powered label generation from WO + spec sheet screenshots
- Brightstock (BS) and Mastercase (MC) label previews
- WO Tracker — full history of every label printed
- Mismatch Log — tracks every lot/potency discrepancy caught
- SKU Master Table — all SKUs with label type, file source, printer profile
- Dashboard with daily/weekly stats
- PIN-based team authentication

---

## Tech Stack
- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** (PostgreSQL) — database, free tier
- **Anthropic Claude API** — AI image reading (claude-opus-4-5)
- **Tailwind CSS** — styling
- **Vercel** — deployment

---

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
4. Go to **Settings → API** and copy:
   - Project URL
   - anon/public key
   - service_role key

### 3. Get Anthropic API key
1. Go to https://console.anthropic.com
2. Create an API key

### 4. Configure environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and fill in all values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=sk-ant-...
APP_PIN=your_team_pin
NEXTAUTH_SECRET=any_random_string_32_chars
```

### 5. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 6. Deploy to Vercel
1. Push this project to GitHub
2. Go to https://vercel.com → Import your GitHub repo
3. Add all environment variables from `.env.local` in Vercel dashboard
4. Deploy

---

## How to Use

### Generate a Label
1. Go to **Generate Label**
2. Upload a screenshot of your WO from Veeva Vault
3. Upload a screenshot of your spec sheet
4. Select label type: BS, Mastercase, or Both
5. Click **Extract data from screenshots** — Claude reads both images
6. Verify all fields — especially lot # and potency (highlighted in green)
7. Click **Generate Label** → preview appears and WO is saved to tracker
8. Click **Print Label** → clean print window opens

### Log a Mismatch
When you catch a discrepancy between WO and extracted data:
1. Note the field that doesn't match
2. Go to **Mismatches** page and it will be logged automatically when you correct and proceed

### SKU Master Table
Add all your SKUs with their label type, stock size, printer profile, and file location.
This becomes your reference for every WO.

---

## File Structure
```
app/
  page.tsx              — Dashboard
  generate/page.tsx     — Label generator (main tool)
  tracker/page.tsx      — WO history log
  mismatches/page.tsx   — Mismatch log
  skus/page.tsx         — SKU master table
  login/page.tsx        — PIN login
  api/
    extract/route.ts    — Claude AI image extraction
    labels/route.ts     — WO CRUD
    mismatches/route.ts — Mismatch CRUD
    skus/route.ts       — SKU CRUD
    stats/route.ts      — Dashboard stats
    auth/route.ts       — PIN verification
components/
  Nav.tsx               — Sidebar navigation
  AppLayout.tsx         — Layout wrapper
  LabelPreview.tsx      — BS + MC label renderer
lib/
  types.ts              — TypeScript types
  supabase.ts           — Supabase client
  auth.ts               — Session utilities
supabase/
  schema.sql            — Database schema (run once)
```

---

## Customization

### Change team PIN
Update `APP_PIN` in your Vercel environment variables.

### Add team members
Edit `USERS` array in `lib/auth.ts`.

### Customize label layout
Edit `LabelPreview.tsx` — the BS and MC label components use inline styles matching your exact Organigram format.

### Add more SKUs
Use the SKU Master Table in the app, or add rows directly to Supabase.
