import { createClient } from '@/lib/supabase/server'

export async function getWamTop20() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('wam_top20')
    .select(`
      position,
      maker:profiles!maker_id (
        id,
        display_name,
        slug,
        avatar_url,
        is_verified,
        bio_i18n,
        instagram_handle
      )
    `)
    .order('position', { ascending: true })

  if (error) console.error('[getWamTop20]', error)
  return data ?? []
}

export async function getCuratorSpotlights() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('curator_featured_makers')
    .select(`
      curator_id,
      pinned_at,
      curator:profiles!curator_id (
        display_name,
        slug,
        avatar_url
      )
    `)
    .gt('pinned_until', new Date().toISOString())
    .order('pinned_at', { ascending: false })

  if (error) console.error('[getCuratorSpotlights]', error)

  // One card per curator, most recently updated wins
  const seen = new Map()
  for (const row of data ?? []) {
    if (!seen.has(row.curator_id)) seen.set(row.curator_id, row)
  }
  return Array.from(seen.values())
}

export async function getCuratorSpotlightBrands(curatorSlug: string) {
  const supabase = await createClient()

  // Resolve curator id from slug
  const { data: curatorData, error: curatorError } = await supabase
    .from('profiles')
    .select('id, display_name, slug')
    .eq('slug', curatorSlug)
    .single()

  if (curatorError || !curatorData) return { curator: null, brands: [] }

  const { data, error } = await supabase
    .from('curator_featured_makers')
    .select(`
      pinned_at,
      maker:profiles!maker_id (
        id,
        display_name,
        slug,
        avatar_url,
        is_verified,
        bio_i18n,
        instagram_handle
      )
    `)
    .eq('curator_id', curatorData.id)
    .gt('pinned_until', new Date().toISOString())
    .order('pinned_at', { ascending: false })

  if (error) console.error('[getCuratorSpotlightBrands]', error)

  const brands = (data ?? []).map((r: any) => r.maker).filter(Boolean)
  return { curator: curatorData, brands }
}

export async function getLiveIds(): Promise<Set<string>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('live_market_makers')
    .select('maker_id')

  if (error) console.error('[getLiveIds]', error)
  return new Set((data ?? []).map((r: any) => r.maker_id))
}
