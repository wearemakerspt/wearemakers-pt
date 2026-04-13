import { createClient } from '@/lib/supabase/server'

export interface CuratorProfile {
  id: string
  display_name: string
  slug: string
  bio: string | null
  avatar_url: string | null
  instagram_handle: string | null
  shop_url: string | null
  organisation_name: string | null
  organisation_url: string | null
  markets: CuratorMarket[]
  featured_makers: FeaturedMaker[]
}

export interface CuratorMarket {
  id: string
  title: string
  event_date: string
  event_date_end: string | null
  starts_at: string
  ends_at: string
  status: string
  space_name: string | null
  space_slug: string | null
}

export interface FeaturedMaker {
  id: string
  display_name: string
  slug: string | null
  avatar_url: string | null
  featured_photo_url: string | null
  bio_i18n: any
  is_verified: boolean
  is_live: boolean
}

export async function getCuratorBySlug(slug: string): Promise<CuratorProfile | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name, slug, bio, avatar_url, instagram_handle, shop_url, organisation_name, organisation_url')
    .eq('slug', slug)
    .eq('role', 'curator')
    .single()

  if (error || !profile) return null

  // Upcoming markets (next 60 days) + recent (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [marketsRes, featuredRes] = await Promise.all([
    supabase
      .from('markets')
      .select(`
        id, title, event_date, event_date_end, starts_at, ends_at, status,
        space:spaces ( name, slug )
      `)
      .eq('curator_id', profile.id)
      .gte('event_date', thirtyDaysAgo.toISOString().split('T')[0])
      .not('status', 'in', '("shadow","cancelled")')
      .order('event_date', { ascending: true })
      .limit(20),

    supabase
      .from('curator_featured_makers')
      .select(`
        maker:profiles (
          id, display_name, slug, avatar_url, featured_photo_url, bio_i18n, is_verified
        )
      `)
      .eq('curator_id', profile.id)
      .gte('pinned_until', new Date().toISOString())
      .order('pinned_at', { ascending: false })
      .limit(20),
  ])

  const markets: CuratorMarket[] = (marketsRes.data ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    event_date: m.event_date,
    event_date_end: m.event_date_end ?? null,
    starts_at: m.starts_at,
    ends_at: m.ends_at,
    status: m.status,
    space_name: m.space?.name ?? null,
    space_slug: m.space?.slug ?? null,
  }))

  // Check which featured makers are live right now
  const featuredMakerIds = (featuredRes.data ?? [])
    .map((f: any) => f.maker?.id)
    .filter(Boolean)

  let liveSet = new Set<string>()
  if (featuredMakerIds.length > 0) {
    const { data: liveData } = await supabase
      .from('attendance')
      .select('maker_id')
      .in('maker_id', featuredMakerIds)
      .is('checked_out_at', null)
    liveSet = new Set((liveData ?? []).map((a: any) => a.maker_id))
  }

  const featured_makers: FeaturedMaker[] = (featuredRes.data ?? [])
    .map((f: any) => f.maker)
    .filter(Boolean)
    .map((m: any) => ({
      id: m.id,
      display_name: m.display_name,
      slug: m.slug,
      avatar_url: m.avatar_url,
      featured_photo_url: m.featured_photo_url,
      bio_i18n: m.bio_i18n,
      is_verified: m.is_verified,
      is_live: liveSet.has(m.id),
    }))

  return {
    id: profile.id,
    display_name: profile.display_name,
    slug: profile.slug,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    instagram_handle: profile.instagram_handle,
    shop_url: profile.shop_url,
    organisation_name: profile.organisation_name,
    organisation_url: profile.organisation_url,
    markets,
    featured_makers,
  }
}
