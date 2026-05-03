import type { Metadata } from 'next'
import Link from 'next/link'
import { updatePassword } from '@/app/auth/actions'

export const metadata: Metadata = {
  title: 'Set New Password — WEAREMAKERS.PT',
  robots: { index: false, follow: false },
}

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
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

        {/* Card */}
        <div style={{ background: 'var(--P)', border: '3px solid var(--P)', boxShadow: '8px 8px 0 0 var(--RED)' }}>
          <div style={{ background: 'var(--INK)', padding: '10px 16px', borderBottom: '3px solid var(--INK)' }}>
            <div style={{ ...T, fontWeight: 700, color: 'var(--P)' }}>SET NEW PASSWORD</div>
          </div>

          <form action={updatePassword} style={{ padding: '20px' }}>
            {params.error && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(200,41,26,.08)', borderLeft: '3px solid var(--RED)', ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700 }}>
                ✗ {params.error}
              </div>
            )}

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

            <button type="submit" style={{ ...T, fontWeight: 700, fontSize: '12px', width: '100%', padding: '14px', background: 'var(--RED)', color: 'var(--P)', border: '3px solid var(--RED)', cursor: 'pointer', boxShadow: '4px 4px 0 0 var(--INK)' }}>
              SET NEW PASSWORD →
            </button>
          </form>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', ...T, fontSize: '9px', color: 'rgba(240,236,224,.2)' }}>
          WEAREMAKERS.PT · LISBON · FREE FOR MAKERS &amp; CURATORS
        </div>
      </div>
    </main>
  )
}
