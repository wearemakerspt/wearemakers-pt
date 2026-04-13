import { createClient } from '@/lib/supabase/server'

// ── Types ──────────────────────────────────────────────────────

export interface BrandSummary {
  id: string
  display_name: string
  slug: string | null
  bio: string | null
  bio_i18n: Record<string, string>
  instagram_handle: string | null
  avatar_url: string | null
  featured_photo_url: string | null
  is_verified: boolean
  digital_offer: string | null
  is_live: boolean
  live_market_name: string | null
}

export interface BrandDetail extends BrandSummary {
  upcoming_markets: UpcomingMarketSlot[]
  gems: BrandGem[]
}

export interface UpcomingMarketSlot {
  market_id: string
  market_title: string
  event_date: string
  starts_at: string
  space_name: string
  space_address: string | null
}

export interface BrandGem {
  id: string
  name: string
  category: string
  description: string | null
  address: string | null
}

// ── Queries ────────────────────────────────────────────────────

/**
 * All maker brands for the directory.
 * Includes live status from today's attendance.
 */
export async function getAllBrands(lang = 'en'): Promise<BrandSummary[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, display_name, slug, bio, bio_i18n,
      instagram_handle, avatar_url, featured_photo_url, is_verified, digital_offer,
      attendance (
        id, checked_out_at,
        market:markets (
          id, title, status, event_date
        )
      )
    `)
    .in('role', ['maker', 'admin'])
    .eq('is_active', true)
    .order('display_name', { ascending: true })

  if (error || !data) return []

  return (data as any[]).map((p) => {
    const liveAttendance = (p.attendance ?? []).find((a: any) =>
      a.checked_out_at === null &&
      a.market?.event_date === today &&
      ['live', 'community_live'].includes(a.market?.status)
    )

    const bio = (lang !== 'pt' && p.bio_i18n?.[lang]) ? p.bio_i18n[lang] : p.bio

    return {
      id: p.id,
      display_name: p.display_name,
      slug: p.slug,
      bio: bio ?? null,
      bio_i18n: p.bio_i18n ?? {},
      instagram_handle: p.instagram_handle,
      avatar_url: p.avatar_url,
      featured_photo_url: p.featured_photo_url ?? null,
      is_verified: p.is_verified,
      digital_offer: p.digital_offer,
      is_live: !!liveAttendance,
      live_market_name: liveAttendance?.market?.title ?? null,
    }
  })
}

/**
 * Single brand profile by slug.
 */
export async function getBrandBySlug(slug: string, lang = 'en'): Promise<BrandDetail | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id, display_name, slug, bio, bio_i18n,
      instagram_handle, avatar_url, featured_photo_url, is_verified, digital_offer,
      attendance (
        id, checked_out_at,
        market:markets (
          id, title, status, event_date, starts_at,
          space:spaces (id, name, address)
        )
      )
    `)
    .eq('slug', slug)
    .in('role', ['maker', 'admin'])
    .single()

  if (error || !profile) return null
  const p = profile as any

  const liveAttendance = (p.attendance ?? []).find((a: any) =>
    a.checked_out_at === null &&
    a.market?.event_date === today &&
    ['live', 'community_live'].includes(a.market?.status)
  )

  const upcoming = (p.attendance ?? [])
    .filter((a: any) =>
      a.market?.event_date >= today &&
      ['scheduled', 'live', 'community_live'].includes(a.market?.status)
    )
    .map((a: any) => ({
      market_id: a.market?.id,
      market_title: a.market?.title,
      event_date: a.market?.event_date,
      starts_at: a.market?.starts_at,
      space_name: a.market?.space?.name ?? '',
      space_address: a.market?.space?.address ?? null,
    }))
    .sort((a: any, b: any) => a.event_date.localeCompare(b.event_date))
    .slice(0, 6)

  const bio = (lang !== 'pt' && p.bio_i18n?.[lang]) ? p.bio_i18n[lang] : p.bio

  return {
    id: p.id,
    display_name: p.display_name,
    slug: p.slug,
    bio: bio ?? null,
    bio_i18n: p.bio_i18n ?? {},
    instagram_handle: p.instagram_handle,
    avatar_url: p.avatar_url,
    featured_photo_url: p.featured_photo_url ?? null,
    is_verified: p.is_verified,
    digital_offer: p.digital_offer,
    is_live: !!liveAttendance,
    live_market_name: liveAttendance?.market?.title ?? null,
    upcoming_markets: upcoming,
    gems: (p.gems ?? [])
      .filter((g: any) => g.is_approved)
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        description: g.description,
        address: g.address,
      })),
  }
}
