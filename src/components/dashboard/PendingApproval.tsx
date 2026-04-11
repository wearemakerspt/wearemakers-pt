import Link from 'next/link'

interface Props {
  role: 'maker' | 'curator'
  displayName: string
}

const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

export default function PendingApproval({ role, displayName }: Props) {
  const isMaker = role === 'maker'

  return (
    <main style={{ background: 'var(--INK)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--P)' }}>
            WEAREMAKERS<span style={{ color: 'var(--RED)' }}>.PT</span>
          </div>
        </Link>

        {/* Card */}
        <div style={{ border: '3px solid rgba(240,236,224,.1)', background: 'var(--INK2)' }}>

          {/* Header */}
          <div style={{ background: 'rgba(240,236,224,.04)', padding: '16px', borderBottom: '2px solid rgba(240,236,224,.08)' }}>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.3)', marginBottom: '6px' }}>
              APPLICATION RECEIVED
            </div>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: 'var(--P)', lineHeight: 1 }}>
              {displayName}
            </div>
          </div>

          {/* Status */}
          <div style={{ padding: '20px 16px', borderBottom: '2px solid rgba(240,236,224,.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {/* Animated waiting indicator */}
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(240,236,224,.25)', flexShrink: 0, animation: 'pulse 2s ease-in-out infinite' }} />
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
              <div style={{ ...T, fontWeight: 700, fontSize: '11px', color: 'rgba(240,236,224,.6)' }}>
                PENDING APPROVAL
              </div>
            </div>
            <p style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(240,236,224,.45)', lineHeight: 1.7, marginBottom: 0 }}>
              {isMaker
                ? 'Your brand application is being reviewed by the WEAREMAKERS.PT team. You\'ll receive an email once your account is approved — usually within 24 hours.'
                : 'Your market curator application is being reviewed. Our team will set up your market location and calendar within 48 hours. We\'ll be in touch by email.'}
            </p>
          </div>

          {/* What happens next */}
          <div style={{ padding: '16px', borderBottom: '2px solid rgba(240,236,224,.08)' }}>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.25)', marginBottom: '12px' }}>
              WHAT HAPPENS NEXT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(isMaker ? [
                'WAM team reviews your brand application',
                'You receive an email confirmation',
                'Your dashboard unlocks — check in at your first market',
                'Visitors start discovering your brand live',
              ] : [
                'WAM team reviews your curator application',
                'We contact you to set up your market location and calendar',
                'Your Command Center unlocks',
                'You can open markets and curate your brand selection',
              ]).map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', flexShrink: 0, marginTop: '1px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(240,236,224,.4)', lineHeight: 1.5 }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{ flex: 1, fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--RED)', color: 'var(--P)', border: '2px solid var(--RED)', padding: '12px 16px', textDecoration: 'none', display: 'block', textAlign: 'center' }}
            >
              EXPLORE THE PLATFORM →
            </Link>
            <a
              href="mailto:info@wearemakers.pt"
              style={{ fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(240,236,224,.35)', border: '2px solid rgba(240,236,224,.12)', padding: '12px 16px', textDecoration: 'none', display: 'block', textAlign: 'center' }}
            >
              CONTACT US
            </a>
          </div>
        </div>

        {/* Contact note */}
        <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.2)', textAlign: 'center', marginTop: '20px', lineHeight: 1.8 }}>
          Questions? Email info@wearemakers.pt
        </div>

      </div>
    </main>
  )
}
