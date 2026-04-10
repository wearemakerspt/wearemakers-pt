'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', supabase: null, user: null }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized', supabase: null, user: null }
  return { error: null, supabase, user }
}

// ── Spaces ─────────────────────────────────────────────────
export async function createSpace(formData: FormData) {
  const { error, supabase, user } = await getAdminClient()
  if (error || !supabase) return { error }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required' }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const { error: e } = await supabase.from('spaces').insert({
    name, slug,
    address: (formData.get('address') as string)?.trim() || null,
    parish: (formData.get('parish') as string)?.trim() || null,
    city: (formData.get('city') as string)?.trim() || 'Lisbon',
    lat: parseFloat(formData.get('lat') as string) || 0,
    lng: parseFloat(formData.get('lng') as string) || 0,
    is_active: true,
    created_by: user!.id,
  })
  if (e) return { error: e.message }
  revalidatePath('/dashboard/admin')
  return { success: true }
}

// ── Makers ─────────────────────────────────────────────────
export async function toggleVerifiedBadge(makerId: string, verified: boolean) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').update({ is_verified: verified, verified_since: verified ? new Date().toISOString() : null }).eq('id', makerId)
  revalidatePath('/dashboard/admin')
}

export async function toggleMakerActive(makerId: string, active: boolean) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').update({ is_active: active }).eq('id', makerId)
  revalidatePath('/dashboard/admin')
}

export async function deleteMaker(makerId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').delete().eq('id', makerId)
  revalidatePath('/dashboard/admin')
}

// ── Curators ───────────────────────────────────────────────
export async function deleteCurator(curatorId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').delete().eq('id', curatorId)
  revalidatePath('/dashboard/admin')
}

export async function assignCuratorToSpace(curatorId: string, spaceId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  // Update markets to assign this curator to this space
  await supabase.from('markets').update({ curator_id: curatorId }).eq('space_id', spaceId).is('curator_id', null)
  revalidatePath('/dashboard/admin')
}

// ── Markets ────────────────────────────────────────────────
export async function adminSetMarketStatus(marketId: string, status: string) {
  const { error, supabase, user } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('markets').update({
    status,
    admin_override: true,
    open_reason: 'admin_override',
    opened_by: user!.id,
    opened_at: new Date().toISOString(),
  }).eq('id', marketId)
  revalidatePath('/dashboard/admin')
}

// ── Visitors ───────────────────────────────────────────────
export async function deleteVisitor(visitorId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').delete().eq('id', visitorId)
  revalidatePath('/dashboard/admin')
}

export async function downloadVisitorEmails() {
  // Handled client-side in component
  return { success: true }
}

// ── Gems ───────────────────────────────────────────────────
export async function approveGem(gemId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('gems').update({ is_approved: true }).eq('id', gemId)
  revalidatePath('/dashboard/admin')
}

export async function rejectGem(gemId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('gems').delete().eq('id', gemId)
  revalidatePath('/dashboard/admin')
}

// ── WAM Top 20 ─────────────────────────────────────────────
export async function setTop20(makerId: string, position: number) {
  const { error, supabase, user } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('wam_top20').upsert({ position, maker_id: makerId, pinned_by: user!.id, pinned_at: new Date().toISOString() }, { onConflict: 'position' })
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function removeTop20(position: number) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('wam_top20').delete().eq('position', position)
  revalidatePath('/dashboard/admin')
}

// ── Push Notifications ─────────────────────────────────────
export async function sendAdminPush(title: string, body: string, url: string) {
  const { error } = await getAdminClient()
  if (error) return { error, sent: 0 }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearemakers.pt'
  try {
    const res = await fetch(`${SITE_URL}/api/push/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url }),
    })
    const data = await res.json()
    return { sent: data.sent ?? 0 }
  } catch {
    return { sent: 0 }
  }
}
