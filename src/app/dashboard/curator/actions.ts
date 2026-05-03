'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { MarketStatus } from '@/types/database'

// ── Helpers ───────────────────────────────────────────────────

async function getAuthenticatedCurator() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: 'Not authenticated' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['curator', 'admin'].includes(profile.role)) {
    return { supabase, user: null, error: 'Insufficient permissions' as const }
  }

  return { supabase, user: { ...user, profile }, error: null }
}

// ── Create Market ──────────────────────────────────────────────

export async function createMarket(formData: FormData) {
  const { supabase, user, error } = await getAuthenticatedCurator()
  if (error || !user) redirect('/auth/login')

  const spaceId = formData.get('space_id') as string
  const eventDate = formData.get('event_date') as string
  const eventDateEnd = (formData.get('event_date_end') as string) || null
  const startsAt = (formData.get('starts_at') as string) || '09:00'
  const endsAt = (formData.get('ends_at') as string) || '19:00'
  const title = (formData.get('title') as string)?.trim() || ''
  const description = (formData.get('description') as string)?.trim() || null

  if (!spaceId || !eventDate) {
    return { error: 'Space and date are required.' }
  }

  const resolvedTitle = title || await (async () => {
    const { data: space } = await supabase
      .from('spaces')
      .select('name')
      .eq('id', spaceId)
      .single()
    return space?.name ?? 'Market'
  })()

  const { data: market, error: insertError } = await supabase
    .from('markets')
    .insert({
      space_id: spaceId,
      curator_id: user.id,
      title: resolvedTitle,
      description,
      event_date: eventDate,
      event_date_end: eventDateEnd || null,
      starts_at: startsAt,
      ends_at: endsAt,
      status: 'scheduled',
    })
    .select('id')
    .single()

  if (insertError) return { error: insertError.message }

  revalidatePath('/dashboard/curator')
  return { success: true, marketId: market.id }
}

// ── Update Market Status ───────────────────────────────────────

export async function setMarketStatus(
  marketId: string,
  status: MarketStatus,
  overrideNote?: string
) {
  const { supabase, user, error } = await getAuthenticatedCurator()
  if (error || !user) return { error }

  // Fetch market details before update (needed for cancellation notification)
  const { data: market } = await supabase
    .from('markets')
    .select('id, title, space:spaces(name)')
    .eq('id', marketId)
    .single()

  const updatePayload: Record<string, unknown> = { status }

  if (status === 'live') {
    updatePayload.open_reason = 'curator'
    updatePayload.opened_by = user.id
    updatePayload.opened_at = new Date().toISOString()
    updatePayload.admin_override = false
  }

  if (status === 'cancelled') {
    updatePayload.open_reason = null
  }

  if (overrideNote) {
    updatePayload.admin_override = true
    updatePayload.override_note = overrideNote
    updatePayload.open_reason = 'admin_override'
    updatePayload.opened_by = user.id
    updatePayload.opened_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from('markets')
    .update(updatePayload)
    .eq('id', marketId)
    .eq('curator_id', user.id)

  if (updateError) return { error: updateError.message }

  // ── Cancellation push notification ──────────────────────────
  // When a market is cancelled, notify all visitors who have saved
  // any brand that was checked in to this market today.
  if (status === 'cancelled' && market) {
    try {
      const marketName = (market.space as any)?.name ?? market.title

      // Find all maker IDs checked into this market
      const { data: checkins } = await supabase
        .from('attendance')
        .select('maker_id')
        .eq('market_id', marketId)
        .is('checked_out_at', null)

      if (checkins && checkins.length > 0) {
        const makerIds = checkins.map((c: any) => c.maker_id)

        // Find all visitors who have saved any of those brands
        const { data: savedBrands } = await supabase
          .from('saved_brands')
          .select('visitor_id')
          .in('brand_id', makerIds)

        if (savedBrands && savedBrands.length > 0) {
          // Get unique visitor IDs
          const visitorIds = [...new Set(savedBrands.map((s: any) => s.visitor_id))]

          // Fetch push subscriptions for those visitors
          const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth')
            .in('visitor_id', visitorIds)

          if (subscriptions && subscriptions.length > 0) {
            // Fire-and-forget — fan out cancellation push
            const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearemakers.pt'
            fetch(`${SITE_URL}/api/push/broadcast`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: `${marketName} cancelled`,
                body: 'This market has been cancelled for today. Check the app for alternative markets.',
                url: '/markets',
              }),
            }).catch(() => {})
          }
        }
      }
    } catch {
      // Push notification failure must never block the status update
    }
  }

  revalidatePath('/dashboard/curator')
  return { success: true }
}

// ── Update Market ─────────────────────────────────────────────

export async function updateMarket(marketId: string, formData: FormData) {
  const { supabase, user, error } = await getAuthenticatedCurator()
  if (error || !user) return { error }

  const title = (formData.get('title') as string)?.trim()
  const eventDate = formData.get('event_date') as string
  const eventDateEnd = (formData.get('event_date_end') as string) || null
  const startsAt = formData.get('starts_at') as string
  const endsAt = formData.get('ends_at') as string

  if (!title || !eventDate || !startsAt || !endsAt) {
    return { error: 'Title, date and times are required.' }
  }

  const { error: updateError } = await supabase
    .from('markets')
    .update({
      title,
      event_date: eventDate,
      event_date_end: eventDateEnd || null,
      starts_at: startsAt,
      ends_at: endsAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', marketId)
    .eq('curator_id', user.id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard/curator')
  return { success: true }
}

// ── Delete Market ─────────────────────────────────────────────

export async function deleteMarket(marketId: string) {
  const { supabase, user, error } = await getAuthenticatedCurator()
  if (error || !user) return { error }

  const { error: deleteError } = await supabase
    .from('markets')
    .delete()
    .eq('id', marketId)
    .eq('curator_id', user.id)
    .eq('status', 'scheduled')

  if (deleteError) return { error: deleteError.message }

  revalidatePath('/dashboard/curator')
  return { success: true }
}

// ── Pin Featured Maker ─────────────────────────────────────────

export async function pinFeaturedMaker(formData: FormData) {
  const { supabase, user, error } = await getAuthenticatedCurator()
  if (error || !user) return { error }

  const makerId = formData.get('maker_id') as string
  const marketId = (formData.get('market_id') as string) || null

  if (!makerId) return { error: 'No maker selected.' }

  const { error: insertError } = await supabase
    .from('curator_featured_makers')
    .insert({
      curator_id: user.id,
      maker_id: makerId,
      market_id: marketId,
      pinned_until: new Date(Date.now() + 7 * 86400_000).toISOString(),
    })

  if (insertError) {
    if (insertError.message.includes('at most 3')) {
      return { error: 'Spotlight is full. Unpin a maker first.' }
    }
    return { error: insertError.message }
  }

  revalidatePath('/dashboard/curator')
  return { success: true }
}

// ── Unpin Featured Maker ───────────────────────────────────────

export async function unpinFeaturedMaker(featuredId: string) {
  const { supabase, user, error } = await getAuthenticatedCurator()
  if (error || !user) return { error }

  const { error: deleteError } = await supabase
    .from('curator_featured_makers')
    .delete()
    .eq('id', featuredId)
    .eq('curator_id', user.id)

  if (deleteError) return { error: deleteError.message }

  revalidatePath('/dashboard/curator')
  return { success: true }
}

// ── Verify Attendance ─────────────────────────────────────────

export async function verifyAttendance(attendanceId: string) {
  const { supabase, user, error } = await getAuthenticatedCurator()
  if (error || !user) return { error }

  const { error: updateError } = await supabase
    .from('attendance')
    .update({ is_verified: true })
    .eq('id', attendanceId)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard/curator')
  return { success: true }
}
