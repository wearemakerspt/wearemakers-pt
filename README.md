# WEAREMAKERS.PT — Production Next.js App

Independent maker economy platform for Lisbon street markets.  
**Stack:** Next.js 15 · React 19 · Tailwind CSS v4 · Supabase · TypeScript

---

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── actions.ts          ← Server Actions: signIn, signUp, signOut
│   │   ├── callback/route.ts   ← OAuth + magic-link callback handler
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── journal/
│   │   ├── page.tsx            ← Journal index (ISR, revalidate 5min)
│   │   └── [slug]/
│   │       ├── page.tsx        ← Article page (ISR + generateStaticParams)
│   │       └── not-found.tsx
│   ├── layout.tsx              ← Root layout, global metadata
│   ├── page.tsx                ← Root redirect (role-aware)
│   ├── sitemap.ts              ← Dynamic sitemap.xml
│   ├── robots.ts               ← robots.txt
│   ├── error.tsx               ← Global error boundary
│   └── not-found.tsx           ← Global 404
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx       ← Password + magic-link tabs (client)
│   │   └── RegisterForm.tsx    ← Role selector + sign-up form (client)
│   ├── journal/
│   │   ├── ArticleBody.tsx     ← Markdown → JSX (server, zero client JS)
│   │   └── MakersInLoop.tsx    ← Makers section + circuit star (client)
│   └── ui/
│       └── SiteHeader.tsx      ← Shared masthead (server)
├── lib/
│   ├── supabase/
│   │   ├── client.ts           ← Browser client (for Client Components)
│   │   ├── server.ts           ← Server client (for Server Components)
│   │   └── middleware.ts       ← Session refresh for Next.js middleware
│   ├── queries/
│   │   ├── journal.ts          ← getAllArticles, getArticleBySlug, getMakersForArticle
│   │   └── auth.ts             ← getCurrentUser, getProfileBySlug
│   └── utils.ts                ← formatDate, getStatusMeta, absoluteUrl, slugify
├── types/
│   └── database.ts             ← All TypeScript types from schema-v2.sql
middleware.ts                   ← Session refresh + protected route guard
supabase/
└── migrations/
    └── 20260401_journal.sql    ← journal_articles table + RLS + seed data
```

---

## 1. Supabase Setup

### 1a. Create a project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose the **Frankfurt (eu-central-1)** region (closest to Lisbon)
3. Save your database password somewhere safe

### 1b. Run the schema
In your Supabase dashboard → **SQL Editor**:

1. First, paste and run the full contents of `wearemakers-schema-v2.sql`  
   *(This creates all tables, RLS policies, triggers, views, and the Lisbon spaces seed)*
2. Then paste and run `supabase/migrations/20260401_journal.sql`  
   *(This creates the `journal_articles` table and seeds 3 launch articles)*

### 1c. Configure Auth
In **Authentication → Settings**:

- **Site URL:** `https://wearemakers.pt` (or `http://localhost:3000` for dev)
- **Redirect URLs:** Add `https://wearemakers.pt/auth/callback`  
  and `http://localhost:3000/auth/callback`
- **Email confirmations:** Enable (strongly recommended for production)
- **JWT expiry:** 3600 (1 hour) — refresh tokens keep sessions alive

### 1d. Get your API keys
**Settings → API**:
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Local Development

```bash
# Install dependencies
npm install

# Create your environment file
cp .env.local.example .env.local
# → Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run dev server (Turbopack)
npm run dev
# → http://localhost:3000
```

The app will redirect to `/journal` by default. You should see the 3 seeded articles immediately.

### Create your first admin account
1. Go to `http://localhost:3000/auth/register`
2. Sign up with your email
3. In Supabase Dashboard → Table Editor → `profiles` → find your row → set `role` to `admin`

---

## 3. How Auth Works

```
User submits login form
       ↓
Server Action (actions.ts)
       ↓
supabase.auth.signInWithPassword()
       ↓  (success)
revalidatePath() + redirect() to dashboard
       ↓
middleware.ts runs on every request
       ↓
updateSession() refreshes JWT silently
       ↓
Server Components call createClient() → read session from cookies
```

**Magic link flow:**  
`signInWithMagicLink()` → Supabase sends email → User clicks link →  
`/auth/callback?code=xxx` → `exchangeCodeForSession()` → redirect to dashboard

**OAuth flow (when you add Instagram/Google):**  
`supabase.auth.signInWithOAuth()` → provider → `/auth/callback?code=xxx` → same callback handler

**Protected routes:**  
`middleware.ts` checks `auth.getUser()` on every request to `/dashboard/*`, `/maker/*`, `/curator/*`.  
Unauthenticated requests are redirected to `/auth/login?next=<original-path>`.

---

## 4. How the Journal Works

### Data flow
```
/journal (ISR, revalidate: 300s)
    ↓
getAllArticles() — Server Component
    ↓
Supabase: SELECT * FROM journal_articles WHERE is_published = true
    ↓
Renders article list — zero client JS for the list itself
```

```
/journal/[slug] (ISR, generateStaticParams pre-builds all published slugs)
    ↓
getArticleBySlug(slug) + getMakersForArticle(featured_makers[])
    ↓
ArticleBody.tsx renders Markdown → paragraphs (Server Component, zero JS)
MakersInLoop.tsx handles starring (Client Component, minimal JS)
    ↓
JSON-LD structured data injected for Google
```

### Publishing an article
In Supabase → Table Editor → `journal_articles`:
- Set `is_published = true` → the `trg_journal_publish` trigger auto-sets `published_at = NOW()`
- The page will appear within 5 minutes (ISR revalidation window)
- For immediate refresh: call `revalidatePath('/journal')` from an admin action

### Article format
The `body_md` column accepts Markdown:
```markdown
Regular paragraph text here.

## Section Heading

Another paragraph.

> Blockquote text here.
```

`ArticleBody.tsx` handles `##` headings, `###` sub-headings, `>` blockquotes, and plain paragraphs. For full Markdown (tables, lists, inline code), swap it for `react-markdown` or `next-mdx-remote`.

---

## 5. SEO Architecture

| Page | Strategy | Revalidation |
|------|----------|--------------|
| `/journal` | ISR | 5 minutes |
| `/journal/[slug]` | ISR + `generateStaticParams` | 5 minutes |
| `/sitemap.xml` | Dynamic, generated at request | On-demand |
| `/robots.txt` | Static generation | At build |

**Structured data:** Each article page injects `Article` JSON-LD schema, which enables Google's article rich results (headline, date, author, image).

**Canonical URLs:** Every page sets `alternates.canonical` to prevent duplicate content penalties.

---

## 6. Deploy to Vercel

```bash
# Push to GitHub first, then:
npx vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# NEXT_PUBLIC_SITE_URL=https://wearemakers.pt
```

Add your production domain to Supabase Auth redirect URLs before going live.

---

## 7. What's Next

These features are ready to build on top of this foundation:

| Feature | Files to create |
|---------|-----------------|
| Maker dashboard | `src/app/dashboard/maker/page.tsx` |
| Curator dashboard | `src/app/dashboard/curator/page.tsx` |
| Public maker profiles | `src/app/makers/[slug]/page.tsx` |
| Live market feed | `src/app/markets/page.tsx` (with Supabase Realtime) |
| Gem discovery | `src/app/gems/page.tsx` |
| Check-in API | `src/app/api/checkin/route.ts` |
| Admin panel | `src/app/dashboard/admin/page.tsx` |

The data layer (`src/lib/queries/`) is the right place to add new Supabase queries as each section is built. All types are already defined in `src/types/database.ts`.
