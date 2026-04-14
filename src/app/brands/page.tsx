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
  description: '200+ independent maker brands at Lisbon street markets.',
  alternates: { canonical: '/brands' },
}

const CATEGORIES = [
  'ALL', 'CERAMICS', 'LEATHER', 'TEXTILE', 'PAPER', 'JEWELLERY',
  'GLASS', 'WOODWORK', 'ZINES', 'BOOKS', 'ART & PRINTS', 'FOOD',
  'ACCESSORIES', 'HANDMADE', 'GIFTS', 'OTHER',
]

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif"

export default async function BrandsPage() {
  const [brands, user] = await Promise.all([getAllBrands(), getCurrentUser()])
  const liveCount = brands.filter(b => b.is_live).length
  const liveBrands = brands.filter(b => b.is_live)
  const otherBrands = brands.filter(b => !b.is_live)

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={liveCount} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        <style>{`
          .filter-tab:hover { background: ${INK} !important; color: ${WHITE} !important; }
          .filter-tab-live:hover { background: ${RED} !important; color: ${WHITE} !important; }
          .brands-join-cta:hover { opacity: 0.85; }
          @media (max-width: 860px) {
            .brands-hero { padding: 40px 24px 32px !important; flex-direction: column !important; align-items: flex-start !important; }
          }
        `}</style>

        {/* Page hero */}
        <div className="brands-hero" style={{ borderBottom: B, padding: '56px 52px 0', display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap', paddingBottom: '24px' }}>
            <div>
              <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: STONE, marginBottom: '8px' }}>200+ INDEPENDENT MAKERS</div>
              <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(64px,8vw,112px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: INK }}>ALL BRANDS</h1>
            </div>
            {liveCount > 0 && (
              <div style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: '#1a5c30', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '8px' }}>●</span> {liveCount} LIVE NOW
              </div>
            )}
          </div>

          {/* Filter bar */}
          <div style={{ display: 'flex', alignItems: 'stretch', borderTop: B, overflowX: 'auto', scrollbarWidth: 'none', marginLeft: '-52px', marginRight: '-52px', paddingLeft: '52px' }}>
            {CATEGORIES.map((cat, i) => (
              <div key={cat} className={i === 0 ? 'filter-tab filter-tab-live' : 'filter-tab'} style={{
                display: 'flex', alignItems: 'center', padding: '0 20px', height: '44px',
                fontFamily: FM, fontSize: '10px', letterSpacing: '0.13em', textTransform: 'uppercase',
                whiteSpace: 'nowrap', borderRight: Bsm, cursor: 'pointer', flexShrink: 0,
                background: i === 0 ? RED : WHITE, color: i === 0 ? WHITE : INK,
                transition: 'background .15s, color .15s',
              }}>
                {i === 0 ? '● LIVE NOW' : cat}
              </div>
            ))}
          </div>
        </div>

        {/* Brand grid */}
        <div className="brands-grid">
          {[...liveBrands, ...otherBrands].map(b => (
            <BrandCard key={b.id} brand={b} view="grid" />
          ))}
          {/* Join CTA */}
          <Link href="/welcome/maker" className="brands-join-cta" style={{ textDecoration: 'none', background: INK, borderRight: Bsm, borderBottom: Bsm, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 26px', minHeight: '200px', gap: '14px', transition: 'opacity .15s' }}>
            <div style={{ width: '52px', height: '52px', border: '2px solid rgba(244,241,236,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontWeight: 900, fontSize: '24px', color: RED }}>+</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1.8 }}>SELL AT<br />LISBON MARKETS?</div>
              <div style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '8px' }}>REGISTER FREE →</div>
            </div>
          </Link>
        </div>

        {brands.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: STONE }}>No brands registered yet.</div>
          </div>
        )}
      </main>
    </>
  )
}
