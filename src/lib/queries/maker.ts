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

  const [activeResult, recentResult, upcomingResult] = await Promise.all([
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
          id, title, event_date, starts_at, ends_at, status, space_id,
          space:spaces ( id, name, address, parish )
        )
      `)
      .eq('maker_id', makerId)
      .is('checked_out_at', null)
      .filter('market.event_date', 'eq', today)
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

    // ── 3. Upcoming markets in the next 60 days — with attendance intent flag
    supabase
      .from('markets')
      .select(`
        id, title, event_date, starts_at, ends_at, status, space_id,
        space:spaces ( id, name, address, parish ),
        attendance!left (
          id,
          maker_id,
          checked_out_at
        )
      `)
      .gte('event_date', today)
      .lte('event_date', new Date(Date.now() + 60 * 86400_000).toISOString().split('T')[0])
      .in('status', ['scheduled', 'shadow', 'live', 'community_live'])
      .order('event_date', { ascending: true })
      .limit(15),
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

  // ── Normalise upcoming markets + attendance intent
  const upcomingMarkets: UpcomingMarket[] = (upcomingResult.data ?? [])
    .filter((row: any) => row.space !== null)
    .map((row: any) => {
      // Look for the current maker's attendance row in the joined data
      const myAttendance = (row.attendance ?? []).find(
        (a: any) => a.maker_id === makerId && a.checked_out_at === null
      )
      const { attendance: _att, ...marketData } = row
      return {
        market: marketData,
        is_attending: Boolean(myAttendance),
        attendance_id: myAttendance?.id ?? null,
      }
    })

  return { activeCheckins, recentAttendance, upcomingMarkets }
}
