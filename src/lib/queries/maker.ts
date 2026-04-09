import { createClient } from '@/lib/supabase/server'
import type { Market, Attendance } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────

export interface AttendedMarket {
  attendance_id: string
  stall_label: string | null
  checked_in_at: string
  checked_out_at: string | null
  is_verified: boolean
  market: Market & {
    space: {
      id: string
      name: string
      address: string | null
      parish: string | null
    }
  }
}

export interface UpcomingMarket {
  market: Market & {
    space: {
      id: string
      name: string
      address: string | null
      parish: string | null
    }
  }
  is_attending: boolean
  attendance_id: string | null
}

export interface MakerDashboardData {
  /** Markets the maker is currently checked in to (today, active) */
  activeCheckins: AttendedMarket[]
  /** Markets they have previously attended or are attending today */
  recentAttendance: AttendedMarket[]
  /** Future scheduled/shadow markets in the system — maker can declare intent */
  upcomingMarkets: UpcomingMarket[]
}

// ── Queries ────────────────────────────────────────────────────

/**
 * Fetch everything needed to render the maker dashboard in one round-trip.
 * Uses parallel Promise.all — no sequential waterfalls.
 */
export async function getMakerDashboardData(
  makerId: string
): Promise<MakerDashboardData> {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const [activeResult, recentResult, spaceResult] = await Promise.all([
    // ── 1. Today's active check-ins (checked_out_at IS NULL, event_date = today)
    supabase
      .from('attendance')
      .select(`
        id,
        stall_label,
        checked_in_at,
        checked_out_at,
        is_verified,
        market:markets (
          id, title, event_date, event_date_end, starts_at, ends_at, status, space_id,
          space:spaces ( id, name, address, parish )
        )
      `)
      .eq('maker_id', makerId)
      .is('checked_out_at', null)
      .order('checked_in_at', { ascending: false }),

    // ── 2. Recent attendance — last 30 days + today
    supabase
      .from('attendance')
      .select(`
        id,
        stall_label,
        checked_in_at,
        checked_out_at,
        is_verified,
        market:markets (
          id, title, event_date, starts_at, ends_at, status, space_id,
          space:spaces ( id, name, address, parish )
        )
      `)
      .eq('maker_id', makerId)
      .gte('checked_in_at', new Date(Date.now() - 30 * 86400_000).toISOString())
      .order('checked_in_at', { ascending: false })
      .limit(10),

    // ── 3. Maker's attended spaces (last 90 days) — for filtering upcoming
    supabase
      .from('attendance')
      .select('market:markets(space_id)')
      .eq('maker_id', makerId)
      .gte('checked_in_at', new Date(Date.now() - 90 * 86400_000).toISOString())
      .limit(50),
  ])

  // ── Normalise active check-ins
  const activeCheckins: AttendedMarket[] = (activeResult.data ?? [])
    .filter((row: any) => row.market !== null)
    .map((row: any) => ({
      attendance_id: row.id,
      stall_label: row.stall_label,
      checked_in_at: row.checked_in_at,
      checked_out_at: row.checked_out_at,
      is_verified: row.is_verified,
      market: row.market,
    }))

  // ── Normalise recent attendance
  const recentAttendance: AttendedMarket[] = (recentResult.data ?? [])
    .filter((row: any) => row.market !== null)
    .map((row: any) => ({
      attendance_id: row.id,
      stall_label: row.stall_label,
      checked_in_at: row.checked_in_at,
      checked_out_at: row.checked_out_at,
      is_verified: row.is_verified,
      market: row.market,
    }))

  // ── Get space IDs the maker has attended
  const attendedSpaceIds = new Set(
    (spaceResult.data ?? [])
      .map((row: any) => row.market?.space_id)
      .filter(Boolean)
  )

  // ── Fetch upcoming markets — only at spaces the maker knows, or where they have intent
  const in60 = new Date(Date.now() + 60 * 86400_000).toISOString().split('T')[0]

  // Fetch markets starting today OR range markets that started before today but end in the future
  const [upcomingStarting, upcomingRange] = await Promise.all([
    supabase
      .from('markets')
      .select(`
        id, title, event_date, event_date_end, starts_at, ends_at, status, space_id,
        space:spaces ( id, name, address, parish ),
        attendance!left ( id, maker_id, checked_out_at, stall_label )
      `)
      .gte('event_date', today)
      .lte('event_date', in60)
      .in('status', ['scheduled', 'shadow', 'live', 'community_live'])
      .order('event_date', { ascending: true })
      .limit(40),
    // Range markets that started before today but haven't ended yet
    supabase
      .from('markets')
      .select(`
        id, title, event_date, event_date_end, starts_at, ends_at, status, space_id,
        space:spaces ( id, name, address, parish ),
        attendance!left ( id, maker_id, checked_out_at, stall_label )
      `)
      .lt('event_date', today)
      .gte('event_date_end', today)
      .in('status', ['scheduled', 'shadow', 'live', 'community_live'])
      .order('event_date', { ascending: true })
      .limit(10),
  ])

  // Merge and deduplicate by id
  const seen = new Set<string>()
  const mergedData = [...(upcomingStarting.data ?? []), ...(upcomingRange.data ?? [])]
    .filter(row => { if (seen.has(row.id)) return false; seen.add(row.id); return true })
    .sort((a, b) => a.event_date.localeCompare(b.event_date))

  const upcomingRaw = { data: mergedData }

  // ── Normalise upcoming markets + attendance intent
  // Show: markets at spaces the maker has attended + markets with existing intent
  const upcomingMarkets: UpcomingMarket[] = (upcomingRaw.data ?? [])
    .filter((row: any) => {
      if (!row.space) return false
      // Always show if maker has declared intent
      const myAttendance = (row.attendance ?? []).find(
        (a: any) => a.maker_id === makerId
      )
      if (myAttendance) return true
      // Show if maker has been to this space before
      if (attendedSpaceIds.has(row.space_id)) return true
      // If maker has no history at all, show all (new maker experience)
      if (attendedSpaceIds.size === 0) return true
      return false
    })
    .map((row: any) => {
      const myAttendance = (row.attendance ?? []).find(
        (a: any) => a.maker_id === makerId && a.stall_label !== 'INTENT'
          ? a.checked_out_at === null
          : a.maker_id === makerId
      )
      const intentRow = (row.attendance ?? []).find(
        (a: any) => a.maker_id === makerId
      )
      const { attendance: _att, ...marketData } = row
      return {
        market: marketData,
        is_attending: Boolean(intentRow),
        attendance_id: intentRow?.id ?? null,
      }
    })

  return { activeCheckins, recentAttendance, upcomingMarkets }
}
