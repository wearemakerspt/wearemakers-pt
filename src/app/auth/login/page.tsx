import type { Metadata } from 'next'
import Link from 'next/link'
import { signInWithPassword } from '@/app/auth/actions'

export const metadata: Metadata = {
  title: 'Sign In — WEAREMAKERS.PT',
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const params = await searchParams
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = {
    width: '100%', background: 'var(--P)', border: '2px solid var(--INK)',
    padding: '12px 14px', fontFamily: 'var(--MONO)', fontSize: '16px',
    color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const,
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

        {/* Form card */}
        <div style={{ background: 'var(--P)', border: '3px solid var(--P)', boxShadow: '8px 8px 0 0 var(--RED)' }}>
          <div style={{ background: 'var(--RED)', padding: '10px 16px', borderBottom: '3px solid var(--INK)' }}>
            <div style={{ ...T, fontWeight: 700, color: 'var(--P)' }}>SIGN IN</div>
          </div>

          <form action={signInWithPassword} style={{ padding: '20px' }}>
            {params.next && (
              <input type="hidden" name="next" value={params.next} />
            )}

            {params.error && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(200,41,26,.08)', borderLeft: '3px solid var(--RED)', ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700 }}>
                ✗ {params.error === 'invalid_credentials' ? 'Invalid email or password.' : params.error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>
                EMAIL ADDRESS *
              </label>
              <input type="email" name="email" required autoComplete="email" placeholder="your@email.com" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>
                PASSWORD *
              </label>
              <input type="password" name="password" required autoComplete="current-password" placeholder="••••••••••••" style={inputStyle} />
            </div>

            <button type="submit" style={{ ...T, fontWeight: 700, fontSize: '12px', width: '100%', padding: '14px', background: 'var(--INK)', color: 'var(--P)', border: '3px solid var(--INK)', cursor: 'pointer', boxShadow: '4px 4px 0 0 var(--RED)' }}>
              ENTER THE CIRCUIT →
            </button>
          </form>

          <div style={{ padding: '14px 20px', borderTop: '1px dashed rgba(24,22,20,.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/auth/register" style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', textDecoration: 'none' }}>
              No account? Apply for access →
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', ...T, fontSize: '9px', color: 'rgba(240,236,224,.2)' }}>
          WEAREMAKERS.PT · LISBON · FREE FOR MAKERS &amp; CURATORS
        </div>
      </div>
    </main>
  )
}
