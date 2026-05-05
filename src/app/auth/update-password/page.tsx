'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
const inputStyle = {
  width: '100%', background: 'var(--P)', border: '2px solid var(--INK)',
  padding: '12px 14px', fontFamily: 'var(--MONO)', fontSize: '16px',
  color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const,
}

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Supabase puts the session in the URL hash after clicking the reset link
    // The client SDK handles the exchange automatically on createClient()
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        // Try to exchange code from URL params (PKCE flow)
        const hash = window.location.hash
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (code) {
          supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
            if (error) {
              setError('Reset link is invalid or expired. Please request a new one.')
            } else {
              setReady(true)
            }
          })
        } else if (hash) {
          // Hash-based flow — session is set automatically by Supabase client
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) setReady(true)
              else setError('Reset link is invalid or expired. Please request a new one.')
            })
          }, 500)
        } else {
          setError('Reset link is invalid or expired. Please request a new one.')
        }
      }
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const password = fd.get('password') as string
    const confirm = fd.get('confirm') as string

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setError(null)
    setIsPending(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setIsPending(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/maker'), 2000)
    }
  }

  return (
    <main style={{ background: 'var(--INK)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '36px', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.9, color: 'var(--P)' }}>
              WEAREMAKERS<span style={{ color: 'var(--RED)' }}>.PT</span>
            </div>
          </Link>
          <div style={{ ...T, fontSize: '10px', color: 'rgba(240,236,224,.3)', marginTop: '6px' }}>
            Lisbon Street Markets · Maker &amp; Curator Portal
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--P)', border: '3px solid var(--P)', boxShadow: '8px 8px 0 0 var(--RED)' }}>
          <div style={{ background: 'var(--INK)', padding: '10px 16px', borderBottom: '3px solid var(--INK)' }}>
            <div style={{ ...T, fontWeight: 700, color: 'var(--P)' }}>SET NEW PASSWORD</div>
          </div>

          <div style={{ padding: '20px' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '48px', color: 'var(--GRN)', marginBottom: '12px' }}>✓</div>
                <div style={{ ...T, fontWeight: 700, fontSize: '12px', color: 'var(--INK)', marginBottom: '8px' }}>PASSWORD UPDATED</div>
                <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'var(--GRY)' }}>Redirecting to your dashboard...</div>
              </div>
            ) : !ready && !error ? (
              <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', textAlign: 'center', padding: '20px 0' }}>
                VERIFYING RESET LINK...
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(200,41,26,.08)', borderLeft: '3px solid var(--RED)', ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700 }}>
                    ✗ {error}
                    {!ready && (
                      <div style={{ marginTop: '8px' }}>
                        <Link href="/auth/reset-password" style={{ color: 'var(--RED)', textDecoration: 'underline' }}>
                          Request a new reset link →
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {ready && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>
                        NEW PASSWORD *
                      </label>
                      <input
                        type="password" name="password" required
                        autoComplete="new-password" placeholder="Min. 8 characters"
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>
                        CONFIRM PASSWORD *
                      </label>
                      <input
                        type="password" name="confirm" required
                        autoComplete="new-password" placeholder="Repeat your password"
                        style={inputStyle}
                      />
                    </div>

                    <button type="submit" disabled={isPending} style={{ ...T, fontWeight: 700, fontSize: '12px', width: '100%', padding: '14px', background: 'var(--RED)', color: 'var(--P)', border: '3px solid var(--RED)', cursor: isPending ? 'not-allowed' : 'pointer', boxShadow: '4px 4px 0 0 var(--INK)', opacity: isPending ? 0.7 : 1 }}>
                      {isPending ? 'UPDATING...' : 'SET NEW PASSWORD →'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', ...T, fontSize: '9px', color: 'rgba(240,236,224,.2)' }}>
          WEAREMAKERS.PT · LISBON · FREE FOR MAKERS &amp; CURATORS
        </div>
      </div>
    </main>
  )
}
