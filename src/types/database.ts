// ─────────────────────────────────────────────────────────────
// WEAREMAKERS.PT — Database Types
// Hand-written from schema-v2.sql.
// When you install the Supabase CLI you can replace this with:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
// ─────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'curator' | 'maker' | 'visitor'
export type MarketStatus = 'shadow' | 'scheduled' | 'live' | 'community_live' | 'cancelled'
export type MarketOpenReason = 'curator' | 'admin_override' | 'community_checkin'
export type GemCategory = 'coffee' | 'food' | 'drinks' | 'studio' | 'shop'

// ── Profiles ──────────────────────────────────────────────────
export interface Profile {
  id: string
  role: UserRole
  display_name: string
  slug: string | null
  bio: string | null
  bio_i18n: Record<string, string>
  instagram_handle: string | null
  avatar_url: string | null
  phone: string | null
  city: string
  is_active: boolean
  is_verified: boolean
  verified_since: string | null
  digital_offer: string | null
  created_at: string
  updated_at: string
}

// ── Spaces ────────────────────────────────────────────────────
export interface Space {
  id: string
  name: string
  slug: string
  description: string | null
  description_i18n: Record<string, string>
  address: string | null
  parish: string | null
  city: string
  lat: number
  lng: number
  cover_image_url: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// ── Markets ───────────────────────────────────────────────────
export interface Market {
  id: string
  space_id: string
  curator_id: string | null
  title: string
  description: string | null
  description_i18n: Record<string, string>
  event_date: string          // ISO date string: "2026-04-05"
  starts_at: string           // "09:00:00"
  ends_at: string             // "19:00:00"
  status: MarketStatus
  open_reason: MarketOpenReason | null
  opened_by: string | null
  opened_at: string | null
  admin_override: boolean
  override_note: string | null
  checkin_threshold: number
  is_featured: boolean
  featured_until: string | null
  cover_image_url: string | null
  created_at: string
  updated_at: string
  // Joined relations (optional — present when queried with select)
  space?: Space
  curator?: Profile
}

// ── Attendance ────────────────────────────────────────────────
export interface Attendance {
  id: string
  market_id: string
  maker_id: string
  checked_in_at: string
  checked_out_at: string | null
  stall_label: string | null
  is_verified: boolean
  // Joined
  maker?: Profile
  market?: Market
}

// ── Gems ──────────────────────────────────────────────────────
export interface Gem {
  id: string
  vetted_by: string
  near_space_id: string | null
  name: string
  category: GemCategory
  description: string | null
  description_i18n: Record<string, string>
  address: string | null
  lat: number | null
  lng: number | null
  distance_metres: number | null
  booking_url: string | null
  cover_image_url: string | null
  is_active: boolean
  is_approved: boolean
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  // Joined
  vetted_by_profile?: Profile
}

// ── Curator Featured Makers ───────────────────────────────────
export interface CuratorFeaturedMaker {
  id: string
  curator_id: string
  maker_id: string
  market_id: string | null
  pinned_at: string
  pinned_until: string
  maker?: Profile
  curator?: Profile
}

// ── Journal ───────────────────────────────────────────────────
// These types back the `journal_articles` table added in the journal migration.
export interface JournalArticle {
  id: string
  slug: string                // URL path: /journal/the-arroios-maker-loop
  title: string
  kicker: string              // e.g. "NEIGHBORHOOD LOOPS"
  dek: string                 // Sub-headline / standfirst
  lede: string                // Opening paragraph (displayed large)
  body_md: string             // Full article body in Markdown
  pull_quote: string | null
  author_name: string
  cover_image_url: string | null
  featured_makers: string[]   // Array of maker slugs mentioned
  tags: string[]
  is_published: boolean
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

// ── View: live_market_makers ──────────────────────────────────
export interface LiveMarketMaker {
  market_id: string
  market_title: string
  market_status: MarketStatus
  starts_at: string
  ends_at: string
  space_id: string
  space_name: string
  space_address: string
  lat: number
  lng: number
  maker_id: string
  maker_name: string
  maker_slug: string | null
  instagram_handle: string | null
  avatar_url: string | null
  is_verified: boolean
  digital_offer: string | null
  stall_label: string | null
  checked_in_at: string
  attendance_verified: boolean
}

// ── Auth helpers ──────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string | null
  profile: Profile | null
}
