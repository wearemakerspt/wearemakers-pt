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
  distance_metres: number | null
  vetted_by_name: string
  vetted_by_slug: string | null
}

export interface MarketsByMonth {
  monthKey: string
  monthLabel: string
  isCurrentMonth: boolean
  markets: MarketSummary[]
}

// ── Queries ────────────────────────────────────────────────────

export async function getLiveMarkets(): Promise<LiveMarket[]> {
  const supabase = await createClient()

  const { data: markets, error } = await supabase
    .from('markets')
    .select(`
      id, title, status, starts_at, ends_at,
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
    live: 0, community_live: 1, scheduled: 2, cancelled: 3,
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

export async function getMarketsByMonth(): Promise<MarketsByMonth[]> {
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
    .in('status', ['live', 'community_live', 'scheduled'])
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(120)

  if (error || !data) return []

  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthMap = new Map<string, MarketSummary[]>()

  for (const m of data as any[]) {
    const [year, month] = m.event_date.split('-')
    const key = `${year}-${month}`
    if (!monthMap.has(key)) monthMap.set(key, [])
    monthMap.get(key)!.push({
      id: m.id,
      title: m.title,
      status: m.status,
      event_date: m.event_date,
      starts_at: m.starts_at,
      ends_at: m.ends_at,
      checkin_count: m.attendance?.length ?? 0,
      space: m.space ?? { id: '', name: '', address: null, parish: null, lat: 38.716, lng: -9.139 },
      curator: m.curator ?? null,
    })
  }

  const result: MarketsByMonth[] = []
  for (const [key, markets] of monthMap.entries()) {
    const [year, month] = key.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    result.push({
      monthKey: key,
      monthLabel: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase(),
      isCurrentMonth: key === currentMonthKey,
      markets,
    })
  }

  return result
}

export async function getMarketBySlug(slug: string): Promise<MarketDetail | null> {
  const supabase = await createClient()

  const parts = slug.split('--')
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
  const spaceId = m.space?.id

  // ── Hybrid gems fetch ─────────────────────────────────────
  // 1. Try gems_near_space() PostGIS function (uses real coordinates)
  // 2. Fall back to direct near_space_id match (for gems with missing coords)
  let gems: NearbyGem[] = []

  if (spaceId) {
    const { data: rpcGems } = await supabase
      .rpc('gems_near_space', { p_space_id: spaceId, radius_metres: 600 })

    if (rpcGems && rpcGems.length > 0) {
      // PostGIS found gems within radius
      gems = rpcGems.map((g: any) => ({
        gem_id: g.gem_id,
        gem_name: g.gem_name,
        category: g.category,
        description: g.description ?? null,
        address: g.address ?? null,
        distance_metres: Math.round(g.distance_metres),
        vetted_by_name: g.vetted_by_name ?? '',
        vetted_by_slug: g.vetted_by_slug ?? null,
      }))
    } else {
      // Fallback: fetch by near_space_id directly (no distance calc)
      const { data: fallbackGems } = await supabase
        .from('gems')
        .select(`
          id, name, category, description, address, lat, lng,
          vetted_by:profiles!gems_vetted_by_fkey (display_name, slug)
        `)
        .eq('near_space_id', spaceId)
        .eq('is_approved', true)
        .order('name')

      if (fallbackGems && fallbackGems.length > 0) {
        gems = fallbackGems.map((g: any) => ({
          gem_id: g.id,
          gem_name: g.name,
          category: g.category,
          description: g.description ?? null,
          address: g.address ?? null,
          distance_metres: null, // no coords available
          vetted_by_name: g.vetted_by?.display_name ?? '',
          vetted_by_slug: g.vetted_by?.slug ?? null,
        }))
      }
    }
  }

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
    gems,
  }
}

// ── All approved gems — for /gems directory ───────────────────

export interface GemWithSpace {
  id: string
  name: string
  category: string
  description: string | null
  address: string | null
  lat: number | null
  lng: number | null
  distance_metres: number | null
  space_id: string
  space_name: string
  space_parish: string | null
  vetted_by_name: string
  vetted_by_slug: string | null
}

export async function getAllGems(): Promise<GemWithSpace[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('gems')
    .select(`
      id, name, category, description, address, lat, lng,
      near_space_id,
      space:spaces!gems_near_space_id_fkey (id, name, parish),
      vetted_by:profiles!gems_vetted_by_fkey (display_name, slug)
    `)
    .eq('is_approved', true)
    .order('name')

  if (error || !data) return []

  return (data as any[]).map(g => ({
    id: g.id,
    name: g.name,
    category: g.category,
    description: g.description ?? null,
    address: g.address ?? null,
    lat: g.lat ?? null,
    lng: g.lng ?? null,
    distance_metres: null,
    space_id: g.space?.id ?? g.near_space_id ?? '',
    space_name: g.space?.name ?? '',
    space_parish: g.space?.parish ?? null,
    vetted_by_name: g.vetted_by?.display_name ?? '',
    vetted_by_slug: g.vetted_by?.slug ?? null,
  }))
}
