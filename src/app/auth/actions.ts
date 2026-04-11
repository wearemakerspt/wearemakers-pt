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

// ── Sign In with Magic Link ───────────────────────────────────

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

// ── Generic signUp (legacy — /auth/register) ──────────────────

export async function signUp(formData: FormData) {
  const role = (formData.get('role') as string) || 'visitor'
  return signUpWithRole(formData, role, '/auth/register')
}

// ── Role-specific signUps ─────────────────────────────────────

export async function signUpVisitor(formData: FormData) {
  return signUpWithRole(formData, 'visitor', '/auth/register/visitor')
}

export async function signUpMaker(formData: FormData) {
  return signUpWithRole(formData, 'maker', '/auth/register/maker')
}

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
  const displayName = (formData.get('display_name') as string)?.trim()
  const instagramHandle = (formData.get('instagram_handle') as string)?.trim() || null

  // Role-specific extra fields
  const category = (formData.get('category') as string)?.trim() || null       // maker
  const marketName = (formData.get('market_name') as string)?.trim() || null  // curator

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
        category,       // stored in user metadata for reference
        market_name: marketName,
      },
    },
  })

  if (error) {
    redirect(`${errorRedirectBase}?error=${encodeURIComponent(error.message)}`)
  }

  // Auto-confirmed (email confirmation disabled in Supabase)
  if (data.session && data.user) {
    // Build bio_i18n with category pre-populated for makers
    const bioI18n = category ? { _category: category } : undefined

    const profileData: Record<string, any> = {
      id: data.user.id,
      display_name: displayName,
      instagram_handle: instagramHandle,
      role: 'visitor', // Admin promotes to maker/curator after review
      is_approved: false,
      applied_at: new Date().toISOString(),
    }

    if (bioI18n) profileData.bio_i18n = bioI18n

    // Store market_name as private note in bio_i18n for curators
    if (marketName && role === 'curator') {
      profileData.bio_i18n = {
        ...(profileData.bio_i18n ?? {}),
        _market_name: marketName,
      }
    }

    await supabase.from('profiles').upsert(profileData, {
      onConflict: 'id',
      ignoreDuplicates: false,
    })

    revalidatePath('/', 'layout')

    // After auto-confirm, show pending approval state
    // (is_approved = false so dashboard will show pending screen)
    redirect(`${errorRedirectBase}?success=1`)
  }

  // Email confirmation required
  redirect(`${errorRedirectBase}?success=1`)
}

// ── Sign Out ──────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
