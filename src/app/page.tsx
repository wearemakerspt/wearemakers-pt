import type { Metadata } from 'next'
import Link from 'next/link'
import { getLiveMarkets, getAllMarkets } from '@/lib/queries/markets'
import { getAllBrands } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import { getCuratorSpotlights } from '@/lib/queries/spotlight'
import { getAllArticles } from '@/lib/queries/journal'
import SiteHeader from '@/components/ui/SiteHeader'
import RealtimeRefresh from '@/components/ui/RealtimeRefresh'
import SpotlightCarousel from '@/components/ui/SpotlightCarousel'

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

// ── Weather ──────────────────────────────────────────────────────────────────
// Open-Meteo, free, no API key, Lisbon coords
async function getLisbonWeather(): Promise<{ temp: number; message: string } | null> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=38.7169&longitude=-9.1395&current=temperature_2m,weather_code&timezone=Europe/Lisbon',
      { next: { revalidate: 1800 } } // cache 30 min
    )
    if (!res.ok) return null
    const data = await res.json()
    const temp = Math.round(data.current.temperature_2m)
    const code = data.current.weather_code as number

    let message: string
    if (code <= 2) {
      message = 'Perfect day for the markets.'
    } else if (code <= 51) {
      message = 'Check if your market is live before heading out.'
    } else {
      message = "It's raining in Lisbon. Confirm your market is live today."
    }

    return { temp, message }
  } catch {
    return null
  }
}

export default async function HomePage() {
  const [liveMarkets, allMarkets, allBrands, user, curatorCards, articles, weather] = await Promise.all([
    getLiveMarkets(),
    getAllMarkets(),
    getAllBrands(),
    getCurrentUser(),
    getCuratorSpotlights(),
    getAllArticles(),
    getLisbonWeather(),
  ])

  const greeting = getGreeting()
  const liveBrands = allBrands.filter(b => b.is_live)
  const scheduledMarkets = allMarkets.filter(m => m.status === 'scheduled').slice(0, 4)
  const latestArticles = articles.slice(0, 2)

  const T = { fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase' as const }

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

        {/* ── Weather strip ── */}
        {weather && (
          <div style={{
            borderBottom: '3px solid var(--INK)',
            background: 'var(--INK)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              fontFamily: 'var(--TAG)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(240,236,224,.35)',
              flexShrink: 0,
            }}>
              LISBON · {weather.temp}°C
            </div>
            <div style={{ width: '1px', height: '12px', background: 'rgba(240,236,224,.15)', flexShrink: 0 }} />
            <div style={{
              fontFamily: 'var(--MONO)',
              fontSize: '12px',
              color: 'rgba(240,236,224,.6)',
              lineHeight: 1.4,
            }}>
              {weather.message}
            </div>
          </div>
        )}

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

        {/* ── Spotlight Carousel — WAM TOP 20 + Curator picks ── */}
        <div style={{ padding: '0 14px' }}>
          <SpotlightCarousel curatorCards={curatorCards} />
        </div>

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

        {/* ── Journal teaser ── */}
        {latestArticles.length > 0 && (
          <section>
            <div style={{ padding: '14px 14px 0', borderTop: '3px solid var(--INK)', borderBottom: '2px solid var(--INK)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ ...T, color: 'var(--INK)', opacity: 0.38, marginBottom: '4px' }}>FROM THE JOURNAL</div>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.92, color: 'var(--INK)' }}>
                    NEIGHBOURHOOD LOOPS
                  </div>
                </div>
                <Link href="/journal" style={{ ...T, fontSize: '10px', color: 'var(--INK)', opacity: 0.5, textDecoration: 'none' }}>
                  ALL ARTICLES →
                </Link>
              </div>
            </div>
            {latestArticles.map((article, i) => (
              <Link
                key={article.id}
                href={`/journal/${article.slug}`}
                style={{ textDecoration: 'none', display: 'block', borderBottom: '2px solid var(--INK)' }}
              >
                <div style={{
                  padding: '14px',
                  background: i === 0 ? 'var(--P)' : 'var(--P2)',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                }}>
                  <span style={{
                    fontFamily: 'var(--LOGO)',
                    fontWeight: 900,
                    fontSize: '48px',
                    color: 'rgba(24,22,20,.07)',
                    lineHeight: 1,
                    flexShrink: 0,
                    width: '48px',
                    textAlign: 'right',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700, marginBottom: '5px' }}>
                      {article.kicker}
                    </div>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.95, color: 'var(--INK)', marginBottom: '6px' }}>
                      {article.title}
                    </div>
                    <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.5)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {article.dek}
                    </div>
                  </div>
                  <div style={{ ...T, fontSize: '14px', color: 'rgba(24,22,20,.2)', flexShrink: 0, alignSelf: 'center' }}>→</div>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* ── Footer CTA ── */}
        <div style={{ background: 'var(--INK)', padding: '32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            REGISTER YOUR BRAND — IT'S FREE
          </div>
          <Link href="/welcome/maker" className="btn-red">
            JOIN WEAREMAKERS.PT →
          </Link>
        </div>

        {/* ── Footer ── */}
        <footer style={{ background: 'var(--INK)', borderTop: '1px solid rgba(240,236,224,.08)', padding: '32px 16px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '28px', marginBottom: '28px' }}>

            {/* Brand */}
            <div>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--RED)', marginBottom: '6px' }}>
                WEAREMAKERS<span style={{ color: 'rgba(240,236,224,.4)' }}>.PT</span>
              </div>
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '11px', color: 'rgba(240,236,224,.3)', lineHeight: 1.6, marginBottom: '12px' }}>
                The real Lisbon isn't behind glass.
              </div>
              <a href="mailto:info@wearemakers.pt" style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.25)', textDecoration: 'none' }}>
                info@wearemakers.pt
              </a>
            </div>

            {/* Platform */}
            <div>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.2)', marginBottom: '12px' }}>
                PLATFORM
              </div>
              {[
                { label: 'Live Markets', href: '/markets' },
                { label: 'All Brands', href: '/brands' },
                { label: 'The Journal', href: '/journal' },
                { label: 'My Circuit', href: '/circuit' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.35)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Join */}
            <div>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.2)', marginBottom: '12px' }}>
                JOIN
              </div>
              {[
                { label: 'I\'m a Maker', href: '/welcome/maker' },
                { label: 'I\'m a Curator', href: '/welcome/curator' },
                { label: 'I have a Space', href: '/espacos' },
                { label: 'For Makers & Curators', href: '/pitch' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.35)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.2)', marginBottom: '12px' }}>
                CONTACT
              </div>
              {[
                { label: 'General', href: 'mailto:info@wearemakers.pt' },
                { label: 'Spaces & Parishes', href: 'mailto:espacos@wearemakers.pt' },
                { label: 'Press', href: 'mailto:press@wearemakers.pt' },
              ].map(l => (
                <a key={l.href} href={l.href} style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.35)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(240,236,224,.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,.18)' }}>
              © 2026 WEAREMAKERS.PT — LISBON, PORTUGAL
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['Privacy', 'Terms', 'Instagram'].map(l => (
                <span key={l} style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,.18)', cursor: 'pointer' }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
