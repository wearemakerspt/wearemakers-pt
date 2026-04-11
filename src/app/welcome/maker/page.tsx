'use client'
import Link from 'next/link'

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const BENEFITS = [
  { n: '01', t: 'BE FOUND — LIVE', b: 'Check in with one tap. Your brand appears instantly in the Live Now section. Visitors searching for makers right now will find you.' },
  { n: '02', t: 'BUILD YOUR AUDIENCE', b: 'Every visitor who saves your brand leaves their contact. Those leads are yours — exportable as CSV, forever.' },
  { n: '03', t: 'PUSH NOTIFICATIONS', b: 'When you check in, every visitor who saved your brand gets a push notification: "Oakwall is live at Príncipe Real today."' },
  { n: '04', t: 'OFFER SYSTEM', b: 'Activate a promo code. When a visitor saves your brand, the offer triggers automatically — shown at your stall as a digital stamp.' },
  { n: '05', t: 'MARKET CALENDAR', b: 'Publish your upcoming market dates. Visitors plan ahead. Your brand stays visible between markets, not just when you\'re live.' },
  { n: '06', t: 'ALWAYS FREE', b: 'No subscription. No commission. No credit card. The platform grows when makers grow — that\'s the only model that makes sense.' },
]

export default function WelcomeMakerPage() {
  return (
    <div style={{ background: '#111009', minHeight: '100dvh', color: '#F0EBE1', fontFamily: "'Barlow', sans-serif", overflowX: 'hidden' }}>

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.055, backgroundImage: GRAIN }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '56px', background: '#111009', borderBottom: '3px solid #E8341A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 1000 }}>
        <Link href="/" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '18px', color: '#E8341A', textTransform: 'uppercase', textDecoration: 'none', letterSpacing: '-0.01em' }}>
          WEAREMAKERS<span style={{ color: '#F0EBE1' }}>.PT</span>
        </Link>
        <Link href="/" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,235,225,0.3)', textDecoration: 'none' }}>
          EXPLORE APP →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '56px', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '56px 80px 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg,transparent,transparent calc(100%/12 - 1px),rgba(255,255,255,.015) calc(100%/12 - 1px),rgba(255,255,255,.015) calc(100%/12))', pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: '#E8341A', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '24px', height: '1px', background: '#E8341A', display: 'inline-block' }} />
          FOR INDEPENDENT MAKERS
        </div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(56px,9vw,120px)', lineHeight: 0.88, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '32px', borderLeft: '5px solid #E8341A', paddingLeft: '32px' }}>
          BE FOUND.<br />
          <span style={{ color: '#E8341A', fontStyle: 'italic' }}>LIVE.</span><br />
          GROW.
        </div>
        <div style={{ paddingLeft: '37px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', maxWidth: '800px' }}>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '16px', color: 'rgba(240,235,225,0.55)', lineHeight: 1.75 }}>
            You already do the hard part — showing up. WEAREMAKERS.PT handles the rest. Be visible before visitors arrive. Build an audience that returns to find you at any market, any day.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/auth/register/maker" style={{ background: '#E8341A', color: '#F0EBE1', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '16px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '18px 32px', textDecoration: 'none', display: 'block', textAlign: 'center', boxShadow: '4px 4px 0 0 rgba(232,52,26,0.35)' }}>
              REGISTER YOUR BRAND — FREE →
            </Link>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,235,225,0.25)', textAlign: 'center' }}>
              No commission · No credit card · Takes 3 minutes
            </div>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section style={{ background: '#2A2820', padding: '80px 80px' }}>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', color: 'rgba(240,235,225,0.35)', textTransform: 'uppercase', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '24px', height: '1px', background: 'rgba(240,235,225,0.2)', display: 'inline-block' }} />
          WHAT YOU GET
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px' }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{ background: '#111009', border: '1px solid #4A4840', padding: '32px 28px' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '56px', color: '#4A4840', lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '12px' }}>{b.n}</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', color: '#F0EBE1', lineHeight: 1, borderBottom: '2px solid #E8341A', paddingBottom: '10px', display: 'inline-block', marginBottom: '14px' }}>{b.t}</div>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: '#7A7870', lineHeight: 1.75 }}>{b.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: '#E8341A', padding: '72px 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(36px,5vw,60px)', textTransform: 'uppercase', color: '#F0EBE1', lineHeight: 0.92, marginBottom: '12px' }}>
            READY TO GO LIVE?
          </div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
            Free forever · No commission · No strings
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <Link href="/auth/register/maker" style={{ background: '#F0EBE1', color: '#E8341A', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '16px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '18px 40px', textDecoration: 'none', display: 'inline-block' }}>
            REGISTER YOUR BRAND →
          </Link>
          <Link href="/" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
            Explore the app first →
          </Link>
        </div>
      </section>

    </div>
  )
}
