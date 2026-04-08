# WEAREMAKERS.PT — Deploy Guide
**From zip to live URL in ~45 minutes.**

---

## Step 1 — Supabase database (10 min)

1. Go to **supabase.com** → your project `ojtjyisqtirgonteobsa`
2. Click **SQL Editor** → **New query**
3. Copy the entire contents of `wearemakers-schema-v2.sql` (in the outputs folder)
4. Paste and click **Run**
5. You should see: `SCHEMA COMPLETE — WEAREMAKERS.PT v2.0`

If you get errors about types already existing, run this first:
```sql
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS market_status CASCADE;
DROP TYPE IF EXISTS market_open_reason CASCADE;
DROP TYPE IF EXISTS gem_category CASCADE;
```
Then re-run the schema.

---

## Step 2 — GitHub (5 min)

1. Create a new **private** repository at github.com called `wearemakers-pt`
2. On your computer, unzip this file
3. Open Terminal in the `wearemakers` folder and run:

```bash
git init
git add .
git commit -m "initial production build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wearemakers-pt.git
git push -u origin main
```

---

## Step 3 — Vercel (10 min)

1. Go to **vercel.com** → Add New Project
2. Import from GitHub → select `wearemakers-pt`
3. Framework: **Next.js** (auto-detected)
4. Add these environment variables (copy from `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DEEPL_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` → set to your domain once you have it
5. Click **Deploy**
6. Wait ~2 minutes → you'll get a `.vercel.app` URL

---

## Step 4 — Custom domain (10 min)

1. In Vercel project settings → **Domains** → Add `wearemakers.pt`
2. Copy the nameservers Vercel gives you
3. Go to your domain registrar → update nameservers
4. DNS propagates in 5–30 min
5. Update `NEXT_PUBLIC_SITE_URL` env var in Vercel to `https://wearemakers.pt`
6. Redeploy (or push a commit)

---

## Step 5 — First maker account (5 min)

1. Go to your live URL `/auth/register`
2. Register with your email, select role: **Maker**
3. Go to Supabase Studio → Table Editor → `profiles`
4. Find your row, change `role` to `admin`
5. Now you can log in and see the admin-capable maker dashboard
6. Go to `/dashboard/maker` and test a check-in

---

## Verify everything works

- [ ] Homepage shows at `/` with greeting and "0 MARKETS OPEN" (no markets yet)
- [ ] `/markets` loads without error
- [ ] `/brands` loads without error
- [ ] `/journal` shows journal index
- [ ] `/auth/register` creates an account
- [ ] `/dashboard/maker` shows the maker portal
- [ ] Maker can toggle LIVE (check-in)
- [ ] After check-in, homepage shows 1 market open

---

## Add your first market (via Supabase Studio)

Until the admin dashboard UI is built, create markets directly:

```sql
-- Get a space ID first
SELECT id, name FROM spaces;

-- Create a market (replace the space_id)
INSERT INTO markets (space_id, title, event_date, starts_at, ends_at, status)
VALUES (
  'PASTE_SPACE_ID_HERE',
  'Mercado LX Factory',
  CURRENT_DATE,
  '10:00',
  '20:00',
  'live'
);
```

---

## Contacts
- espacos@wearemakers.pt
- juntas@wearemakers.pt
- info@wearemakers.pt
