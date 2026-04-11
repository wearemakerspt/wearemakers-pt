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

// ── Generic signUp (legacy — used by old /auth/register) ─────

export async function signUp(formData: FormData) {
  const role = (formData.get('role') as string) || 'visitor'
  return signUpWithRole(formData, role, '/auth/register')
}

// ── Visitor signUp ────────────────────────────────────────────

export async function signUpVisitor(formData: FormData) {
  return signUpWithRole(formData, 'visitor', '/auth/register/visitor')
}

// ── Maker signUp ──────────────────────────────────────────────

export async function signUpMaker(formData: FormData) {
  return signUpWithRole(formData, 'maker', '/auth/register/maker')
}

// ── Curator signUp ────────────────────────────────────────────

export async function signUpCurator(formData: FormData) {
  return signUpWithRole(formData, 'curator', '/auth/register/curator')
}

// ── Shared signUp logic ───────────────────────────────────────

async function signUpWithRole(
  formData: FormData,
  role: string,
  errorRedirectBase: string
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('display_name') as string
  const instagramHandle = formData.get('instagram_handle') as string

  if (!email || !password || !displayName) {
    redirect(`${errorRedirectBase}?error=${encodeURIComponent('Please fill in all required fields.')}`)
  }

  if (password.length < 8) {
    redirect(`${errorRedirectBase}?error=${encodeURIComponent('Password must be at least 8 characters.')}`)
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: displayName,
        instagram_handle: instagramHandle,
        requested_role: role,
      },
    },
  })

  if (error) {
    redirect(`${errorRedirectBase}?error=${encodeURIComponent(error.message)}`)
  }

  // Auto-confirmed (email confirmation disabled in Supabase dev)
  if (data.session) {
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

    // Role-specific post-registration destination
    if (role === 'maker') redirect('/dashboard/maker')
    if (role === 'curator') redirect('/dashboard/curator')
    redirect('/')
  }

  // Email confirmation required — show success state
  redirect(`${errorRedirectBase}?success=1`)
}

// ── Sign Out ──────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
