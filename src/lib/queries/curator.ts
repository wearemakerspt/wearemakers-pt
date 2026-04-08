import { createClient } from '@/lib/supabase/server'
import type { Market, Profile, Space, CuratorFeaturedMaker } from '@/types/database'

// ── Enriched types ─────────────────────────────────────────────

export interface CuratorMarket extends Market {
  space: Space
  checkin_count: number          // live attendance right now
  attending_makers: {
    id: string
    display_name: string
    slug: string | null
    is_verified: boolean
    stall_label: string | null
    checked_in_at: string
    attendance_id: string
  }[]
}

export interface FeaturedSlot {
  position: number               // 1, 2, or 3
  pinned: CuratorFeaturedMaker & { maker: Profile } | null
}

export interface CuratorDashboardData {
  ownMarkets: CuratorMarket[]     // Markets this curator owns
  spaces: Space[]                 // Available spaces for creating new markets
  featuredSlots: FeaturedSlot[]   // Three spotlight slots
  recentActivityLog: ActivityEntry[]
  searchableMakers: Pick<Profile, 'id' | 'display_name' | 'slug' | 'instagram_handle' | 'is_verified' | 'bio'>[]
}

export interface ActivityEntry {
  id: string
  label: string
  at: string
  type: 'checkin' | 'market_open' | 'market_cancel' | 'feature' | 'system'
}

// ── Main dashboard query ───────────────────────────────────────

export async function getCuratorDashboardData(
  curatorId: string
): Promise<CuratorDashboardData> {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]
  const in60 = new Date(Date.now() + 60 * 86400_000).toISOString().split('T')[0]

  const [marketsResult, spacesResult, featuredResult, makersResult] =
    await Promise.all([
      // ── 1. Curator's own markets (next 60 days + today)
      supabase
        .from('markets')
        .select(`
          *,
          space:spaces ( * ),
          attendance (
            id,
            checked_in_at,
            checked_out_at,
            stall_label,
            maker:profiles ( id, display_name, slug, is_verified )
          )
        `)
        .eq('curator_id', curatorId)
        .gte('event_date', today)
        .lte('event_date', in60)
        .order('event_date', { ascending: true })
        .limit(20),

      // ── 2. All active spaces (for the Create Market form dropdown)
      supabase
        .from('spaces')
        .select('id, name, slug, address, parish, city, lat, lng')
        .eq('is_active', true)
        .eq('city', 'lisbon')
        .order('name', { ascending: true }),

      // ── 3. Active featured makers for this curator
      supabase
        .from('curator_featured_makers')
        .select(`
          *,
          maker:profiles ( id, display_name, slug, instagram_handle, avatar_url, is_verified, bio, digital_offer )
        `)
        .eq('curator_id', curatorId)
        .gt('pinned_until', new Date().toISOString())
        .order('pinned_at', { ascending: true })
        .limit(3),

      // ── 4. All makers — for spotlight search (active makers only)
      supabase
        .from('profiles')
        .select('id, display_name, slug, instagram_handle, is_verified, bio')
        .eq('role', 'maker')
        .eq('is_active', true)
        .order('display_name', { ascending: true })
        .limit(200),
    ])

  // ── Normalise markets with live checkin counts ─────────────
  const ownMarkets: CuratorMarket[] = (marketsResult.data ?? [])
    .filter((m: any) => m.space !== null)
    .map((m: any) => {
      const activeAttendance = (m.attendance ?? []).filter(
        (a: any) => a.checked_out_at === null
      )
      return {
        ...m,
        attendance: undefined,
        checkin_count: activeAttendance.length,
        attending_makers: activeAttendance.map((a: any) => ({
          id: a.maker?.id ?? '',
          display_name: a.maker?.display_name ?? 'Unknown',
          slug: a.maker?.slug ?? null,
          is_verified: a.maker?.is_verified ?? false,
          stall_label: a.stall_label,
          checked_in_at: a.checked_in_at,
          attendance_id: a.id,
        })),
      }
    })

  // ── Build 3 featured slots ─────────────────────────────────
  const pinned = (featuredResult.data ?? []) as (CuratorFeaturedMaker & { maker: Profile })[]
  const featuredSlots: FeaturedSlot[] = [1, 2, 3].map((pos) => ({
    position: pos,
    pinned: pinned[pos - 1] ?? null,
  }))

  // ── Build activity log from market events ──────────────────
  const recentActivityLog: ActivityEntry[] = ownMarkets
    .flatMap((m) => {
      const entries: ActivityEntry[] = []
      if (m.opened_at) {
        entries.push({
          id: `open-${m.id}`,
          label: `${m.space.name} — OPENED`,
          at: m.opened_at,
          type: 'market_open',
        })
      }
      if (m.status === 'cancelled') {
        entries.push({
          id: `cancel-${m.id}`,
          label: `${m.space.name} — CANCELLED`,
          at: m.updated_at,
          type: 'market_cancel',
        })
      }
      m.attending_makers.forEach((mk) => {
        entries.push({
          id: `checkin-${m.id}-${mk.id}`,
          label: `${mk.display_name} checked in · ${m.space.name}`,
          at: mk.checked_in_at,
          type: 'checkin',
        })
      })
      return entries
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 12)

  return {
    ownMarkets,
    spaces: (spacesResult.data as Space[]) ?? [],
    featuredSlots,
    recentActivityLog,
    searchableMakers: (makersResult.data ?? []) as CuratorDashboardData['searchableMakers'],
  }
}
