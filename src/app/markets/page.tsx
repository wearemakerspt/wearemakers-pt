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

export default async function MarketsPage() {
  const [markets, monthGroups, user] = await Promise.all([
    getAllMarkets(),
    getMarketsByMonth(),
    getCurrentUser(),
  ])

  const live = markets.filter(m => m.status === 'live' || m.status === 'community_live')
  const cancelled = markets.filter(m => m.status === 'cancelled')

  return (
    <>
      <SiteHeader user={user} liveCount={live.length} />
      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

        {/* Editorial header */}
        <div style={{ padding: '16px 16px 0', background: '#f0ece0', borderBottom: '3px solid #181614' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>
            LISBON STREET MARKETS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(36px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: '#181614' }}>
              ALL MARKETS
            </div>
            {live.length > 0 && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#1a5c30', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '8px' }}>●</span> {live.length} OPEN NOW
              </div>
            )}
          </div>

          {/* Filter pills + spaces link */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', padding: '12px 0 0', flexWrap: 'nowrap', alignItems: 'center' }}>
            {[
              { label: '● LIVE NOW', active: true },
              { label: 'UPCOMING', active: false },
            ].map((pill, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px',
                  letterSpacing: '0.14em', textTransform: 'uppercase', padding: '8px 14px',
                  border: '2px solid #181614',
                  background: pill.active ? '#c8291a' : '#f0ece0',
                  color: pill.active ? '#fff' : '#181614',
                  marginRight: '6px', marginBottom: '10px',
                  display: 'inline-block', flexShrink: 0, cursor: 'default',
                }}
              >
                {pill.label}
              </span>
            ))}
            <Link
              href="/spaces"
              style={{
                fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px',
                letterSpacing: '0.14em', textTransform: 'uppercase', padding: '8px 14px',
                border: '2px solid #181614', background: '#181614', color: '#f0ece0',
                marginRight: '6px', marginBottom: '10px',
                display: 'inline-block', flexShrink: 0, textDecoration: 'none',
              }}
            >
              ALL SPACES →
            </Link>
          </div>
        </div>

        {/* ── Live markets ── */}
        {live.length > 0 ? (
          <section>
            {live.map(m => <MarketCard key={m.id} market={m} />)}
          </section>
        ) : (
          <div style={{ padding: '32px 16px', textAlign: 'center', borderBottom: '3px solid #181614', background: '#f0ece0' }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
              NO LIVE MARKETS RIGHT NOW<br />Check the calendar below for upcoming dates.
            </div>
          </div>
        )}

        {/* ── Upcoming calendar — two-tier by month ── */}
        <div style={{ borderTop: '3px solid #181614' }}>
          <div style={{ padding: '14px 16px 10px', background: '#f0ece0', borderBottom: '3px solid #181614' }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.38)', marginBottom: '4px' }}>
              COMING UP
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: '#181614' }}>
              UPCOMING MARKETS
            </div>
          </div>
          <MarketsCalendar groups={monthGroups} liveCount={live.length} />
        </div>

        {/* ── Cancelled ── */}
        {cancelled.length > 0 && (
          <section>
            <div style={{ padding: '14px 16px 8px', background: '#c8291a', borderBottom: '3px solid #181614', borderTop: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: '#fff' }}>CANCELLED</div>
            </div>
            {cancelled.map(m => <MarketCard key={m.id} market={m} />)}
          </section>
        )}

      </main>
    </>
  )
}
