import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth callback route.
 * Supabase redirects here after:
 *   - Email magic link confirmation
 *   - OAuth (Google, Instagram) sign-in
 *   - Email verification for new registrations
 *
 * It exchanges the code for a session, then redirects the user
 * to their dashboard or the originally requested page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/'
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  const origin = url.origin

  // Handle OAuth errors (e.g. user cancelled)
  if (error) {
    const params = new URLSearchParams({
      error: errorDescription ?? error,
    })
    return NextResponse.redirect(`${origin}/auth/login?${params}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[auth/callback] code exchange error:', exchangeError.message)
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent('Sign-in failed. Please try again.')}`
      )
    }

    // New user — create their profile row if it doesn't exist yet.
    // Supabase triggers can handle this, but we do it here as a safety net.
    if (data.user) {
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          display_name:
            data.user.user_metadata?.full_name ??
            data.user.email?.split('@')[0] ??
            'Maker',
          role: 'visitor', // Default role — admin upgrades to maker/curator
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )
    }

    // Redirect to the intended page or role-based dashboard
    const profile = data.user
      ? await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
      : null

    const role = profile?.data?.role
    if (next !== '/') return NextResponse.redirect(`${origin}${next}`)
    if (role === 'maker') return NextResponse.redirect(`${origin}/dashboard/maker`)
    if (role === 'curator') return NextResponse.redirect(`${origin}/dashboard/curator`)
    if (role === 'admin') return NextResponse.redirect(`${origin}/dashboard/admin`)

    return NextResponse.redirect(`${origin}/journal`)
  }

  // No code — something went wrong
  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent('Invalid confirmation link.')}`
  )
}
