import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

/**
 * Get the currently authenticated user + their profile row.
 * Returns null for both if not signed in.
 * Safe to call from any Server Component — does not throw.
 */
export async function getCurrentUser(): Promise<{
  id: string
  email: string | null
  profile: Profile | null
} | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
  }
}

/**
 * Get a profile by slug — used on public maker profile pages.
 */
export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}
