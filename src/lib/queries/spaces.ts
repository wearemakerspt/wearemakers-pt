import { createClient } from '@/lib/supabase/server'

export interface SpaceDetail {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  parish: string | null
  city: string | null
  lat: number | null
  lng: number | null
  is_active: boolean
  markets: SpaceMarket[]
  makers: SpaceMaker[]
  gems: SpaceGem[]
}

export interface SpaceMarket {
  id: string
  title: string
  event_date: string
  event_date_end: string | null
  starts_at: string
  ends_at: string
  status: string
  curator_name: string | null
}

export interface SpaceMaker {
  id: string
  display_name: string
  slug: string | null
  avatar_url: string | null
  featured_photo_url: string | null
  bio_i18n: any
  is_verified: boolean
  is_live: boolean
}

export interface SpaceGem {
  id: string
  name: string
  category: string
  description: string | null
  address: string | null
}

export async function getSpaceBySlug(slug: string): Promise<SpaceDetail | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: space, error } = await supabase
    .from('spaces')
    .select('id, name, slug, description, address, parish, city, lat, lng, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !space) return null

  // Upcoming + recent markets at this space
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [marketsRes, gemsRes] = await Promise.all([
    supabase
      .from('markets')
      .select(`
        id, title, event_date, event_date_end, starts_at, ends_at, status,
        curator:profiles ( display_name )
      `)
      .eq('space_id', space.id)
      .gte('event_date', thirtyDaysAgo.toISOString().split('T')[0])
      .not('status', 'eq', 'shadow')
      .order('event_date', { ascending: true })
      .limit(20),

    supabase
      .from('gems')
      .select('id, name, category, description, address')
      .eq('near_space_id', space.id)
      .eq('is_approved', true)
      .order('category'),
  ])

  const markets: SpaceMarket[] = (marketsRes.data ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    event_date: m.event_date,
    event_date_end: m.event_date_end ?? null,
    starts_at: m.starts_at,
    ends_at: m.ends_at,
    status: m.status,
    curator_name: m.curator?.display_name ?? null,
  }))

  // Makers who have checked in to this space (last 90 days, unique)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data: attendanceData } = await supabase
    .from('attendance')
    .select(`
      maker_id,
      checked_in_at,
      market:markets ( space_id, event_date, status )
    `)
    .gte('checked_in_at', ninetyDaysAgo.toISOString())
    .not('checked_out_at', 'is', null)

  // Filter to this space and get unique maker IDs
  const makerIds = [...new Set(
    (attendanceData ?? [])
      .filter((a: any) => a.market?.space_id === space.id)
      .map((a: any) => a.maker_id)
  )]

  let makers: SpaceMaker[] = []
  if (makerIds.length > 0) {
    // Check who is live right now
    const { data: liveData } = await supabase
      .from('attendance')
      .select('maker_id')
      .in('maker_id', makerIds)
      .is('checked_out_at', null)

    const liveSet = new Set((liveData ?? []).map((a: any) => a.maker_id))

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, slug, avatar_url, featured_photo_url, bio_i18n, is_verified')
      .in('id', makerIds)
      .in('role', ['maker', 'admin'])
      .eq('is_active', true)
      .order('display_name')

    makers = (profiles ?? []).map((p: any) => ({
      id: p.id,
      display_name: p.display_name,
      slug: p.slug,
      avatar_url: p.avatar_url,
      featured_photo_url: p.featured_photo_url,
      bio_i18n: p.bio_i18n,
      is_verified: p.is_verified,
      is_live: liveSet.has(p.id),
    }))
  }

  return {
    id: space.id,
    name: space.name,
    slug: space.slug,
    description: space.description,
    address: space.address,
    parish: space.parish,
    city: space.city,
    lat: space.lat,
    lng: space.lng,
    is_active: space.is_active,
    markets,
    makers,
    gems: gemsRes.data ?? [],
  }
}

export async function getAllSpaceSlugs(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('spaces')
    .select('slug')
    .eq('is_active', true)
  return (data ?? []).map((s: any) => s.slug).filter(Boolean)
}
