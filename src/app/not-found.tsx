import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ background: 'var(--INK)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'block', marginBottom: '48px' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--P)' }}>
            WEAREMAKERS<span style={{ color: 'var(--RED)' }}>.PT</span>
          </div>
        </Link>

        {/* 404 */}
        <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(80px,20vw,140px)', textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 0.85, color: 'rgba(240,236,224,.06)', marginBottom: '32px', userSelect: 'none' }}>
          404
        </div>

        {/* Message */}
        <div style={{ borderLeft: '4px solid var(--RED)', paddingLeft: '20px', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(28px,6vw,40px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.92, color: 'var(--P)', marginBottom: '12px' }}>
            THIS STALL<br />HAS PACKED UP.
          </div>
          <p style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(240,236,224,.4)', lineHeight: 1.7, margin: 0 }}>
            The page you're looking for doesn't exist or has moved. The makers are still out there — try the live markets or brand directory.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{ flex: 1, fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--RED)', color: 'var(--P)', border: '2px solid var(--RED)', padding: '14px 20px', textDecoration: 'none', display: 'block', textAlign: 'center' }}
          >
            LIVE MARKETS →
          </Link>
          <Link
            href="/brands"
            style={{ flex: 1, fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(240,236,224,.5)', border: '2px solid rgba(240,236,224,.15)', padding: '14px 20px', textDecoration: 'none', display: 'block', textAlign: 'center' }}
          >
            ALL BRANDS
          </Link>
        </div>

        {/* Sub note */}
        <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.18)', marginTop: '32px' }}>
          WEAREMAKERS.PT · LISBON STREET MARKETS · ERROR 404
        </div>

      </div>
    </main>
  )
}
