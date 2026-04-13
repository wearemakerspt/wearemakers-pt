import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllBrands } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import RealtimeRefresh from '@/components/ui/RealtimeRefresh'
import BrandCard from '@/components/brands/BrandCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Brands — WEAREMAKERS.PT',
  description: '200+ independent maker brands at Lisbon street markets. Ceramics, leather, textiles, print, jewellery and more.',
  alternates: { canonical: '/brands' },
}

const CATEGORIES = ['ALL', 'CERAMICS', 'LEATHER', 'TEXTILE', 'PAPER', 'JEWELLERY', 'GLASS', 'WOODWORK', 'ZINES', 'BOOKS']

export default async function BrandsPage() {
  const [brands, user] = await Promise.all([getAllBrands(), getCurrentUser()])

  const liveCount = brands.filter(b => b.is_live).length
  const liveBrands = brands.filter(b => b.is_live)
  const otherBrands = brands.filter(b => !b.is_live)

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={liveCount} />
      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

        {/* Editorial header */}
        <div style={{ padding: '16px 16px 0', background: '#f0ece0', borderBottom: '3px solid #181614' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>
            200+ INDEPENDENT MAKERS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(36px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: '#181614' }}>
              ALL BRANDS
            </div>
            {liveCount > 0 && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#1a5c30', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '8px' }}>●</span> {liveCount} LIVE NOW
              </div>
            )}
          </div>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', padding: '12px 0 0', flexWrap: 'nowrap' }}>
            {CATEGORIES.slice(0, 6).map((cat, i) => (
              <span key={cat} style={{
                fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px',
                letterSpacing: '0.14em', textTransform: 'uppercase', padding: '8px 14px',
                border: '2px solid #181614', background: i === 0 ? '#c8291a' : '#f0ece0',
                color: i === 0 ? '#fff' : '#181614', marginRight: '6px', marginBottom: '10px',
                display: 'inline-block', flexShrink: 0, cursor: 'pointer',
              }}>{i === 0 ? '● LIVE NOW' : cat}</span>
            ))}
          </div>
        </div>

        {/* Brand grid — 4 col */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '3px solid #181614' }}>
          {[...liveBrands, ...otherBrands].map(b => (
            <BrandCard key={b.id} brand={b} view="grid" />
          ))}
          {/* Join CTA card */}
          <Link href="/auth/register" style={{ textDecoration: 'none', background: '#181614', borderRight: '2px solid #181614', borderBottom: '2px solid #181614', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', minHeight: '120px' }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', fontWeight: 700, color: 'rgba(240,236,224,.4)', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.5, marginBottom: '8px' }}>
              SELL AT<br />LISBON<br />MARKETS?
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>JOIN FREE →</div>
          </Link>
        </div>

        {brands.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)' }}>No brands registered yet.</div>
          </div>
        )}
      </main>
    </>
  )
}
