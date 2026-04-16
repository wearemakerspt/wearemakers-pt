import type { Metadata } from 'next'
import Link from 'next/link'
import { getLiveMarkets, getAllMarkets } from '@/lib/queries/markets'
import { getAllBrands } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import { getCuratorSpotlights, getWamTop20 } from '@/lib/queries/spotlight'
import { getAllArticles } from '@/lib/queries/journal'
import { createClient } from '@/lib/supabase/server'
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

async function getAllCurators() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, slug, avatar_url, bio, organisation_name')
    .eq('role', 'curator')
    .eq('is_approved', true)
    .eq('is_active', true)
    .order('display_name')
    .limit(20)
  return data ?? []
}

export default async function HomePage() {
  const [liveMarkets, allMarkets, allBrands, user, curatorCards, top20Rows, articles, weather, allCurators] = await Promise.all([
    getLiveMarkets(),
    getAllMarkets(),
    getAllBrands(),
    getCurrentUser(),
    getCuratorSpotlights(),
    getWamTop20(),
    getAllArticles(),
    getLisbonWeather(),
    getAllCurators(),
  ])

  const greeting = getGreeting()
  const liveBrands = allBrands.filter(b => b.is_live)
  const upcomingMarkets = allMarkets.filter(m => m.status === 'scheduled').slice(0, 3)
  const top20Brands = (top20Rows as any[]).map(r => r.maker).filter(Boolean).slice(0, 20)
  const latestArticles = articles.slice(0, 3)

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={liveMarkets.length} />

      <div id="scroll-area" style={{ overflowY: 'auto', flex: 1 }}>

        {/* ── Weather strip — PROMINENT ── */}
        {weather && (
          <div style={{
            background: 'var(--INK)',
            borderBottom: '3px solid var(--INK)',
            height: '44px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
          }}>
            <style>{`@keyframes weather-scroll { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
            {/* Left accent — colored bar showing condition */}
            <div style={{
              width: '6px',
              height: '44px',
              flexShrink: 0,
              background: weather.isGood ? 'var(--GRN)' : 'var(--RED)',
            }} />
            <div style={{ display: 'flex', animation: 'weather-scroll 30s linear infinite', whiteSpace: 'nowrap', flex: 1 }}>
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
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: weather.isGood ? '#fff' : 'rgba(240,236,224,.9)',
                      padding: '0 22px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      {item}
                      <span style={{ width: '4px', height: '4px', background: weather.isGood ? 'var(--GRN)' : 'var(--RED)', display: 'inline-block', flexShrink: 0 }} />
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Hero: Greeting + WAM Top 20 carousel ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          borderBottom: '3px solid var(--INK)',
          background: 'var(--P)',
          borderLeft: '4px solid var(--RED)',
        }} className="hero-grid">
          {/* Left: Greeting */}
          <div style={{ padding: '20px 16px 16px' }}>
            <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--INK)', opacity: 0.4, marginBottom: '10px' }}>
              {formatDate()} · LISBON
            </div>
            <div className="greeting-h">
              {greeting.line1}<br />
              {greeting.line2}<br />
              <em>{greeting.line3}</em>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/markets" className="greeting-pill">
                {liveMarkets.length} MARKETS OPEN
              </Link>
              <span style={{ fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--INK)', opacity: 0.35 }}>
                STREET MARKETS &amp; INDEPENDENT MAKERS
              </span>
            </div>
          </div>

          {/* Right: WAM Top 20 carousel — desktop only */}
          {top20Brands.length > 0 && (
            <div className="hero-top20" style={{ borderLeft: '3px solid var(--INK)', borderTop: '3px solid var(--INK)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '2px solid rgba(24,22,20,.1)',
              }}>
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--RED)' }}>
                  ★ WAM TOP 20
                </div>
                <Link href="/brands/wam-top20" style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', textDecoration: 'none' }}>
                  ALL 20 →
                </Link>
              </div>
              <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }} className="top20-scroll">
                {top20Brands.map((b: any) => (
                  <Link key={b.id} href={`/brands/${b.slug ?? b.id}`} style={{
                    textDecoration: 'none',
                    flexShrink: 0,
                    width: '100px',
                    borderRight: '2px solid rgba(24,22,20,.08)',
                    display: 'block',
                  }}>
                    <div style={{
                      aspectRatio: '1',
                      background: 'var(--P2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      {b.avatar_url
                        ? <img src={b.avatar_url} alt={b.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', color: 'rgba(24,22,20,.1)', letterSpacing: '-0.02em' }}>{b.display_name.slice(0, 2).toUpperCase()}</span>
                      }
                      {b.is_live && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--GRN)', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '7px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', padding: '2px 6px', textAlign: 'center' }}>● LIVE</div>
                      )}
                    </div>
                    <div style={{ padding: '6px 8px', borderTop: '2px solid rgba(24,22,20,.08)' }}>
                      <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.display_name}
                      </div>
                      {(b.bio_i18n as any)?._category && (
                        <div style={{ fontFamily: 'var(--TAG)', fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(24,22,20,.35)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {(b.bio_i18n as any)._category.split(',')[0].trim()}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @media (min-width: 768px) {
            .hero-grid { grid-template-columns: 55% 45% !important; }
            .hero-top20 { display: block !important; }
          }
          .hero-top20 { display: none; }
          .top20-scroll::-webkit-scrollbar { display: none; }
        `}</style>

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
                  {/* Curator name */}
                  {(m as any).curator?.display_name && (
                    <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--RED)', marginTop: '4px', fontWeight: 700 }}>
                      ↳ {(m as any).curator.display_name}
                    </div>
                  )}
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

        {/* ── Spotlight: Curator picks ── */}
        <div style={{ padding: '0 14px' }}>
          <SpotlightCarousel curatorCards={curatorCards} />
        </div>

        {/* ── All Curators carousel ── */}
        {allCurators.length > 0 && (
          <section style={{ borderTop: '3px solid var(--INK)' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '2px solid rgba(24,22,20,.1)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.38)', marginBottom: '3px' }}>MARKET CURATORS</div>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.92, color: 'var(--INK)' }}>
                  WHO RUNS THE MARKETS
                </div>
              </div>
              <span style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.35)' }}>
                {allCurators.length} CURATORS
              </span>
            </div>
            <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '3px solid var(--INK)' }} className="curator-scroll">
              {allCurators.map((c: any) => (
                <Link key={c.id} href={`/curators/${c.slug ?? c.id}`} style={{
                  textDecoration: 'none',
                  flexShrink: 0,
                  width: 'clamp(130px,30vw,180px)',
                  borderRight: '2px solid var(--INK)',
                  display: 'block',
                  background: 'var(--P)',
                }}>
                  <div style={{
                    aspectRatio: '1',
                    background: 'var(--INK)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt={c.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '36px', color: 'var(--RED)', letterSpacing: '-0.02em' }}>{c.display_name.slice(0, 2).toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ padding: '10px 10px 12px', borderTop: '2px solid var(--INK)', background: 'var(--P)' }}>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>
                      {c.display_name}
                    </div>
                    {c.organisation_name && (
                      <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)' }}>
                        {c.organisation_name}
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--RED)', marginTop: '4px', fontWeight: 700 }}>
                      VIEW PROFILE →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <style>{`.curator-scroll::-webkit-scrollbar { display: none; }`}</style>
          </section>
        )}

        {/* ── Live Brands scroll — BIGGER CARDS ── */}
        {liveBrands.length > 0 && (
          <section>
            <div className="sh">
              <div className="sh-l">Live Brands</div>
              <Link href="/brands" className="sh-r">ALL BRANDS →</Link>
            </div>
            <hr className="rule-heavy" />
            <div className="live-brands-scroll" style={{ borderBottom: '3px solid var(--INK)' }}>
              {liveBrands.map(b => (
                <Link key={b.id} href={`/brands/${b.slug ?? b.id}`} style={{
                  textDecoration: 'none',
                  flexShrink: 0,
                  width: 'clamp(130px,30vw,170px)',
                  borderRight: '2px solid var(--INK)',
                  display: 'block',
                  cursor: 'pointer',
                }}>
                  <div style={{ background: 'var(--INK)', aspectRatio: '1', display: 'flex', alignItems: 'flex-end', padding: '8px', position: 'relative', overflow: 'hidden' }}>
                    {b.avatar_url && (
                      <img src={b.avatar_url} alt={b.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                    )}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--GRN)', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: '#fff', zIndex: 2 }}>
                      <span>●</span> LIVE NOW
                    </div>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '12px', color: 'rgba(244,241,234,.15)', textTransform: 'uppercase', letterSpacing: '-0.01em', wordBreak: 'break-all', lineHeight: 1.1, position: 'relative', zIndex: 1 }}>
                      {b.display_name}
                    </div>
                  </div>
                  <div style={{ padding: '9px 10px', background: 'var(--P)', borderTop: '2px solid var(--INK)' }}>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(15px,3.5vw,19px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.display_name}
                    </div>
                    {(b.bio_i18n as any)?._category && (
                      <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'var(--INK)', opacity: 0.38, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {(b.bio_i18n as any)._category.split(',')[0].trim()}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Upcoming markets ── */}
        {upcomingMarkets.length > 0 && (
          <section>
            <div style={{ padding: '14px 14px 8px', borderBottom: '3px solid var(--INK)', borderTop: '3px solid var(--INK)' }}>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.38)', marginBottom: '4px' }}>COMING UP</div>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: 'var(--INK)' }}>UPCOMING MARKETS</div>
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
                  {m.curator?.display_name && (
                    <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--RED)', marginTop: '4px', fontWeight: 700 }}>
                      ↳ {m.curator.display_name}
                    </div>
                  )}
                </div>
              </Link>
            ))}
            <div style={{ borderBottom: '3px solid var(--INK)', padding: '14px', textAlign: 'center' }}>
              <Link href="/markets" className="sh-r">VIEW FULL CALENDAR →</Link>
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {liveMarkets.length === 0 && upcomingMarkets.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '12px' }}>NO LIVE MARKETS</div>
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
                  <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.38)', marginBottom: '4px' }}>FROM THE JOURNAL</div>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.92, color: 'var(--INK)' }}>NEIGHBOURHOOD LOOPS</div>
                </div>
                <Link href="/journal" style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.45)', textDecoration: 'none' }}>ALL →</Link>
              </div>
            </div>
            {latestArticles.map((article, i) => (
              <Link key={article.id} href={`/journal/${article.slug}`} style={{ textDecoration: 'none', display: 'block', borderBottom: '2px solid var(--INK)' }}>
                <div style={{ padding: '14px', background: i % 2 === 0 ? 'var(--P)' : 'var(--P2)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '48px', color: 'rgba(24,22,20,.07)', lineHeight: 1, flexShrink: 0, width: '48px', textAlign: 'right' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--RED)', fontWeight: 700, marginBottom: '5px' }}>{article.kicker}</div>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.95, color: 'var(--INK)', marginBottom: '6px' }}>{article.title}</div>
                    <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'rgba(24,22,20,.5)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{article.dek}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--TAG)', fontSize: '14px', color: 'rgba(24,22,20,.2)', flexShrink: 0, alignSelf: 'center' }}>→</div>
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
          <Link href="/welcome/maker" className="btn-red">JOIN WEAREMAKERS.PT →</Link>
        </div>

        {/* ── Footer ── */}
        <footer style={{ background: 'var(--INK)', borderTop: '1px solid rgba(240,236,224,.08)', padding: '32px 16px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '28px', marginBottom: '28px' }}>
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
            <div>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.2)', marginBottom: '12px' }}>PLATFORM</div>
              {[{ label: 'Live Markets', href: '/markets' }, { label: 'All Brands', href: '/brands' }, { label: 'Hidden Gems', href: '/gems' }, { label: 'The Journal', href: '/journal' }, { label: 'My Circuit', href: '/circuit' }].map(l => (
                <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.35)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>{l.label}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.2)', marginBottom: '12px' }}>JOIN</div>
              {[{ label: "I'm a Maker", href: '/welcome/maker' }, { label: "I'm a Curator", href: '/welcome/curator' }, { label: 'I have a Space', href: '/espacos' }, { label: 'For Makers & Curators', href: '/pitch' }].map(l => (
                <Link key={l.href} href={l.href} style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.35)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>{l.label}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.2)', marginBottom: '12px' }}>CONTACT</div>
              {[{ label: 'General', href: 'mailto:info@wearemakers.pt' }, { label: 'Spaces & Parishes', href: 'mailto:espacos@wearemakers.pt' }, { label: 'Press', href: 'mailto:press@wearemakers.pt' }].map(l => (
                <a key={l.href} href={l.href} style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.35)', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>{l.label}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(240,236,224,.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,.18)' }}>© 2026 WEAREMAKERS.PT — LISBON, PORTUGAL</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Instagram', 'https://instagram.com/wearemakerspt']].map(([label, href]) => (
                <a key={label} href={href} style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,.18)', textDecoration: 'none' }}>{label}</a>
              ))}
            </div>
          </div>
        </footer>

        <InstallPrompt />

      </div>
    </>
  )
}
