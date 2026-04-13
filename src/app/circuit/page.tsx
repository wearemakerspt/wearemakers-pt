import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/queries/auth'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/components/ui/SiteHeader'
import SaveBrandButton from '@/components/ui/SaveBrandButton'
import SaveMarketButton from '@/components/ui/SaveMarketButton'
import RealtimeRefresh from '@/components/ui/RealtimeRefresh'
import PushSubscribe from '@/components/ui/PushSubscribe'

export const metadata: Metadata = {
  title: 'My Circuit — WEAREMAKERS.PT',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const GEM_ICONS: Record<string, string> = {
  coffee: '☕', food: '🍽', drinks: '🍷', studio: '◆', shop: '◈'
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
}
function formatTime(t: string) { return t?.slice(0, 5) ?? '' }

export default async function CircuitPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  let savedBrands: any[] = []
  let savedGems: any[] = []
  let savedMarkets: any[] = []

  if (user) {
    const [brandsRes, gemsRes, marketsRes] = await Promise.all([
      supabase
        .from('saved_brands')
        .select(`
          brand_id, saved_at,
          brand:profiles (
            id, display_name, slug, bio, bio_i18n,
            instagram_handle, is_verified, digital_offer, avatar_url,
            attendance (
              id, checked_out_at,
              market:markets (
                id, event_date, starts_at, ends_at, status,
                space:spaces ( name, parish )
              )
            )
          )
        `)
        .eq('visitor_id', user.id)
        .order('saved_at', { ascending: false }),

      supabase
        .from('saved_gems')
        .select(`
          gem_id, saved_at,
          gem:gems (
            id, name, category, description, address,
            near_space_id,
            space:spaces ( name, parish )
          )
        `)
        .eq('visitor_id', user.id)
        .order('saved_at', { ascending: false }),

      supabase
        .from('saved_markets')
        .select(`
          market_id, saved_at,
          market:markets (
            id, title, event_date, event_date_end, starts_at, ends_at, status,
            space:spaces ( name, slug, parish )
          )
        `)
        .eq('visitor_id', user.id)
        .order('saved_at', { ascending: false }),
    ])

    const today = new Date().toISOString().split('T')[0]

    savedBrands = (brandsRes.data ?? []).map((row: any) => {
      const brand = row.brand
      const liveCheckin = (brand?.attendance ?? []).find((a: any) =>
        !a.checked_out_at &&
        a.market?.event_date === today &&
        ['live', 'community_live'].includes(a.market?.status)
      )
      return {
        ...brand,
        is_live: !!liveCheckin,
        live_market_name: liveCheckin?.market?.space?.name ?? null,
        live_starts_at: liveCheckin?.market?.starts_at ?? null,
        live_ends_at: liveCheckin?.market?.ends_at ?? null,
        saved_at: row.saved_at,
      }
    }).filter(Boolean)

    savedGems = (gemsRes.data ?? []).map((row: any) => row.gem).filter(Boolean)

    savedMarkets = (marketsRes.data ?? [])
      .map((row: any) => ({ ...row.market, saved_at: row.saved_at }))
      .filter((m: any) => m?.id)
      .sort((a: any, b: any) => {
        const today2 = new Date().toISOString().split('T')[0]
        const aFuture = a.event_date >= today2
        const bFuture = b.event_date >= today2
        if (aFuture && !bFuture) return -1
        if (!aFuture && bFuture) return 1
        return a.event_date.localeCompare(b.event_date)
      })
  }

  const today = new Date().toISOString().split('T')[0]
  const liveNow = savedBrands.filter(b => b.is_live)
  const notLive = savedBrands.filter(b => !b.is_live)
  const upcomingMarkets = savedMarkets.filter((m: any) => m.event_date >= today)
  const pastMarkets = savedMarkets.filter((m: any) => m.event_date < today)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={liveNow.length} />

      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* ── Header ── */}
        <div style={{ background: 'var(--INK)', borderBottom: '3px solid var(--INK)', padding: '16px 16px 14px' }}>
          <div style={{ ...T, color: 'var(--RED)', marginBottom: '10px' }}>
            MY CIRCUIT · SAVED PLACES AND BRANDS
          </div>
          <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(36px,10vw,60px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: 'var(--P)', marginBottom: '12px' }}>
            THE REAL<br /><em style={{ color: 'var(--RED)' }}>LISBON.</em>
          </h1>
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(240,236,224,.1)', paddingTop: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'BRANDS', value: savedBrands.length, active: liveNow.length > 0, sub: liveNow.length > 0 ? `${liveNow.length} LIVE NOW` : 'SAVED' },
              { label: 'MARKETS', value: savedMarkets.length, active: false, sub: `${upcomingMarkets.length} UPCOMING` },
              { label: 'GEMS', value: savedGems.length, active: false, sub: 'SAVED PLACES' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: '24px', marginRight: '24px', borderRight: i < 2 ? '1px solid rgba(240,236,224,.1)' : 'none' }}>
                <div style={{ fontFamily: 'var(--MONO)', fontWeight: 800, fontSize: '28px', color: s.active ? 'var(--RED)' : 'var(--P)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.35)', marginTop: '2px' }}>{s.label}</div>
                <div style={{ ...T, fontSize: '9px', color: s.active ? 'var(--RED)' : 'rgba(240,236,224,.2)', fontWeight: s.active ? 700 : 400 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          {user && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(240,236,224,.1)' }}>
              <PushSubscribe userId={user?.id ?? null} />
            </div>
          )}
        </div>

        {/* ── Not logged in ── */}
        {!user && (
          <div style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)', padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '12px' }}>SIGN IN TO ACCESS YOUR CIRCUIT</div>
            <div style={{ fontFamily: 'var(--MONO)', fontSize: '16px', color: 'rgba(24,22,20,.45)', lineHeight: 1.6, marginBottom: '20px' }}>Save brands, markets and hidden gems. Get notified when saved brands go live.</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/register" style={{ ...T, fontWeight: 700, fontSize: '12px', color: 'var(--P)', background: 'var(--RED)', border: '3px solid var(--RED)', padding: '12px 22px', textDecoration: 'none', display: 'inline-block', boxShadow: 'var(--SHD)' }}>JOIN FREE →</Link>
              <Link href="/auth/login" style={{ ...T, fontWeight: 700, fontSize: '12px', color: 'var(--INK)', background: 'transparent', border: '3px solid var(--INK)', padding: '12px 22px', textDecoration: 'none', display: 'inline-block' }}>SIGN IN</Link>
            </div>
          </div>
        )}

        {/* ── Empty ── */}
        {user && savedBrands.length === 0 && savedGems.length === 0 && savedMarkets.length === 0 && (
          <div style={{ margin: '12px', border: '3px solid var(--INK)', background: 'var(--P)', padding: '32px 20px', textAlign: 'center', boxShadow: 'var(--SHD-SM)' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '12px' }}>YOUR CIRCUIT IS EMPTY</div>
            <div style={{ fontFamily: 'var(--MONO)', fontSize: '15px', color: 'rgba(24,22,20,.45)', lineHeight: 1.6, marginBottom: '20px' }}>Browse brands, save market dates, discover hidden gems.</div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/brands" style={{ ...T, fontWeight: 700, fontSize: '11px', color: 'var(--P)', background: 'var(--INK)', border: '3px solid var(--INK)', padding: '12px 22px', textDecoration: 'none', display: 'inline-block', boxShadow: 'var(--SHD)' }}>BROWSE BRANDS →</Link>
              <Link href="/markets" style={{ ...T, fontWeight: 700, fontSize: '11px', color: 'var(--INK)', background: 'transparent', border: '3px solid var(--INK)', padding: '12px 22px', textDecoration: 'none', display: 'inline-block' }}>SEE MARKETS →</Link>
            </div>
          </div>
        )}

        {/* ── Live brands ── */}
        {liveNow.length > 0 && (
          <div style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div style={{ background: 'var(--RED)', color: 'var(--P)', padding: '9px 13px', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>● ACTIVE RIGHT NOW</span>
              <span style={{ opacity: 0.6, fontSize: '9px' }}>{liveNow.length} LIVE</span>
            </div>
            {liveNow.map(brand => <BrandRow key={brand.id} brand={brand} userId={user?.id ?? null} />)}
          </div>
        )}

        {/* ── Saved markets ── */}
        {savedMarkets.length > 0 && (
          <div style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>MY MARKET DATES</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>{savedMarkets.length} SAVED</span>
            </div>

            {upcomingMarkets.length > 0 && (
              <>
                {upcomingMarkets.length > 0 && pastMarkets.length > 0 && (
                  <div style={{ padding: '5px 14px', background: 'var(--P2)', borderBottom: '1px solid rgba(24,22,20,.08)' }}>
                    <span style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(24,22,20,.3)', letterSpacing: '0.14em' }}>UPCOMING</span>
                  </div>
                )}
                {upcomingMarkets.map((market: any, i: number) => {
                  const spaceSlug = market.space?.slug ?? market.space?.name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                  const isMarketLive = ['live', 'community_live'].includes(market.status)
                  return (
                    <div key={market.id} style={{ borderBottom: '2px solid rgba(24,22,20,.08)', background: i % 2 === 0 ? 'var(--P)' : 'var(--P2)', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px' }}>
                      <div style={{ flexShrink: 0, minWidth: '68px' }}>
                        <div style={{ fontFamily: 'var(--MONO)', fontWeight: 800, fontSize: '12px', color: 'var(--INK)', lineHeight: 1.3 }}>
                          {formatDate(market.event_date)}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/markets/${market.id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>
                            {market.title}
                          </div>
                        </Link>
                        <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(24,22,20,.4)', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                          <span>{formatTime(market.starts_at)}–{formatTime(market.ends_at)}</span>
                          {market.space?.name && spaceSlug && (
                            <Link href={`/spaces/${spaceSlug}`} style={{ color: 'var(--RED)', textDecoration: 'none', fontWeight: 700 }}>
                              {market.space.name} →
                            </Link>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {isMarketLive && <span style={{ fontFamily: 'var(--TAG)', fontSize: '9px', fontWeight: 700, color: '#1a5c30' }}>● LIVE</span>}
                        <SaveMarketButton marketId={market.id} marketTitle={market.title} userId={user?.id ?? null} initialSaved={true} />
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {pastMarkets.length > 0 && (
              <>
                <div style={{ padding: '5px 14px', background: 'var(--P2)', borderBottom: '1px solid rgba(24,22,20,.06)', borderTop: upcomingMarkets.length > 0 ? '2px solid rgba(24,22,20,.08)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(24,22,20,.25)', letterSpacing: '0.14em' }}>PAST</span>
                </div>
                {pastMarkets.map((market: any) => (
                  <div key={market.id} style={{ borderBottom: '1px solid rgba(24,22,20,.05)', background: 'var(--P2)', display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 14px', opacity: 0.45 }}>
                    <div style={{ fontFamily: 'var(--MONO)', fontWeight: 700, fontSize: '11px', color: 'rgba(24,22,20,.5)', flexShrink: 0 }}>{formatDate(market.event_date)}</div>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'rgba(24,22,20,.5)', flex: 1 }}>{market.title}</div>
                    <SaveMarketButton marketId={market.id} marketTitle={market.title} userId={user?.id ?? null} initialSaved={true} />
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Tracked brands ── */}
        {notLive.length > 0 && (
          <div style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>NOT HERE TODAY</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>{notLive.length} TRACKED</span>
            </div>
            {notLive.map(brand => <BrandRow key={brand.id} brand={brand} userId={user?.id ?? null} />)}
          </div>
        )}

        {/* ── Saved Gems ── */}
        {savedGems.length > 0 && (
          <div style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>◆ MY GEMS</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>{savedGems.length} SAVED</span>
            </div>
            {savedGems.map((gem: any) => {
              const googleQuery = encodeURIComponent(`${gem.name}${gem.address ? ', ' + gem.address : ''}, Lisbon`)
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${googleQuery}`
              return (
                <div key={gem.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderBottom: '2px solid rgba(24,22,20,.1)', background: 'var(--P)' }}>
                  <div style={{ width: '44px', height: '44px', flexShrink: 0, background: 'var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {GEM_ICONS[gem.category] ?? '◈'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>{gem.name}</div>
                    <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)' }}>
                      {gem.category.toUpperCase()} · NEAR {(gem.space as any)?.name?.toUpperCase() ?? ''}
                    </div>
                    {gem.description && <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'rgba(24,22,20,.5)', fontStyle: 'italic', marginTop: '3px' }}>{gem.description}</div>}
                  </div>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--TAG)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--INK)', border: '1px solid rgba(24,22,20,.2)', padding: '5px 10px', textDecoration: 'none', flexShrink: 0 }}>
                    MAP →
                  </a>
                </div>
              )
            })}
            <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(24,22,20,.08)' }}>
              <Link href="/gems" style={{ fontFamily: 'var(--TAG)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--RED)', textDecoration: 'none' }}>DISCOVER MORE GEMS →</Link>
            </div>
          </div>
        )}

        {/* ── Discover more ── */}
        {user && (
          <div style={{ margin: '12px 12px 12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/brands" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--INK)', background: 'var(--P)', border: '2px solid var(--INK)', padding: '10px 16px', textDecoration: 'none', display: 'inline-block' }}>DISCOVER BRANDS →</Link>
            <Link href="/markets" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'rgba(24,22,20,.5)', background: 'transparent', border: '2px solid rgba(24,22,20,.2)', padding: '10px 16px', textDecoration: 'none', display: 'inline-block' }}>SEE MARKETS →</Link>
            <Link href="/gems" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'rgba(24,22,20,.5)', background: 'transparent', border: '2px solid rgba(24,22,20,.2)', padding: '10px 16px', textDecoration: 'none', display: 'inline-block' }}>DISCOVER GEMS →</Link>
          </div>
        )}
      </main>
    </>
  )
}

function BrandRow({ brand, userId }: { brand: any; userId: string | null }) {
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const offerActive = (brand.bio_i18n as any)?._offer_active !== false
  const activeOffer = brand.digital_offer && offerActive ? brand.digital_offer : null

  return (
    <div style={{ borderBottom: '2px solid rgba(24,22,20,.1)', background: brand.is_live ? 'rgba(200,41,26,.03)' : 'var(--P)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px' }}>
        <Link href={`/brands/${brand.slug ?? brand.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '52px', height: '52px', background: 'var(--INK)', border: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', color: 'var(--RED)', position: 'relative', overflow: 'hidden' }}>
            {brand.avatar_url
              ? <img src={brand.avatar_url} alt={brand.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : brand.display_name.slice(0, 2).toUpperCase()}
            {brand.is_live && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--GRN)', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '7px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', padding: '2px 4px', textAlign: 'center' }}>LIVE</div>
            )}
          </div>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/brands/${brand.slug ?? brand.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>
              {brand.display_name}
            </div>
          </Link>
          {brand.is_live && brand.live_market_name && (
            <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700, marginBottom: '2px' }}>
              ● LIVE AT {brand.live_market_name.toUpperCase()} · {brand.live_starts_at?.slice(0,5)}–{brand.live_ends_at?.slice(0,5)}
            </div>
          )}
          {(brand.bio_i18n as any)?._category && (
            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>
              {(brand.bio_i18n as any)._category.split(',').map((c: string) => c.trim()).join(' · ')}
            </div>
          )}
        </div>
        <SaveBrandButton brandId={brand.id} brandName={brand.display_name} initialSaved={true} userId={userId} size="sm" digitalOffer={activeOffer} />
      </div>
      {activeOffer && (
        <div style={{ margin: '0 14px 10px', padding: '8px 12px', background: 'rgba(200,41,26,.06)', border: '1px solid rgba(200,41,26,.18)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--RED)', fontSize: '14px', flexShrink: 0 }}>✦</span>
          <span style={{ fontFamily: 'var(--MONO)', fontSize: '15px', color: 'var(--RED)', fontStyle: 'italic', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{activeOffer}</span>
          <span style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(200,41,26,.7)', flexShrink: 0, fontWeight: 700 }}>SHOW AT STALL</span>
        </div>
      )}
    </div>
  )
}
