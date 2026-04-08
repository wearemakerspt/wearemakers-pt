'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ── Sign In with Email + Password ────────────────────────────

export async function signInWithPassword(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || '/'

  if (!email || !password) {
    redirect(`/auth/login?error=${encodeURIComponent('Email and password are required.')}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(
      `/auth/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`
    )
  }

  revalidatePath('/', 'layout')
  redirect(next)
}

// ── Sign In with Magic Link (email OTP) ──────────────────────

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string
  const next = (formData.get('next') as string) || '/'

  if (!email) {
    redirect(`/auth/login?error=${encodeURIComponent('Email is required.')}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/auth/login?error=${encodeURIComponent('✓ Check your email for a sign-in link.')}`)
}

// ── Register ─────────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('display_name') as string
  const instagramHandle = formData.get('instagram_handle') as string
  const role = (formData.get('role') as string) || 'maker'

  if (!email || !password || !displayName) {
    redirect(`/auth/register?error=${encodeURIComponent('Please fill in all required fields.')}`)
  }

  if (password.length < 8) {
    redirect(`/auth/register?error=${encodeURIComponent('Password must be at least 8 characters.')}`)
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        // Stored in auth.users.raw_user_meta_data
        // Callback route reads this to pre-fill the profile row
        full_name: displayName,
        instagram_handle: instagramHandle,
        requested_role: role,
      },
    },
  })

  if (error) {
    redirect(`/auth/register?error=${encodeURIComponent(error.message)}`)
  }

  // If email confirmation is disabled in Supabase (for dev), user is auto-confirmed
  if (data.session) {
    // Logged in immediately — create profile
    await supabase.from('profiles').upsert(
      {
        id: data.user!.id,
        display_name: displayName,
        instagram_handle: instagramHandle || null,
        role: 'visitor', // Admin promotes to maker/curator after review
      },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    revalidatePath('/', 'layout')
    redirect('/journal')
  }

  // Email confirmation required
  redirect(
    `/auth/register?success=${encodeURIComponent(
      '✓ Application submitted. Check your email to confirm your address.'
    )}`
  )
}

// ── Sign Out ──────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/journal')
}
