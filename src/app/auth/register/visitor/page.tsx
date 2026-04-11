import type { Metadata } from 'next'
import Link from 'next/link'
import { signUpVisitor } from '@/app/auth/actions'

export const metadata: Metadata = {
  title: 'Join as a Visitor — WEAREMAKERS.PT',
  robots: { index: false, follow: false },
}

const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
const inputStyle = {
  width: '100%', background: 'var(--P)', border: '2px solid var(--INK)',
  padding: '12px 14px', fontFamily: 'var(--MONO)', fontSize: '16px',
  color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const,
}

export default async function RegisterVisitorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams

  if (params.success) {
    return (
      <main style={{ background: 'var(--INK)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '48px', color: 'var(--GRN)', lineHeight: 1, marginBottom: '16px' }}>✓</div>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: 'var(--P)', marginBottom: '12px' }}>CHECK YOUR EMAIL</div>
          <div style={{ fontFamily: 'var(--MONO)', fontSize: '15px', color: 'rgba(240,236,224,.5)', lineHeight: 1.6, marginBottom: '24px' }}>
            We've sent a confirmation link. Click it to activate your account and start saving brands.
          </div>
          <Link href="/" style={{ ...T, fontWeight: 700, color: 'var(--P)', background: 'var(--RED)', border: '3px solid var(--RED)', padding: '12px 22px', textDecoration: 'none', display: 'inline-block' }}>
            EXPLORE THE APP →
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
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.9, color: 'var(--P)' }}>
              WEAREMAKERS<span style={{ color: 'var(--RED)' }}>.PT</span>
            </div>
          </Link>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.3)', marginTop: '6px' }}>
            Save brands · Get notified · Find them live
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: 'var(--P)', border: '3px solid var(--P)', boxShadow: '8px 8px 0 0 var(--RED)' }}>
          <div style={{ background: 'var(--INK)', padding: '10px 16px', borderBottom: '3px solid var(--INK)' }}>
            <div style={{ ...T, fontWeight: 700, color: 'var(--P)' }}>CREATE VISITOR ACCOUNT</div>
          </div>

          <form action={signUpVisitor} style={{ padding: '20px' }}>
            <input type="hidden" name="role" value="visitor" />

            {params.error && (
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(200,41,26,.08)', borderLeft: '3px solid var(--RED)', ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700 }}>
                ✗ {params.error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>YOUR NAME *</label>
              <input type="text" name="display_name" required placeholder="e.g. Maria Silva" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS *</label>
              <input type="email" name="email" required autoComplete="email" placeholder="your@email.com" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', display: 'block', marginBottom: '6px' }}>PASSWORD *</label>
              <input type="password" name="password" required minLength={8} placeholder="Min 8 characters" style={inputStyle} />
            </div>

            {/* What you get */}
            <div style={{ marginBottom: '20px', padding: '14px', background: 'var(--P2)', borderLeft: '3px solid var(--GRN)' }}>
              <div style={{ ...T, fontSize: '9px', color: 'var(--GRN)', fontWeight: 700, marginBottom: '8px' }}>WHAT YOU GET</div>
              {['Save brands to your Circuit', 'Push notifications when saved brands go live', 'Build your personal market itinerary', 'Exclusive offer codes at the stall'].map((item, i) => (
                <div key={i} style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.5)', marginBottom: '4px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--GRN)', flexShrink: 0 }}>—</span>{item}
                </div>
              ))}
            </div>

            <button type="submit" style={{ ...T, fontWeight: 700, fontSize: '12px', width: '100%', padding: '14px', background: 'var(--RED)', color: 'var(--P)', border: '3px solid var(--RED)', cursor: 'pointer', boxShadow: '4px 4px 0 0 var(--INK)' }}>
              CREATE FREE ACCOUNT →
            </button>

            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', textAlign: 'center', marginTop: '12px', lineHeight: 1.8 }}>
              FREE FOREVER · NO SPAM · NO CREDIT CARD
            </div>
          </form>

          <div style={{ padding: '14px 20px', borderTop: '1px dashed rgba(24,22,20,.15)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <Link href="/auth/login" style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)', textDecoration: 'none' }}>
              Already have an account? Sign in →
            </Link>
            <Link href="/" style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', textDecoration: 'none' }}>
              Just explore →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
