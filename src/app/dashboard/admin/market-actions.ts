'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createMarket(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: 'Admin only' }

  const title = (formData.get('title') as string)?.trim()
  const space_id = formData.get('space_id') as string
  const curator_id = (formData.get('curator_id') as string) || null
  const event_date = formData.get('event_date') as string
  const event_date_end_raw = (formData.get('event_date_end') as string)?.trim() || null
  const starts_at = formData.get('starts_at') as string
  const ends_at = formData.get('ends_at') as string

  if (!title || !space_id || !event_date || !starts_at || !ends_at) {
    return { error: 'Please fill in all required fields' }
  }

  // event_date_end: only store if different from event_date
  const event_date_end = event_date_end_raw && event_date_end_raw !== event_date ? event_date_end_raw : null

  const { error } = await supabase.from('markets').insert({
    title,
    space_id,
    curator_id,
    event_date,
    event_date_end,
    starts_at: starts_at + ':00',
    ends_at: ends_at + ':00',
    status: 'scheduled',
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin')
  revalidatePath('/markets')
  return { success: true }
}

export async function updateMarket(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: 'Admin only' }

  const market_id = formData.get('market_id') as string
  const title = (formData.get('title') as string)?.trim()
  const space_id = formData.get('space_id') as string
  const curator_id = (formData.get('curator_id') as string) || null
  const event_date = formData.get('event_date') as string
  const event_date_end_raw = (formData.get('event_date_end') as string)?.trim() || null
  const starts_at = formData.get('starts_at') as string
  const ends_at = formData.get('ends_at') as string
  const status = formData.get('status') as string

  if (!market_id || !title || !space_id || !event_date || !starts_at || !ends_at) {
    return { error: 'Please fill in all required fields' }
  }

  const event_date_end = event_date_end_raw && event_date_end_raw !== event_date ? event_date_end_raw : null

  const { error } = await supabase.from('markets').update({
    title,
    space_id,
    curator_id,
    event_date,
    event_date_end,
    starts_at: starts_at.includes(':') && starts_at.length === 5 ? starts_at + ':00' : starts_at,
    ends_at: ends_at.includes(':') && ends_at.length === 5 ? ends_at + ':00' : ends_at,
    status,
  }).eq('id', market_id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin')
  revalidatePath('/markets')
  revalidatePath('/')
  return { success: true }
}

export async function deleteMarket(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: 'Admin only' }

  const { error } = await supabase.from('markets').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin')
  revalidatePath('/markets')
  revalidatePath('/')
  return { success: true }
}

export async function cancelMarket(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: 'Admin only' }

  const { error } = await supabase.from('markets').update({ status: 'cancelled' }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin')
  revalidatePath('/markets')
  revalidatePath('/')
  return { success: true }
}
