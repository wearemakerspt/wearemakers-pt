'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ── Live Status ───────────────────────────────────────────────

/**
 * Toggle the maker's is_active field, which controls
 * whether their card appears in the live public feed.
 */
export async function setLiveStatus(isActive: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Field Notes / Daily Offer ─────────────────────────────────

/**
 * Update the maker's digital_offer — the text that appears
 * on their public card and Courtesy overlay.
 */
export async function saveFieldNotes(formData: FormData) {
  const offer = (formData.get('offer') as string | null)?.trim() ?? null
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ digital_offer: offer || null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Check In ──────────────────────────────────────────────────

/**
 * Upsert an attendance row for a given market.
 * Sets checked_out_at = NULL (active check-in).
 * The community-flip trigger fires automatically in Postgres.
 */
export async function checkInToMarket(formData: FormData) {
  const marketId = formData.get('market_id') as string
  const stallLabel = (formData.get('stall_label') as string | null)?.trim() || null

  if (!marketId) return { error: 'No market selected' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('attendance').upsert(
    {
      market_id: marketId,
      maker_id: user.id,
      stall_label: stallLabel,
      checked_out_at: null,
      checked_in_at: new Date().toISOString(),
    },
    {
      onConflict: 'market_id,maker_id',
      // On conflict: clear checkout time (re-check-in) and update stall
      ignoreDuplicates: false,
    }
  )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Check Out ─────────────────────────────────────────────────

/**
 * Set checked_out_at = NOW() for the given attendance row.
 * Removes the maker from the live public feed.
 */
export async function checkOutOfMarket(attendanceId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('attendance')
    .update({ checked_out_at: new Date().toISOString() })
    .eq('id', attendanceId)
    .eq('maker_id', user.id) // RLS belt-and-suspenders

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Agenda Intent ─────────────────────────────────────────────

/**
 * Declare intent to attend a future market.
 * Creates an attendance row with no checked_in_at (intent only).
 * A separate "Start Transmission" action performs the real check-in.
 */
export async function toggleAttendanceIntent(formData: FormData) {
  const marketId = formData.get('market_id') as string
  const isAttending = formData.get('is_attending') === 'true'

  if (!marketId) return { error: 'No market ID' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (isAttending) {
    // Remove intent
    await supabase
      .from('attendance')
      .delete()
      .eq('market_id', marketId)
      .eq('maker_id', user.id)
      .is('checked_out_at', null)
  } else {
    // Insert intent row — checked_in_at set to future market date at midnight
    const { data: market } = await supabase
      .from('markets')
      .select('event_date, starts_at')
      .eq('id', marketId)
      .single()

    if (!market) return { error: 'Market not found' }

    const intentTime = new Date(`${market.event_date}T${market.starts_at}`)

    await supabase.from('attendance').upsert(
      {
        market_id: marketId,
        maker_id: user.id,
        checked_in_at: intentTime.toISOString(),
        checked_out_at: intentTime.toISOString(), // self-closed intent marker
        stall_label: 'INTENT',
      },
      { onConflict: 'market_id,maker_id', ignoreDuplicates: true }
    )
  }

  revalidatePath('/dashboard/maker')
  return { success: true }
}
