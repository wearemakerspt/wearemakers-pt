import type { Metadata } from 'next'
import Link from 'next/link'
import { getLiveMarkets, getAllMarkets } from '@/lib/queries/markets'
import { getAllBrands } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import MarketCard from '@/components/markets/MarketCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'WEAREMAKERS.PT — Lisbon Street Markets · Live Today',
  description: 'Find independent makers, artisans and creators at Lisbon street markets. Live. Today. Around the corner.',
  openGraph: {
    title: 'WEAREMAKERS.PT — The real Lisbon isn\'t behind glass.',
    description: 'Live street market discovery for Lisbon. 200+ independent makers. Find who\'s there right now.',
    type: 'website',
  },
  alternates: { canonical: '/' },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { word: 'MORN-', end: 'ING.' }
  if (h < 17) return { word: 'AFTER-', end: 'NOON.' }
  return { word: 'EVEN-', end: 'ING.' }
}

function formatDate() {
  const d = new Date()
  return d.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase()
}

export default async function HomePage() {
  const [liveMarkets, allMarkets, allBrands, user] = await Promise.all([
    getLiveMarkets(),
    getAllMarkets(),
    getAllBrands(),
    getCurrentUser(),
  ])

  const greeting = getGreeting()
  const liveBrands = allBrands.filter(b => b.is_live)
  const scheduledMarkets = allMarkets.filter(m => m.status === 'scheduled')

  return (
    <>
      <SiteHeader user={user} liveCount={liveMarkets.length} />

      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

        {/* ── Greeting block ── */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '3px solid #181614', background: '#f0ece0' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.38)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#c8291a' }}>—</span>
            {formatDate()} · LISBON
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(52px,16vw,96px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.86, color: '#181614', marginBottom: '16px', borderLeft: '5px solid #c8291a', paddingLeft: '14px' }}>
            GOOD<br />
            {greeting.word}<br />
            <em style={{ color: '#c8291a', fontStyle: 'italic' }}>{greeting.end}</em>
          </div>
          <Link
            href="/markets"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#c8291a', color: '#fff', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '8px 16px', textDecoration: 'none' }}
          >
            <span style={{ fontSize: '9px', animation: 'pulse-dot 1.8s ease-in-out infinite' }}>●</span>
            {liveMarkets.length} MARKETS OPEN
          </Link>
        </div>

        {/* ── Live markets ── */}
        {liveMarkets.length > 0 && (
          <section>
            <div style={{ padding: '16px 16px 8px', background: '#f0ece0', borderBottom: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>
                STREET MARKETS
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(36px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: '#181614' }}>
                  OPEN TODAY
                </div>
                <Link href="/markets" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: '#c8291a', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none' }}>
                  FULL SCHEDULE →
                </Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#1a5c30', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <span style={{ fontSize: '8px' }}>●</span>
                {liveMarkets.length} OPEN
              </div>
            </div>
            <div>
              {liveMarkets.map(m => (
                <Link
                  key={m.market_id}
                  href={`/markets/${m.market_id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', borderBottom: '3px solid #181614', minHeight: '88px', background: '#f0ece0', transition: 'background 0.06s' }}
                  className="hover:bg-parchment-2"
                >
                  {/* Left image col */}
                  <div style={{ width: '80px', flexShrink: 0, background: '#181614', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '8px' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', color: 'rgba(240,236,224,.9)', lineHeight: 1 }}>
                      {m.checkin_count}
                    </div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '8px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      LIVE
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ flex: 1, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.45)' }}>
                        {m.space_name} · {m.space_parish ?? ''}
                      </div>
                      <span className="badge-live">{m.checkin_count} LIVE</span>
                    </div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '26px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.95, color: '#181614', marginBottom: '4px' }}>
                      {m.market_title}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: 'rgba(24,22,20,.45)', marginBottom: '8px' }}>
                      Today {m.starts_at.slice(0,5)}–{m.ends_at.slice(0,5)}
                      {m.space_address ? ` · ${m.space_address}` : ''}
                    </div>
                    {/* Maker initials cluster */}
                    {m.makers.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {m.makers.slice(0, 3).map((mk, i) => (
                          <div key={mk.maker_id} style={{ width: '28px', height: '28px', background: '#1a5c30', border: '2px solid #181614', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '10px', color: '#fff', marginRight: i < 2 ? '-6px' : '0', position: 'relative', flexShrink: 0, zIndex: 3 - i }}>
                            {mk.maker_name.slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                        {m.makers.length > 3 && (
                          <div style={{ width: '28px', height: '28px', background: '#181614', border: '2px solid #181614', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: '#f0ece0', fontWeight: 700, flexShrink: 0, marginLeft: '2px' }}>
                            +{m.makers.length - 3}
                          </div>
                        )}
                        <span style={{ marginLeft: '10px', fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: '#c8291a', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                          ALL {m.makers.length} →
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Live Brands horizontal scroll ── */}
        {liveBrands.length > 0 && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
                LIVE BRANDS
              </div>
              <Link href="/brands" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: '#c8291a', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none' }}>
                ALL BRANDS →
              </Link>
            </div>
            <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '3px solid #181614' }}>
              {liveBrands.map(b => (
                <Link key={b.id} href={`/brands/${b.slug ?? b.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: 'clamp(90px,22vw,120px)', borderRight: '2px solid #181614' }}>
                  <div style={{ background: '#181614', aspectRatio: '1', display: 'flex', alignItems: 'flex-end', padding: '6px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#1a5c30', color: '#fff', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '6px' }}>●</span> LIVE
                    </div>
                    {b.avatar_url
                      ? <img src={b.avatar_url} alt={b.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(16px,4vw,22px)', color: 'rgba(240,236,224,.15)', textTransform: 'uppercase' }}>{b.display_name.slice(0,2)}</div>
                    }
                  </div>
                  <div style={{ background: '#f0ece0', padding: '7px 8px', borderTop: '2px solid #181614' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(13px,3vw,16px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.display_name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Not open today ── */}
        {scheduledMarkets.length > 0 && (
          <section>
            <div style={{ padding: '14px 16px 8px', background: '#f0ece0', borderBottom: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.38)', marginBottom: '4px' }}>
                NOT OPEN TODAY
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: '#181614' }}>
                OTHER MARKETS
              </div>
            </div>
            {scheduledMarkets.slice(0, 4).map(m => (
              <MarketCard key={m.id} market={m} dim />
            ))}
            <div style={{ borderBottom: '3px solid #181614', padding: '14px', textAlign: 'center' }}>
              <Link href="/markets" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>
                VIEW FULL SCHEDULE →
              </Link>
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {liveMarkets.length === 0 && scheduledMarkets.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '12px' }}>
              NO LIVE MARKETS
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
              Check back on the weekend.<br />Markets run Saturday and Sunday.
            </div>
          </div>
        )}

        {/* ── Footer CTA ── */}
        <div style={{ background: '#181614', padding: '32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            REGISTER YOUR BRAND — IT'S FREE
          </div>
          <Link
            href="/auth/register"
            style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#c8291a', color: '#fff', padding: '12px 20px', textDecoration: 'none', display: 'inline-block' }}
          >
            JOIN WEAREMAKERS.PT →
          </Link>
        </div>

      </main>
    </>
  )
}
