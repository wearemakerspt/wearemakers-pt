import type { Metadata } from 'next'
import Link from 'next/link'
import { signUp } from '@/app/auth/actions'

export const metadata: Metadata = {
  title: 'Join — WEAREMAKERS.PT',
  robots: { index: false, follow: false },
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string }
}) {
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = {
    width: '100%', background: 'var(--P)', border: '2px solid var(--INK)',
    padding: '12px 14px', fontFamily: 'var(--MONO)', fontSize: '16px',
    color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const,
  }

  if (searchParams.success) {
    return (
      <main style={{ background: 'var(--INK)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '48px', color: 'var(--GRN)', lineHeight: 1, marginBottom: '16px' }}>✓</div>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: 'var(--P)', marginBottom: '12px' }}>
            CHECK YOUR EMAIL
          </div>
          <div style={{ fontFamily: 'var(--MONO)', fontSize: '15px', color: 'rgba(240,236,224,.5)', lineHeight: 1.6, marginBottom: '24px' }}>
            We've sent a confirmation link to your email. Click it to activate your account.
          </div>
          <Link href="/auth/login" style={{ ...T, fontWeight: 700, color: 'var(--P)', background: 'var(--RED)', border: '3px solid var(--RED)', padding: '12px 22px', textDecoration: 'none', display: 'inline-block' }}>
            SIGN IN →
          </Link>
        </div>
      </main>
    )
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
            Free for makers &amp; curators · No commission
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: 'var(--P)', border: '3px solid var(--P)', boxShadow: '8px 8px 0 0 var(--RED)' }}>
          <div style={{ background: 'var(--INK)', padding: '10px 16px', borderBottom: '3px solid var(--INK)' }}>
            <div style={{ ...T, fontWeight: 700, color: 'var(--P)' }}>JOIN WEAREMAKERS.PT</div>
          </div>

          <form action={signUp} style={{ padding: '20px' }}>

            {searchParams.error && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(200,41,26,.08)', borderLeft: '3px solid var(--RED)', ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700 }}>
                ✗ {searchParams.error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>
                YOUR NAME / BRAND NAME *
              </label>
              <input type="text" name="display_name" required placeholder="e.g. OAKWALL or Maria Silva" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>
                EMAIL ADDRESS *
              </label>
              <input type="email" name="email" required autoComplete="email" placeholder="your@email.com" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>
                PASSWORD *
              </label>
              <input type="password" name="password" required minLength={8} placeholder="Min 8 characters" style={inputStyle} />
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '8px' }}>
                I AM A... *
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'maker', label: 'MAKER', desc: 'I sell at markets' },
                  { value: 'visitor', label: 'VISITOR', desc: 'I explore markets' },
                ].map(opt => (
                  <label key={opt.value} style={{ flex: 1, cursor: 'pointer' }}>
                    <input type="radio" name="role" value={opt.value} defaultChecked={opt.value === 'maker'} style={{ display: 'none' }} />
                    <div style={{ padding: '10px', border: '2px solid var(--INK)', textAlign: 'center', background: 'var(--P2)' }}>
                      <div style={{ ...T, fontWeight: 700, fontSize: '11px', color: 'var(--INK)' }}>{opt.label}</div>
                      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" style={{ ...T, fontWeight: 700, fontSize: '12px', width: '100%', padding: '14px', background: 'var(--RED)', color: 'var(--P)', border: '3px solid var(--RED)', cursor: 'pointer', boxShadow: '4px 4px 0 0 var(--INK)' }}>
              JOIN FREE →
            </button>

            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', textAlign: 'center', marginTop: '12px', lineHeight: 1.8 }}>
              FREE FOREVER · NO COMMISSION · NO CREDIT CARD
            </div>
          </form>

          <div style={{ padding: '14px 20px', borderTop: '1px dashed rgba(24,22,20,.15)' }}>
            <Link href="/auth/login" style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', textDecoration: 'none' }}>
              Already have an account? Sign in →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
