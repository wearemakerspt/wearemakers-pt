import type { Metadata } from 'next'
import { getMarketsByMonth } from '@/lib/queries/markets'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import MarketsCalendar from '@/components/markets/MarketsCalendar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Markets — WEAREMAKERS.PT',
  description: 'Lisbon street market calendar. Find live markets, upcoming dates, independent makers and artisans.',
  alternates: { canonical: '/markets' },
}

export default async function MarketsPage() {
  const [marketsByMonth, user] = await Promise.all([
    getMarketsByMonth(),
    getCurrentUser(),
  ])

  // Collect IDs of currently live markets so the client knows which to highlight
  const liveMarketIds = marketsByMonth
    .flatMap(m => m.markets)
    .filter(m => m.status === 'live' || m.status === 'community_live')
    .map(m => m.id)

  const totalMarkets = marketsByMonth.reduce((acc, m) => acc + m.markets.length, 0)

  return (
    <>
      <SiteHeader user={user} liveCount={liveMarketIds.length} />
      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* Header */}
        <div style={{ background: 'var(--INK)', borderBottom: '3px solid var(--INK)', padding: '16px', borderLeft: '4px solid var(--RED)' }}>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', fontWeight: 700, color: 'var(--RED)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '6px' }}>
            LISBON STREET MARKETS
          </div>
          <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(36px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: 'var(--P)', marginBottom: '10px' }}>
            ALL MARKETS
          </h1>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {totalMarkets} SCHEDULED
            </div>
            {liveMarketIds.length > 0 && (
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'var(--GRN)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                ● {liveMarketIds.length} LIVE NOW
              </div>
            )}
          </div>
        </div>

        <MarketsCalendar
          marketsByMonth={marketsByMonth}
          liveMarketIds={liveMarketIds}
        />

      </main>
    </>
  )
}
