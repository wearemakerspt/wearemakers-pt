import type { Metadata } from 'next'
import Link from 'next/link'
import { getLiveMarkets, getAllMarkets } from '@/lib/queries/markets'
import { getAllBrands } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import { getCuratorSpotlights, getWamTop20 } from '@/lib/queries/spotlight'
import { getAllArticles } from '@/lib/queries/journal'
import SiteHeader from '@/components/ui/SiteHeader'
import RealtimeRefresh from '@/components/ui/RealtimeRefresh'
import InstallPrompt from '@/components/ui/InstallPrompt'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'WEAREMAKERS.PT — Lisbon Street Markets · Live Today',
  description: 'Find independent makers, artisans and creators at Lisbon street markets. Live. Today. Around the corner.',
  alternates: { canonical: '/' },
}

// Abbreviated greeting — matches reference HTML pattern (no word breaks)
function getGreeting() {
  const h = new Date().getHours()
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const day = days[new Date().getDay()]
  if (h < 12) return { day, line1: 'GOOD', line2: 'MORN.', isEvening: false }
  if (h < 17) return { day, line1: 'GOOD', line2: 'AFT.', isEvening: false }
  return { day, line1: 'GOOD', line2: 'EVE.', isEvening: true }
}

function formatDate() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase()
}

async function getLisbonWeather(): Promise<{
  temp: number; windspeed: number; precipitation: number;
  condition: string; message: string; isGood: boolean
} | null> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=38.7169&longitude=-9.1395&current=temperature_2m,weather_code,wind_speed_10m,precipitation&timezone=Europe/Lisbon&wind_speed_unit=kmh',
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const temp = Math.round(data.current.temperature_2m)
    const windspeed = Math.round(data.current.wind_speed_10m)
    const precipitation = data.current.precipitation ?? 0
    const code = data.current.weather_code as number

    let condition: string
    if (code <= 2) condition = 'CLEAR SKIES'
    else if (code <= 48) condition = 'OVERCAST'
    else condition = 'RAIN'

    // Smart logic: only warn if rain > 3mm OR wind > 30 km/h
    const isGood = precipitation <= 3 && windspeed <= 30
    const message = isGood
      ? 'PERFECT DAY FOR THE MARKETS'
      : precipitation > 3
        ? 'CHECK IF YOUR MARKET IS LIVE BEFORE HEADING OUT'
        : 'WIND ADVISORY — CONFIRM YOUR MARKET IS OPEN'

    return { temp, windspeed, precipitation, condition, message, isGood }
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
  const spotlightBrands = liveBrands.length >= 4 ? liveBrands.slice(0, 4) : top20Brands
  const latestArticles = articles.slice(0, 3)

  const B = '2px solid #0C0C0C'
  const Bsm = '1px solid rgba(12,12,12,0.15)'

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={liveMarkets.length} />

      {/* ── Weather ticker ── */}
      {weather && (
        <div style={{ background: weather.isGood ? '#1A1A1A' : '#E8001C', borderBottom: B, height: '34px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <style>{`@keyframes weather-tick { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
          <div style={{ display: 'flex', animation: 'weather-tick 32s linear infinite', whiteSpace: 'nowrap' }}>
            {[...Array(2)].map((_, ri) => (
              <span key={ri} style={{ display: 'inline-flex', alignItems: 'center' }}>
                {[
                  `LISBON · ${weather.temp}°C`,
                  weather.condition,
                  `WIND ${weather.windspeed} KM/H`,
                  weather.message,
                  new Date().toLocaleDateString('en-GB', { weekday: 'long' }).toUpperCase(),
                  weather.isGood ? '● GO FIND YOUR MAKERS' : '● CHECK BEFORE YOU GO',
                ].map((item, i) => (
                  <span key={i} style={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: '9.5px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'rgba(244,241,236,0.85)',
                    padding: '0 32px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '32px',
                  }}>
                    {item}
                    <span style={{ opacity: 0.4, fontSize: '14px' }}>·</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Hero — 55/45 two-column grid ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '55% 45%', borderBottom: B, minHeight: 'calc(100vh - 84px)' }} className="home-hero">

        {/* Left: greeting */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 52px 48px', borderRight: B }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(88px,11.5vw,168px)', lineHeight: 0.86, letterSpacing: '-0.015em', textTransform: 'uppercase' }}>
              <div style={{ color: 'rgba(12,12,12,0.13)' }}>{greeting.day}</div>
              <div style={{ color: '#1A1A1A' }}>{greeting.line1}</div>
              <div style={{ color: '#E8001C', fontStyle: 'italic' }}>{greeting.line2}</div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9.5px', letterSpacing: '0.16em', color: '#6B6560', marginBottom: '6px', textTransform: 'uppercase' }}>
              {formatDate()} · LISBON
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', color: '#1A1A1A', textTransform: 'uppercase' }}>
              STREET MARKETS &amp; INDEPENDENT MAKERS
            </div>
          </div>
        </div>

        {/* Right: live status + weather + upcoming */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Live status panel */}
          <div style={{ flex: 1, background: '#1A1A1A', color: '#F4F1EC', padding: '52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderBottom: B, position: 'relative', overflow: 'hidden' }}>
            {/* Scanline texture */}
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(180deg,transparent 0px,transparent 2px,rgba(255,255,255,0.012) 2px,rgba(255,255,255,0.012) 3px)', pointerEvents: 'none' }} />

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', color: '#E8001C', border: '1px solid #E8001C', padding: '5px 11px', width: 'fit-content', marginBottom: '28px', textTransform: 'uppercase', position: 'relative' }}>
              <span style={{ fontSize: '6px', animation: 'blink 2s infinite' }}>●</span>
              LIVE STATUS
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(60px,7.5vw,108px)', lineHeight: 0.88, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                <span style={{ color: '#E8001C' }}>{liveMarkets.length}</span> MARKETS<br />OPEN NOW
              </div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(244,241,236,0.45)', marginTop: '12px', textTransform: 'uppercase' }}>
                STATUS UPDATES DAILY — CHECK BEFORE YOU GO
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '36px', flexWrap: 'wrap' }}>
              <Link href="/markets" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Share Tech Mono',monospace", fontSize: '9.5px', letterSpacing: '0.14em', color: '#F4F1EC', border: '1px solid rgba(244,241,236,0.3)', padding: '10px 18px', textDecoration: 'none', textTransform: 'uppercase', transition: 'border-color .2s' }}>
                VIEW CALENDAR →
              </Link>
              <Link href="/circuit" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Share Tech Mono',monospace", fontSize: '9.5px', letterSpacing: '0.14em', color: '#F4F1EC', border: '1px solid rgba(244,241,236,0.3)', padding: '10px 18px', textDecoration: 'none', textTransform: 'uppercase' }}>
                MY CIRCUIT
              </Link>
            </div>
          </div>

          {/* Weather chips */}
          {weather && (
            <div style={{ padding: '13px 44px', display: 'flex', alignItems: 'center', gap: 0, borderBottom: B, background: '#EDE9E2', overflow: 'hidden', flexWrap: 'wrap' }}>
              {[
                { label: 'LISBON', val: '' },
                { label: `${weather.temp}°C`, val: '' },
                { label: weather.condition, val: '' },
                { label: `WIND ${weather.windspeed} KM/H`, val: '' },
              ].map((chip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', color: '#1A1A1A', whiteSpace: 'nowrap', paddingRight: '16px', marginRight: '16px', borderRight: i < 3 ? Bsm : 'none', flexShrink: 0 }}>
                  {chip.label}
                </div>
              ))}
              {!weather.isGood && (
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', color: '#E8001C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                  {weather.message}
                </div>
              )}
            </div>
          )}

          {/* Upcoming markets list */}
          {upcomingMarkets.length > 0 && (
            <div style={{ padding: '24px 44px 28px' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.2em', color: '#1A1A1A', marginBottom: '14px', textTransform: 'uppercase' }}>COMING UP</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {upcomingMarkets.map((m, i) => {
                  const d = new Date(m.event_date + 'T12:00:00')
                  return (
                    <Link key={m.id} href={`/markets/${m.id}`} style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderBottom: i < upcomingMarkets.length - 1 ? Bsm : 'none', gap: '16px', textDecoration: 'none', color: 'inherit', transition: 'opacity .15s' }}>
                      <div style={{ width: '36px', flexShrink: 0 }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '30px', lineHeight: 1, letterSpacing: '-0.01em', color: '#1A1A1A' }}>
                          {d.getDate()}
                        </div>
                        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', color: '#1A1A1A', marginTop: '1px', textTransform: 'uppercase' }}>
                          {d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.1, color: '#1A1A1A' }}>
                          {m.title}
                        </div>
                        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.06em', color: '#6B6560', marginTop: '3px' }}>
                          {m.space.name}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: '#1A1A1A', letterSpacing: '0.06em', flexShrink: 0 }}>
                        {m.starts_at.slice(0,5)}–{m.ends_at.slice(0,5)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#C8C3BB', flexShrink: 0 }}>→</div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Live markets (if any) ── */}
      {liveMarkets.length > 0 && (
        <section>
          <div className="section-rule">
            <span className="section-rule-title">OPEN TODAY</span>
            <Link href="/markets" className="section-rule-link">{liveMarkets.length} LIVE →</Link>
          </div>
          {liveMarkets.map(m => (
            <Link key={m.market_id} href={`/markets/${m.market_id}`} className="mcard">
              <div className="mcard-img">
                <div className="mcard-count">{m.checkin_count}</div>
                <div className="mcard-count-lbl">LIVE</div>
              </div>
              <div className="mbody">
                <div className="mmeta" style={{ marginBottom: '5px' }}>
                  <span className="badge-live">{m.checkin_count} MAKERS</span>
                </div>
                <div className="mtitle">{m.market_title}</div>
                <div className="maddr">{m.space_name} · {m.space_parish ?? ''} · {m.starts_at.slice(0,5)}–{m.ends_at.slice(0,5)}</div>
                <div className="maker-cluster">
                  {m.makers.slice(0, 3).map((mk, i) => (
                    <div key={mk.maker_id} className="maker-av-sm live-av" style={{ zIndex: 3 - i }}>
                      {mk.maker_name.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {m.makers.length > 3 && <div className="maker-av-sm maker-av-more">+{m.makers.length - 3}</div>}
                  <span className="maker-cluster-lbl">ALL {m.makers.length} →</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* ── Spotlight — 38/62 grid ── */}
      <div className="section-rule">
        <span className="section-rule-title">SPOTLIGHT</span>
        <Link href="/brands" className="section-rule-link">ALL BRANDS →</Link>
      </div>
      <section style={{ display: 'grid', gridTemplateColumns: '38% 62%', borderBottom: B, minHeight: '380px' }} className="home-spotlight">

        {/* Dark editorial left */}
        <div style={{ background: '#1A1A1A', color: '#F4F1EC', padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: B, position: 'relative', overflow: 'hidden' }}>
          {/* Ghost watermark */}
          <div style={{ position: 'absolute', bottom: '-32px', right: '-16px', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '128px', lineHeight: 0.85, color: 'rgba(255,255,255,0.035)', letterSpacing: '-0.03em', pointerEvents: 'none', whiteSpace: 'pre', userSelect: 'none' }}>
            TOP{'\n'}20
          </div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '8.5px', letterSpacing: '0.22em', color: '#E8001C', textTransform: 'uppercase', position: 'relative' }}>
            EDITORIAL · EDITORS' PICK
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(56px,5.5vw,82px)', lineHeight: 0.88, letterSpacing: '-0.02em', textTransform: 'uppercase', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            WAM<br />TOP<br /><span style={{ color: '#E8001C' }}>20</span>
          </div>
          <Link href="/brands/wam-top20" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: "'Share Tech Mono',monospace", fontSize: '9.5px', letterSpacing: '0.14em', color: '#F4F1EC', borderBottom: '1px solid rgba(244,241,236,0.25)', paddingBottom: '3px', width: 'fit-content', textDecoration: 'none', position: 'relative', textTransform: 'uppercase' }}>
            SEE ALL 20 MAKERS →
          </Link>
        </div>

        {/* 2×2 maker grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
          {spotlightBrands.length > 0
            ? spotlightBrands.map((b: any, i: number) => (
              <Link key={b.id} href={`/brands/${b.slug ?? b.id}`} style={{ borderLeft: i % 2 === 1 ? Bsm : B, borderBottom: i < 2 ? Bsm : 'none', padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit', transition: 'background .18s', minHeight: '140px', position: 'relative', background: '#F4F1EC' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '16px', color: '#6B6560', opacity: 0, transition: 'opacity .2s' }} className="mc-arr">→</div>
                <div style={{ width: '40px', height: '40px', border: B, background: '#EDE9E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '12px', overflow: 'hidden', flexShrink: 0 }}>
                  {b.avatar_url
                    ? <img src={b.avatar_url} alt={b.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : b.display_name.slice(0, 2).toUpperCase()
                  }
                </div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '15px', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '16px', color: '#1A1A1A' }}>{b.display_name}</div>
                  {(b.bio_i18n as any)?._category && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', color: '#6B6560', marginTop: '3px', textTransform: 'uppercase' }}>
                      {(b.bio_i18n as any)._category.split(',')[0].trim()}
                    </div>
                  )}
                  {(b.bio_i18n as any)?._price_range && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: '#E8001C', marginTop: '3px' }}>
                      {(b.bio_i18n as any)._price_range}
                    </div>
                  )}
                </div>
              </Link>
            ))
            : [1,2,3,4].map(n => (
              <div key={n} style={{ borderLeft: n % 2 === 0 ? Bsm : B, borderBottom: n <= 2 ? Bsm : 'none', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F1EC', minHeight: '140px' }}>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: 'rgba(12,12,12,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>MAKER SLOT</div>
              </div>
            ))
          }
        </div>
      </section>

      {/* ── Live brands scroll ── */}
      {liveBrands.length > 0 && (
        <section>
          <div className="section-rule">
            <span className="section-rule-title">LIVE BRANDS</span>
            <Link href="/brands" className="section-rule-link">ALL BRANDS →</Link>
          </div>
          <div className="live-brands-scroll">
            {liveBrands.map(b => (
              <Link key={b.id} href={`/brands/${b.slug ?? b.id}`} className="lb-card" style={{ textDecoration: 'none' }}>
                <div className="lb-img">
                  {b.featured_photo_url || b.avatar_url
                    ? <img src={b.featured_photo_url ?? b.avatar_url!} alt={b.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div className="lb-img-name">{b.display_name}</div>
                  }
                  <div className="lb-live-tag">LIVE</div>
                </div>
                <div className="lb-info">
                  <div className="lb-name">{b.display_name}</div>
                  {(b.bio_i18n as any)?._category && (
                    <div className="lb-cat">{(b.bio_i18n as any)._category.split(',')[0].trim()}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Journal teaser ── */}
      {latestArticles.length > 0 && (
        <section>
          <div className="section-rule">
            <span className="section-rule-title">FROM THE JOURNAL</span>
            <Link href="/journal" className="section-rule-link">ALL ARTICLES →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: B }} className="home-journal">
            {latestArticles.map((article, i) => (
              <Link key={article.id} href={`/journal/${article.slug}`} style={{ borderRight: i < 2 ? B : 'none', padding: '36px 32px 40px', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', transition: 'background .18s', background: '#F4F1EC' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '72px', lineHeight: 1, color: 'rgba(12,12,12,0.065)', letterSpacing: '-0.04em', marginBottom: '14px' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '8px', letterSpacing: '0.22em', color: '#E8001C', textTransform: 'uppercase', marginBottom: '9px' }}>
                  {article.kicker}
                </div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '21px', letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.08, marginBottom: '14px', flex: 1, color: '#1A1A1A' }}>
                  {article.title}
                </div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 400, fontSize: '13px', lineHeight: 1.65, color: '#2E2E2E', marginBottom: '22px' }}>
                  {article.dek}
                </div>
                <span style={{ fontSize: '18px', color: 'rgba(12,12,12,0.2)' }}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Maker CTA ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: B, minHeight: '116px' }} className="home-cta">
        <div style={{ padding: '38px 52px', borderRight: B, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.2em', color: '#1A1A1A', textTransform: 'uppercase' }}>FOR MAKERS &amp; CURATORS</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(26px,3vw,42px)', letterSpacing: '-0.01em', textTransform: 'uppercase', lineHeight: 0.95, color: '#1A1A1A' }}>
            REGISTER YOUR BRAND —<br />IT'S <span style={{ color: '#E8001C' }}>FREE</span>
          </div>
        </div>
        <Link href="/welcome/maker" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.16em', background: '#1A1A1A', color: '#F4F1EC', textDecoration: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'background .18s' }}>
          JOIN WEAREMAKERS.PT →
        </Link>
      </div>

      {/* ── Footer ── */}
      <footer style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: B }} className="home-footer">
        {[
          {
            type: 'brand',
            title: null,
            links: [],
          },
          {
            type: 'links',
            title: 'PLATFORM',
            links: [
              { label: 'Live Markets', href: '/markets' },
              { label: 'All Brands', href: '/brands' },
              { label: 'Hidden Gems', href: '/gems' },
              { label: 'The Journal', href: '/journal' },
              { label: 'My Circuit', href: '/circuit' },
            ],
          },
          {
            type: 'links',
            title: 'JOIN',
            links: [
              { label: "I'm a Maker", href: '/welcome/maker' },
              { label: "I'm a Curator", href: '/welcome/curator' },
              { label: 'I have a Space', href: '/espacos' },
              { label: 'For Makers & Curators', href: '/pitch' },
            ],
          },
          {
            type: 'links',
            title: 'CONTACT',
            links: [
              { label: 'General', href: 'mailto:info@wearemakers.pt' },
              { label: 'Spaces & Parishes', href: 'mailto:espacos@wearemakers.pt' },
              { label: 'Press', href: 'mailto:press@wearemakers.pt' },
            ],
          },
        ].map((col, i) => (
          <div key={i} style={{ padding: '48px 40px', borderRight: i < 3 ? B : 'none' }}>
            {col.type === 'brand' ? (
              <>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', letterSpacing: '0.03em', marginBottom: '14px', textTransform: 'uppercase', color: '#1A1A1A' }}>
                  WEARE<span style={{ color: '#E8001C' }}>MAKERS</span>.PT
                </div>
                <div style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 300, fontSize: '12.5px', color: '#6B6560', lineHeight: 1.65, maxWidth: '210px', marginBottom: '22px' }}>
                  The real Lisbon isn't behind glass. Find the independent makers, find the street markets.
                </div>
                <a href="mailto:info@wearemakers.pt" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9.5px', letterSpacing: '0.1em', color: '#1A1A1A', borderBottom: '1px solid rgba(12,12,12,0.22)', paddingBottom: '2px', textDecoration: 'none' }}>
                  info@wearemakers.pt
                </a>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.2em', color: '#1A1A1A', marginBottom: '18px', textTransform: 'uppercase' }}>{col.title}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {col.links.map(l => (
                    <li key={l.href}>
                      <a href={l.href} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1A1A1A', textDecoration: 'none', transition: 'color .15s' }}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </footer>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 40px', fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', color: '#1A1A1A', borderBottom: B }}>
        <span>© 2026 WEAREMAKERS.PT — LISBON, PORTUGAL</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/privacy" style={{ color: '#6B6560', textDecoration: 'none', textTransform: 'uppercase' }}>Privacy</Link>
          <Link href="/terms" style={{ color: '#6B6560', textDecoration: 'none', textTransform: 'uppercase' }}>Terms</Link>
          <a href="https://instagram.com/wearemakerspt" target="_blank" rel="noopener noreferrer" style={{ color: '#6B6560', textDecoration: 'none', textTransform: 'uppercase' }}>Instagram</a>
        </div>
      </div>

      <InstallPrompt />

      {/* Responsive overrides */}
      <style>{`
        .mc-arr { opacity: 0; }
        a:hover .mc-arr { opacity: 1 !important; }
        @media (max-width: 860px) {
          .home-hero { grid-template-columns: 1fr !important; min-height: auto !important; }
          .home-hero > div:first-child { border-right: none !important; border-bottom: 2px solid #0C0C0C !important; padding: 40px 24px 32px !important; }
          .home-hero > div:first-child > div:first-child { font-size: clamp(72px,18vw,120px) !important; }
          .home-spotlight { grid-template-columns: 1fr !important; min-height: auto !important; }
          .home-spotlight > div:first-child { border-right: none !important; border-bottom: 2px solid #0C0C0C !important; padding: 40px 28px !important; min-height: 240px; }
          .home-journal { grid-template-columns: 1fr !important; }
          .home-journal > a { border-right: none !important; border-bottom: 1px solid rgba(12,12,12,0.15) !important; }
          .home-footer { grid-template-columns: 1fr 1fr !important; }
          .home-footer > div:first-child { grid-column: 1/-1; border-right: none !important; border-bottom: 1px solid rgba(12,12,12,0.15) !important; }
          .home-footer > div:nth-child(2) { border-right: 2px solid #0C0C0C !important; }
          .home-cta { grid-template-columns: 1fr !important; }
          .home-cta > div:first-child { border-right: none !important; border-bottom: 1px solid rgba(12,12,12,0.15) !important; padding: 28px 24px !important; }
          .home-cta > a { padding: 22px !important; border-top: 2px solid #0C0C0C !important; }
        }
        @media (max-width: 540px) {
          .home-footer { grid-template-columns: 1fr !important; }
          .home-footer > div { border-right: none !important; border-bottom: 1px solid rgba(12,12,12,0.15) !important; padding: 32px 24px !important; }
          .home-journal { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
