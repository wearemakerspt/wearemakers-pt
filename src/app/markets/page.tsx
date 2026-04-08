import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllMarkets } from '@/lib/queries/markets'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import MarketCard from '@/components/markets/MarketCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Markets — WEAREMAKERS.PT',
  description: 'All street markets in Lisbon — open today, scheduled this week, and upcoming.',
  alternates: { canonical: '/markets' },
}

export default async function MarketsPage() {
  const [markets, user] = await Promise.all([getAllMarkets(), getCurrentUser()])

  const live    = markets.filter(m => m.status === 'live' || m.status === 'community_live')
  const sched   = markets.filter(m => m.status === 'scheduled')
  const cancel  = markets.filter(m => m.status === 'cancelled')

  return (
    <>
      <SiteHeader user={user} liveCount={live.length} />
      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

        {/* Editorial header */}
        <div style={{ padding: '16px 16px 0', background: '#f0ece0', borderBottom: '3px solid #181614' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>RIGHT NOW</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(36px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: '#181614' }}>
              LIVE NOW
            </div>
            {live.length > 0 && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#1a5c30', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '8px' }}>●</span> {live.length} OPEN
              </div>
            )}
          </div>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', padding: '12px 0 0', flexWrap: 'nowrap' }}>
            {[
              { label: '● LIVE NOW', href: '/markets?f=live' },
              { label: 'ALL MARKETS', href: '/markets' },
              { label: 'THIS WEEK', href: '/markets?f=week' },
            ].map((pill, i) => (
              <Link
                key={i}
                href={pill.href}
                style={{
                  fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px',
                  letterSpacing: '0.14em', textTransform: 'uppercase', padding: '8px 14px',
                  border: '2px solid #181614', background: i === 0 ? '#c8291a' : '#f0ece0',
                  color: i === 0 ? '#fff' : '#181614', textDecoration: 'none',
                  marginRight: '6px', marginBottom: '10px', display: 'inline-block', flexShrink: 0,
                }}
              >{pill.label}</Link>
            ))}
          </div>
        </div>

        {/* Live markets */}
        {live.length > 0
          ? live.map(m => <MarketCard key={m.id} market={m} />)
          : (
            <div style={{ padding: '40px 16px', textAlign: 'center', borderBottom: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
                NO LIVE MARKETS RIGHT NOW<br />Check back on Saturday morning.
              </div>
            </div>
          )
        }

        {/* Scheduled */}
        {sched.length > 0 && (
          <>
            <div style={{ padding: '14px 16px 8px', background: '#f0ece0', borderBottom: '3px solid #181614', borderTop: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.38)', marginBottom: '4px' }}>NOT OPEN TODAY</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: '#181614' }}>OTHER MARKETS</div>
            </div>
            {sched.map(m => <MarketCard key={m.id} market={m} dim />)}
          </>
        )}

        {/* Cancelled */}
        {cancel.length > 0 && (
          <>
            <div style={{ padding: '14px 16px 8px', background: '#c8291a', borderBottom: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: '#fff' }}>CANCELLED</div>
            </div>
            {cancel.map(m => <MarketCard key={m.id} market={m} />)}
          </>
        )}
      </main>
    </>
  )
}
