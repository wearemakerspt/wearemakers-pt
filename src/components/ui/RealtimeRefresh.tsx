'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Drop this component anywhere to get live updates when attendance or markets change.
 * It subscribes to Supabase Realtime and calls router.refresh() on any change —
 * which re-fetches server data and re-renders the page without a full reload.
 */
export default function RealtimeRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Throttle refreshes — max once every 3 seconds
    let lastRefresh = 0
    function throttledRefresh() {
      const now = Date.now()
      if (now - lastRefresh > 3000) {
        lastRefresh = now
        router.refresh()
      }
    }

    // Subscribe to attendance changes (maker check-ins/outs)
    const attendanceChannel = supabase
      .channel('realtime-attendance')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => throttledRefresh()
      )
      .subscribe()

    // Subscribe to market status changes
    const marketsChannel = supabase
      .channel('realtime-markets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'markets' },
        () => throttledRefresh()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(attendanceChannel)
      supabase.removeChannel(marketsChannel)
    }
  }, [router])

  // Renders nothing — pure side-effect component
  return null
}
