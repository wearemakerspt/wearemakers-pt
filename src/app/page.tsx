import type { Metadata } from 'next'
import Link from 'next/link'
import { getLiveMarkets, getAllMarkets } from '@/lib/queries/markets'
import { getAllBrands } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import RealtimeRefresh from '@/components/ui/RealtimeRefresh'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'WEAREMAKERS.PT — Lisbon Street Markets · Live Today',
  description: 'Find independent makers, artisans and creators at Lisbon street markets. Live. Today. Around the corner.',
  alternates: { canonical: '/' },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { line1: 'GOOD', line2: 'MORN-', line3: 'ING.' }
  if (h < 17) return { line1: 'GOOD', line2: 'AFTER-', line3: 'NOON.' }
  return { line1: 'GOOD', line2: 'EVEN-', line3: 'ING.' }
}

function formatDate() {
  return new Date().toLocaleDateString('en-GB', {
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
  const scheduledMarkets = allMarkets.filter(m => m.status === 'scheduled').slice(0, 4)

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={liveMarkets.length} />

      <div id="scroll-area" style={{ overflowY: 'auto', flex: 1 }}>

        {/* ── Greeting block ── */}
        <div className="greeting-block">
          <div className="greeting-date">{formatDate()} · LISBON</div>
          <div className="greeting-h">
            {greeting.line1}<br />
            {greeting.line2}<br />
            <em>{greeting.line3}</em>
          </div>
          <Link href="/markets" className="greeting-pill">
            {liveMarkets.length} MARKETS OPEN
          </Link>
          <span className="greeting-prefs">SET PREFERENCES</span>
        </div>

        {/* ── Live markets ── */}
        {liveMarkets.length > 0 && (
          <section>
            <div className="editorial-hdr">
              <div className="editorial-kicker">STREET MARKETS</div>
              <div className="editorial-title">OPEN TODAY</div>
              <div className="editorial-count">{liveMarkets.length} OPEN</div>
            </div>
            {liveMarkets.map(m => (
              <Link key={m.market_id} href={`/markets/${m.market_id}`} className="mcard">
                <div className="mcard-img">
                  <div className="mcard-count">{m.checkin_count}</div>
                  <div className="mcard-count-lbl">LIVE</div>
                </div>
                <div className="mbody">
                  <div className="mmeta" style={{ marginBottom: '5px' }}>
                    <span className="badge-live">{m.checkin_count} LIVE</span>
                  </div>
                  <div className="mtitle">{m.market_title}</div>
                  <div className="maddr">
                    {m.space_name} · {m.space_parish ?? ''} · Today {m.starts_at.slice(0,5)}–{m.ends_at.slice(0,5)}
                  </div>
                  <div className="maker-cluster">
                    {m.makers.slice(0, 3).map((mk, i) => (
                      <div key={mk.maker_id} className={`maker-av-sm${true ? ' live-av' : ''}`} style={{ zIndex: 3 - i }}>
                        {mk.maker_name.slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                    {m.makers.length > 3 && (
                      <div className="maker-av-sm maker-av-more">+{m.makers.length - 3}</div>
                    )}
                    <span className="maker-cluster-lbl">ALL {m.makers.length} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* ── Live Brands scroll ── */}
        {liveBrands.length > 0 && (
          <section>
            <div className="sh">
              <div className="sh-l">Live Brands</div>
              <Link href="/brands" className="sh-r">ALL BRANDS →</Link>
            </div>
            <hr className="rule-heavy" />
            <div className="live-brands-scroll">
              {liveBrands.map(b => (
                <Link key={b.id} href={`/brands/${b.slug ?? b.id}`} className="lb-card">
                  <div className="lb-img">
                    <div className="lb-live-tag">LIVE</div>
                    <div className="lb-img-name">{b.display_name}</div>
                  </div>
                  <div className="lb-info">
                    <div className="lb-name">{b.display_name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Scheduled markets ── */}
        {scheduledMarkets.length > 0 && (
          <section>
            <div style={{ padding: '14px 14px 8px', borderBottom: '3px solid var(--INK)' }}>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--INK)', opacity: 0.38, marginBottom: '4px' }}>
                NOT OPEN TODAY
              </div>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: 'var(--INK)' }}>
                OTHER MARKETS
              </div>
            </div>
            {scheduledMarkets.map(m => (
              <Link key={m.id} href={`/markets/${m.id}`} className="mcard" style={{ opacity: 0.55 }}>
                <div className="mcard-img">
                  <div className="mcard-count">{m.checkin_count}</div>
                  <div className="mcard-count-lbl">SCHED</div>
                </div>
                <div className="mbody">
                  <div className="mtitle">{m.title}</div>
                  <div className="maddr">
                    {m.space.name} · {m.starts_at.slice(0,5)}–{m.ends_at.slice(0,5)}
                  </div>
                </div>
              </Link>
            ))}
            <div style={{ borderBottom: '3px solid var(--INK)', padding: '14px', textAlign: 'center' }}>
              <Link href="/markets" className="sh-r">VIEW FULL SCHEDULE →</Link>
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {liveMarkets.length === 0 && scheduledMarkets.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '12px' }}>
              NO LIVE MARKETS
            </div>
            <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
              Check back on the weekend.<br />Markets run Saturday and Sunday.
            </div>
          </div>
        )}

        {/* ── Footer CTA ── */}
        <div style={{ background: 'var(--INK)', padding: '32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            REGISTER YOUR BRAND — IT'S FREE
          </div>
          <Link href="/auth/register" className="btn-red">
            JOIN WEAREMAKERS.PT →
          </Link>
        </div>

      </div>
    </>
  )
}
