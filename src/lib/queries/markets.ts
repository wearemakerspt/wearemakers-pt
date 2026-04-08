import { createClient } from '@/lib/supabase/server'

// ── Types ──────────────────────────────────────────────────────

export interface LiveMarket {
  market_id: string
  market_title: string
  market_status: string
  starts_at: string
  ends_at: string
  space_id: string
  space_name: string
  space_address: string | null
  space_parish: string | null
  lat: number
  lng: number
  checkin_count: number
  makers: LiveMaker[]
}

export interface LiveMaker {
  maker_id: string
  maker_name: string
  maker_slug: string | null
  instagram_handle: string | null
  avatar_url: string | null
  is_verified: boolean
  digital_offer: string | null
  stall_label: string | null
  checked_in_at: string
}

export interface MarketSummary {
  id: string
  title: string
  status: string
  event_date: string
  starts_at: string
  ends_at: string
  checkin_count: number
  space: {
    id: string
    name: string
    address: string | null
    parish: string | null
    lat: number
    lng: number
  }
  curator: {
    id: string
    display_name: string
    slug: string | null
  } | null
}

export interface MarketDetail extends MarketSummary {
  description: string | null
  description_i18n: Record<string, string>
  makers: LiveMaker[]
  gems: NearbyGem[]
}

export interface NearbyGem {
  gem_id: string
  gem_name: string
  category: string
  description: string | null
  address: string | null
  distance_metres: number
  vetted_by_name: string
  vetted_by_slug: string | null
}

// ── Queries ────────────────────────────────────────────────────

/**
 * All markets with status live or community_live today.
 * Used on the homepage Live Now section.
 */
export async function getLiveMarkets(): Promise<LiveMarket[]> {
  const supabase = await createClient()

  const { data: markets, error } = await supabase
    .from('markets')
    .select(`
      id,
      title,
      status,
      starts_at,
      ends_at,
      space:spaces (
        id, name, address, parish, lat, lng
      ),
      curator:profiles!markets_curator_id_fkey (
        id, display_name, slug
      ),
      attendance (
        id,
        stall_label,
        checked_in_at,
        maker:profiles!attendance_maker_id_fkey (
          id, display_name, slug, instagram_handle,
          avatar_url, is_verified, digital_offer
        )
      )
    `)
    .in('status', ['live', 'community_live'])
    .eq('event_date', new Date().toISOString().split('T')[0])
    .is('attendance.checked_out_at', null)

  if (error || !markets) return []

  return markets.map((m: any) => ({
    market_id: m.id,
    market_title: m.title,
    market_status: m.status,
    starts_at: m.starts_at,
    ends_at: m.ends_at,
    space_id: m.space?.id ?? '',
    space_name: m.space?.name ?? '',
    space_address: m.space?.address ?? null,
    space_parish: m.space?.parish ?? null,
    lat: m.space?.lat ?? 38.716,
    lng: m.space?.lng ?? -9.139,
    checkin_count: m.attendance?.length ?? 0,
    makers: (m.attendance ?? []).map((a: any) => ({
      maker_id: a.maker?.id ?? '',
      maker_name: a.maker?.display_name ?? '',
      maker_slug: a.maker?.slug ?? null,
      instagram_handle: a.maker?.instagram_handle ?? null,
      avatar_url: a.maker?.avatar_url ?? null,
      is_verified: a.maker?.is_verified ?? false,
      digital_offer: a.maker?.digital_offer ?? null,
      stall_label: a.stall_label ?? null,
      checked_in_at: a.checked_in_at,
    })),
  }))
}

/**
 * All markets — for the /markets directory.
 * Returns live + scheduled + community_live, sorted by status then date.
 */
export async function getAllMarkets(): Promise<MarketSummary[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('markets')
    .select(`
      id, title, status, event_date, starts_at, ends_at,
      space:spaces (id, name, address, parish, lat, lng),
      curator:profiles!markets_curator_id_fkey (id, display_name, slug),
      attendance (id)
    `)
    .neq('status', 'shadow')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(60)

  if (error || !data) return []

  const statusOrder: Record<string, number> = {
    live: 0, community_live: 1, scheduled: 2, cancelled: 3
  }

  return (data as any[])
    .map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      event_date: m.event_date,
      starts_at: m.starts_at,
      ends_at: m.ends_at,
      checkin_count: m.attendance?.length ?? 0,
      space: m.space ?? { id: '', name: '', address: null, parish: null, lat: 38.716, lng: -9.139 },
      curator: m.curator ?? null,
    }))
    .sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9))
}

/**
 * Single market with full maker list and nearby gems.
 */
export async function getMarketBySlug(slug: string): Promise<MarketDetail | null> {
  const supabase = await createClient()

  // slug format: {space-slug}--{date}  e.g. lx-factory--2026-04-12
  // OR just market id as fallback
  const parts = slug.split('--')
  const spaceSlug = parts[0]
  const eventDate = parts[1]

  let query = supabase
    .from('markets')
    .select(`
      id, title, status, event_date, starts_at, ends_at,
      description, description_i18n,
      space:spaces (id, name, address, parish, lat, lng),
      curator:profiles!markets_curator_id_fkey (id, display_name, slug),
      attendance (
        id, stall_label, checked_in_at,
        maker:profiles!attendance_maker_id_fkey (
          id, display_name, slug, instagram_handle,
          avatar_url, is_verified, digital_offer
        )
      )
    `)
    .is('attendance.checked_out_at', null)
    .neq('status', 'shadow')

  if (eventDate) {
    query = query.eq('event_date', eventDate)
  }

  const { data: markets } = await query.limit(1)
  if (!markets || markets.length === 0) return null

  const m = markets[0] as any

  // Fetch nearby gems via function
  const { data: gems } = await supabase
    .rpc('gems_near_space', { p_space_id: m.space?.id, radius_metres: 500 })

  return {
    id: m.id,
    title: m.title,
    status: m.status,
    event_date: m.event_date,
    starts_at: m.starts_at,
    ends_at: m.ends_at,
    description: m.description ?? null,
    description_i18n: m.description_i18n ?? {},
    checkin_count: m.attendance?.length ?? 0,
    space: m.space ?? { id: '', name: '', address: null, parish: null, lat: 38.716, lng: -9.139 },
    curator: m.curator ?? null,
    makers: (m.attendance ?? []).map((a: any) => ({
      maker_id: a.maker?.id ?? '',
      maker_name: a.maker?.display_name ?? '',
      maker_slug: a.maker?.slug ?? null,
      instagram_handle: a.maker?.instagram_handle ?? null,
      avatar_url: a.maker?.avatar_url ?? null,
      is_verified: a.maker?.is_verified ?? false,
      digital_offer: a.maker?.digital_offer ?? null,
      stall_label: a.stall_label ?? null,
      checked_in_at: a.checked_in_at,
    })),
    gems: (gems ?? []).map((g: any) => ({
      gem_id: g.gem_id,
      gem_name: g.gem_name,
      category: g.category,
      description: g.description ?? null,
      address: g.address ?? null,
      distance_metres: Math.round(g.distance_metres),
      vetted_by_name: g.vetted_by_name,
      vetted_by_slug: g.vetted_by_slug ?? null,
    })),
  }
}
