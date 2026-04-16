import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllMarkets, getMarketsByMonth } from '@/lib/queries/markets'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import MarketCard from '@/components/markets/MarketCard'
import MarketsCalendar from '@/components/markets/MarketsCalendar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Markets — WEAREMAKERS.PT',
  description: 'All Lisbon street markets — open today and upcoming. Find independent makers live at Príncipe Real, LX Factory, Intendente and more.',
  alternates: { canonical: '/markets' },
}

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif"

export default async function MarketsPage() {
  const [markets, monthGroups, user] = await Promise.all([
    getAllMarkets(), getMarketsByMonth(), getCurrentUser(),
  ])

  const live = markets.filter(m => m.status === 'live' || m.status === 'community_live')
  const cancelled = markets.filter(m => m.status === 'cancelled')

  return (
    <>
      <SiteHeader user={user} liveCount={live.length} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        {/* Page hero */}
        <div style={{ borderBottom: B, padding: '56px 52px 48px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', minHeight: '180px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: STONE, marginBottom: '8px' }}>LISBON STREET MARKETS</div>
            <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(64px,8vw,112px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: INK }}>
              LISBON<br />MARKETS
            </h1>
          </div>
          <div style={{ fontFamily: FM, fontSize: '9.5px', letterSpacing: '0.14em', color: STONE, maxWidth: '240px', lineHeight: 1.7, textTransform: 'uppercase' }}>
            All street markets in Lisbon — live status, scheduled dates, and maker line-ups.
          </div>
        </div>

        {/* Calendar with built-in filter tabs */}
        <MarketsCalendar groups={monthGroups} liveCount={live.length} />

        {/* Cancelled */}
        {cancelled.length > 0 && (
          <section>
            <div style={{ padding: '0 40px', height: '46px', display: 'flex', alignItems: 'center', background: RED, borderBottom: B, borderTop: B }}>
              <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: WHITE }}>CANCELLED</div>
            </div>
            {cancelled.map(m => <MarketCard key={m.id} market={m} dim />)}
          </section>
        )}

        <style>{`
          @media (max-width: 860px) {
            .markets-hero { padding: 40px 24px 32px !important; flex-direction: column !important; align-items: flex-start !important; }
            .section-rule { padding: 0 16px !important; }
          }
        `}</style>
      </main>
    </>
  )
}
