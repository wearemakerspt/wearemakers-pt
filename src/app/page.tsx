import type { Metadata } from 'next'
import Link from 'next/link'
import { getLiveMarkets, getAllMarkets } from '@/lib/queries/markets'
import { getAllBrands } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import { getCuratorSpotlights, getWamTop20 } from '@/lib/queries/spotlight'
import { getAllArticles } from '@/lib/queries/journal'
import SiteHeader from '@/components/ui/SiteHeader'
import RealtimeRefresh from '@/components/ui/RealtimeRefresh'
import SpotlightCarousel from '@/components/ui/SpotlightCarousel'
import InstallPrompt from '@/components/ui/InstallPrompt'

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
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase()
}

async function getLisbonWeather(): Promise<{ temp: number; windspeed: number; condition: string; message: string; isGood: boolean } | null> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=38.7169&longitude=-9.1395&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe/Lisbon&wind_speed_unit=kmh',
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const temp = Math.round(data.current.temperature_2m)
    const windspeed = Math.round(data.current.wind_speed_10m)
    const code = data.current.weather_code as number

    let condition: string, message: string, isGood: boolean
    if (code <= 2) {
      condition = 'CLEAR SKIES'; message = 'PERFECT DAY FOR THE MARKETS'; isGood = true
    } else if (code <= 48) {
      condition = 'OVERCAST'; message = 'CHECK IF YOUR MARKET IS LIVE BEFORE HEADING OUT'; isGood = false
    } else {
      condition = 'RAIN'; message = 'CONFIRM YOUR MARKET IS LIVE TODAY'; isGood = false
    }
    return { temp, windspeed, condition, message, isGood }
  } catch { return null }
}

export default async function HomePage() {
  const [liveMarkets, allMarkets, allBrands, user, curatorCards, top20Rows, articles, weather] = await Promise.all([
    getLiveMarkets(),
    getAllMarkets(),
    getAllBrands(),
    getCurrentUser(),
    getCuratorSpotlights(),
    getWamTop20(),
    getAllArticles(),
    getLisbonWeather(),
  ])

  const greeting = getGreeting()
  const liveBrands = allBrands.filter(b => b.is_live)
  const upcomingMarkets = allMarkets.filter(m => m.status === 'scheduled').slice(0, 3)
  const top20Brands = (top20Rows as any[]).map(r => r.maker).filter(Boolean).slice(0, 4)
  const featuredBrands = liveBrands.slice(0, 4).length > 0 ? liveBrands.slice(0, 4) : top20Brands
  const liveBrandIds = new Set(liveBrands.map(b => b.id))
  const latestArticles = articles.slice(0, 3)

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={liveMarkets.length} />

      <div id="scroll-area" style={{ overflowY: 'auto', flex: 1 }}>

        {/* ── Greeting block ── */}
        <div className="greeting-block" style={{ position: 'relative' }}>
          <div className="greeting-date">{formatDate()} · LISBON</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
            <div style={{ flex: 1 }}>
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

            {/* Featured brands — desktop only */}
            {featuredBrands.length > 0 && (
              <div style={{ flexShrink: 0, width: '220px', display: 'none' }} className="hero-brands-desktop">
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)', marginBottom: '8px' }}>
                  {liveBrands.length > 0 ? 'LIVE NOW' : 'FEATURED'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {featuredBrands.map((b: any) => (
                    <Link key={b.id} href={`/brands/${b.slug ?? b.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(24,22,20,.04)', border: '1px solid rgba(24,22,20,.08)' }}>
                      {b.avatar_url ? (
                        <img src={b.avatar_url} alt={b.display_name} style={{ width: '28px', height: '28px', objectFit: 'cover', border: '1px solid rgba(24,22,20,.15)', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '28px', height: '28px', background: 'rgba(24,22,20,.08)', border: '1px solid rgba(24,22,20,.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '11px', color: 'rgba(24,22,20,.3)' }}>
                          {b.display_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', color: '#181614', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.display_name}
                        </div>
                        {(b.bio_i18n as any)?._category && (
                          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.35)', marginTop: '1px' }}>
                            {(b.bio_i18n as any)._category.split(',')[0].trim()}
                          </div>
                        )}
                      </div>
                      {liveBrandIds.has(b.id) && (
                        <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '7px', letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1a5c30', color: '#fff', padding: '2px 4px', flexShrink: 0 }}>●</span>
                      )}
                    </Link>
                  ))}
                </div>
                <Link href="/brands" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)', textDecoration: 'none', display: 'block', marginTop: '8px' }}>
                  ALL BRANDS →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Weather ticker ── */}
        {weather && (
          <div style={{ background: '#181614', borderBottom: '3px solid #181614', height: '36px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <style>{`@keyframes weather-scroll { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
            <div style={{ display: 'flex', animation: 'weather-scroll 28s linear infinite', whiteSpace: 'nowrap' }}>
              {[...Array(2)].map((_, ri) => (
                <span key={ri} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {[
                    `LISBON · ${weather.temp}°C`,
                    weather.condition,
                    `WIND ${weather.windspeed} KM/H`,
                    weather.message,
                    new Date().toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase(),
                    weather.isGood ? 'GO FIND YOUR MAKERS →' : 'CHECK BEFORE YOU GO →',
                  ].map((item, i) => (
                    <span key={i} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: weather.isGood ? 'rgba(240,236,224,.55)' : 'rgba(240,236,224,.4)', padding: '0 24px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                      {item}
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: weather.isGood ? 'rgba(240,236,224,.25)' : '#c8291a', display: 'inline-block', flexShrink: 0 }} />
                    </span>
                  ))}
                </span>
              ))}
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
                      <div key={mk.maker_id} className="maker-av-sm live-av" style={{ zIndex: 3 - i }}>
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

        {/* ── Spotlight Carousel ── */}
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

        {/* ── Upcoming markets ── */}
        {upcomingMarkets.length > 0 && (
          <section>
            <div style={{ padding: '14px 14px 8px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.38)', marginBottom: '4px' }}>COMING UP</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: '#181614' }}>UPCOMING MARKETS</div>
            </div>
            {upcomingMarkets.map(m => (
              <Link key={m.id} href={`/markets/${m.id}`} className="mcard">
                <div className="mcard-img">
                  <div className="mcard-count" style={{ fontSize: '13px', opacity: 0.4 }}>
                    {new Date(m.event_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}
                  </div>
                  <div className="mcard-count-lbl">SCHED</div>
                </div>
                <div className="mbody">
                  <div className="mtitle">{m.title}</div>
                  <div className="maddr">{m.space.name} · {m.starts_at.slice(0,5)}–{m.ends_at.slice(0,5)}</div>
                </div>
              </Link>
            ))}
            <div style={{ borderBottom: '3px solid #181614', padding: '14px', textAlign: 'center' }}>
              <Link href="/markets" className="sh-r">VIEW FULL CALENDAR →</Link>
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {liveMarkets.length === 0 && upcomingMarkets.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '12px' }}>NO LIVE MARKETS</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
              Check back on the weekend.<br />Markets run Saturday and Sunday.
            </div>
          </div>
        )}

        {/* ── Journal teaser ── */}
        {latestArticles.length > 0 && (
          <section>
            <div style={{ padding: '14px 14px 0', borderTop: '3px solid #181614', borderBottom: '2px solid #181614' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.38)', marginBottom: '4px' }}>FROM THE JOURNAL</div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.92, color: '#181614' }}>NEIGHBOURHOOD LOOPS</div>
                </div>
                <Link href="/journal" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.45)', textDecoration: 'none' }}>ALL →</Link>
              </div>
            </div>
            {latestArticles.map((article, i) => (
              <Link key={article.id} href={`/journal/${article.slug}`} style={{ textDecoration: 'none', display: 'block', borderBottom: '2px solid #181614' }}>
                <div style={{ padding: '14px', background: i % 2 === 0 ? '#f0ece0' : '#e8e0d0', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '48px', color: 'rgba(24,22,20,.07)', lineHeight: 1, flexShrink: 0, width: '48px', textAlign: 'right' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c8291a', fontWeight: 700, marginBottom: '5px' }}>{article.kicker}</div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.95, color: '#181614', marginBottom: '6px' }}>{article.title}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: 'rgba(24,22,20,.5)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{article.dek}</div>
                  </div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '14px', color: 'rgba(24,22,20,.2)', flexShrink: 0, alignSelf: 'center' }}>→</div>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* ── Footer CTA ── */}
        <div style={{ background: '#181614', padding: '32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            REGISTER YOUR BRAND — IT'S FREE
          </div>
          <Link href="/welcome/maker" className="btn-red">JOIN WEAREMAKERS.PT →</Link>
        </div>

        {/* ── Footer ── */}
        <footer style={{ background: '#181614', borderTop: '1px solid rgba(240,236,224,.08)', padding: '32px 16px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '28px', marginBottom: '28px' }}>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#c8291a', marginBottom: '6px' }}>
                WEAREMAKERS<span style={{ color: 'rgba(240,236,224,.4)' }}>.PT</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: 'rgba(240,236,224,.3)', lineHeight: 1.6, marginBottom: '12px' }}>
                The real Lisbon isn't behind glass.
              </div>
              <a href="mailto:info@wearemakers.pt" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.25)', textDecoration: 'none' }}>
                info@wearemakers.pt
              </a>
            </div>
            <div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.2)', marginBottom: '12px' }}>PLATFORM</div>
              {[{ label: 'Live Markets', href: '/markets' }, { label: 'All Brands', href: '/brands' }, { label: 'Hidden Gems', href: '/gems' }, { label: 'The Journal', href: '/journal' }, { label: 'My Circuit', href: '/circuit' }].map(l => (
                <Link key={l.href} href={l.href} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.35)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>{l.label}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.2)', marginBottom: '12px' }}>JOIN</div>
              {[{ label: "I'm a Maker", href: '/welcome/maker' }, { label: "I'm a Curator", href: '/welcome/curator' }, { label: 'I have a Space', href: '/espacos' }, { label: 'For Makers & Curators', href: '/pitch' }].map(l => (
                <Link key={l.href} href={l.href} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.35)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>{l.label}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.2)', marginBottom: '12px' }}>CONTACT</div>
              {[{ label: 'General', href: 'mailto:info@wearemakers.pt' }, { label: 'Spaces & Parishes', href: 'mailto:espacos@wearemakers.pt' }, { label: 'Press', href: 'mailto:press@wearemakers.pt' }].map(l => (
                <a key={l.href} href={l.href} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.35)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>{l.label}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(240,236,224,.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,.18)' }}>© 2026 WEAREMAKERS.PT — LISBON, PORTUGAL</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/privacy" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,.18)', textDecoration: 'none' }}>Privacy</Link>
              <Link href="/terms" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,.18)', textDecoration: 'none' }}>Terms</Link>
              <a href="https://instagram.com/wearemakerspt" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,.18)', textDecoration: 'none' }}>Instagram</a>
            </div>
          </div>
        </footer>

        {/* ── PWA Install Prompt — mobile only, shown after 3s ── */}
        <InstallPrompt />

      </div>

      {/* Desktop-only CSS for hero brands panel */}
      <style>{`
        @media (min-width: 768px) {
          .hero-brands-desktop { display: block !important; }
        }
      `}</style>
    </>
  )
}
