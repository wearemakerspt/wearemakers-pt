import { createClient } from '@/lib/supabase/server'

export interface MarketAnalytics {
  market_id: string
  market_title: string
  space_name: string
  event_date: string
  views: number
  saves: number
  instagram_taps: number
  offer_redeems: number
}

export interface AnalyticsSummary {
  total_views: number
  total_saves: number
  total_instagram_taps: number
  total_offer_redeems: number
  total_markets_attended: number
  best_market: string | null
}

export async function getMakerAnalytics(makerId: string): Promise<{
  byMarket: MarketAnalytics[]
  summary: AnalyticsSummary
}> {
  const supabase = await createClient()

  // Fetch all attendance records for this maker (last 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data: attendance } = await supabase
    .from('attendance')
    .select(`
      market_id,
      checked_in_at,
      market:markets (
        id, title, event_date,
        space:spaces ( name )
      )
    `)
    .eq('maker_id', makerId)
    .gte('checked_in_at', ninetyDaysAgo.toISOString())
    .order('checked_in_at', { ascending: false })

  if (!attendance || attendance.length === 0) {
    return {
      byMarket: [],
      summary: {
        total_views: 0,
        total_saves: 0,
        total_instagram_taps: 0,
        total_offer_redeems: 0,
        total_markets_attended: 0,
        best_market: null,
      }
    }
  }

  const marketIds = attendance.map((a: any) => a.market_id)

  // Fetch analytics events for this brand, filtered to attended markets
  const { data: events } = await supabase
    .from('analytics_events')
    .select('event_type, market_id, created_at')
    .eq('brand_id', makerId)
    .in('market_id', marketIds)

  // Fetch saves for this brand (from saved_brands, match by date to market)
  const { data: saves } = await supabase
    .from('analytics_events')
    .select('market_id, created_at')
    .eq('brand_id', makerId)
    .eq('event_type', 'brand_save')

  // Build per-market map
  const eventMap = new Map<string, {
    views: number
    instagram_taps: number
    offer_redeems: number
    saves: number
  }>()

  for (const mId of marketIds) {
    eventMap.set(mId, { views: 0, instagram_taps: 0, offer_redeems: 0, saves: 0 })
  }

  for (const ev of (events ?? [])) {
    if (!ev.market_id) continue
    const entry = eventMap.get(ev.market_id)
    if (!entry) continue
    if (ev.event_type === 'brand_view') entry.views++
    if (ev.event_type === 'instagram_tap') entry.instagram_taps++
    if (ev.event_type === 'offer_redeem') entry.offer_redeems++
    if (ev.event_type === 'brand_save') entry.saves++
  }

  // Build per-market result
  const byMarket: MarketAnalytics[] = attendance.map((a: any) => {
    const stats = eventMap.get(a.market_id) ?? { views: 0, instagram_taps: 0, offer_redeems: 0, saves: 0 }
    return {
      market_id: a.market_id,
      market_title: (a.market as any)?.title ?? '',
      space_name: (a.market as any)?.space?.name ?? '',
      event_date: (a.market as any)?.event_date ?? '',
      views: stats.views,
      saves: stats.saves,
      instagram_taps: stats.instagram_taps,
      offer_redeems: stats.offer_redeems,
    }
  })

  // Summary totals
  const summary: AnalyticsSummary = {
    total_views: byMarket.reduce((s, m) => s + m.views, 0),
    total_saves: byMarket.reduce((s, m) => s + m.saves, 0),
    total_instagram_taps: byMarket.reduce((s, m) => s + m.instagram_taps, 0),
    total_offer_redeems: byMarket.reduce((s, m) => s + m.offer_redeems, 0),
    total_markets_attended: byMarket.length,
    best_market: byMarket.sort((a, b) => (b.views + b.saves) - (a.views + a.saves))[0]?.market_title ?? null,
  }

  return { byMarket, summary }
}
