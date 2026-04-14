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

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560', GREEN = '#1a5c30'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"
const T = { fontFamily: FM, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

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
      supabase.from('saved_brands').select(`
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
      `).eq('visitor_id', user.id).order('saved_at', { ascending: false }),

      supabase.from('saved_gems').select(`
        gem_id, saved_at,
        gem:gems (
          id, name, category, description, address,
          near_space_id,
          space:spaces ( name, parish )
        )
      `).eq('visitor_id', user.id).order('saved_at', { ascending: false }),

      supabase.from('saved_markets').select(`
        market_id, saved_at,
        market:markets (
          id, title, event_date, event_date_end, starts_at, ends_at, status,
          space:spaces ( name, slug, parish )
        )
      `).eq('visitor_id', user.id).order('saved_at', { ascending: false }),
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

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={liveNow.length} />

      <style>{`
        .circuit-brand-row:hover { background: ${PAPER} !important; }
        .circuit-market-row:hover { background: ${PAPER} !important; }
        .circuit-gem-row:hover { background: ${PAPER} !important; }
      `}</style>

      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        {/* Header */}
        <div style={{ background: INK, borderBottom: B, padding: '52px 52px 40px' }}>
          <div style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '12px' }}>
            MY CIRCUIT · SAVED PLACES AND BRANDS
          </div>
          <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(52px,10vw,88px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: WHITE, marginBottom: '28px' }}>
            THE REAL<br /><em style={{ color: RED, fontStyle: 'italic' }}>LISBON.</em>
          </h1>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, borderTop: `1px solid rgba(244,241,236,0.1)`, paddingTop: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'BRANDS', value: savedBrands.length, sub: liveNow.length > 0 ? `${liveNow.length} LIVE NOW` : 'SAVED', highlight: liveNow.length > 0 },
              { label: 'MARKETS', value: savedMarkets.length, sub: `${upcomingMarkets.length} UPCOMING`, highlight: false },
              { label: 'GEMS', value: savedGems.length, sub: 'SAVED PLACES', highlight: false },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: '28px', marginRight: '28px', borderRight: i < 2 ? `1px solid rgba(244,241,236,0.1)` : 'none' }}>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '40px', color: s.highlight ? RED : WHITE, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: FM, fontSize: '10px', color: s.highlight ? RED : 'rgba(244,241,236,0.2)', fontWeight: s.highlight ? 700 : 400, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {user && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid rgba(244,241,236,0.1)` }}>
              <PushSubscribe userId={user?.id ?? null} />
            </div>
          )}
        </div>

        {/* Not logged in */}
        {!user && (
          <div style={{ padding: '64px 52px', borderBottom: B }}>
            <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(12,12,12,0.12)', marginBottom: '16px' }}>SIGN IN TO ACCESS YOUR CIRCUIT</div>
            <div style={{ fontFamily: FB, fontSize: '15px', color: STONE, lineHeight: 1.7, marginBottom: '28px', maxWidth: '480px' }}>
              Save brands, market dates and hidden gems. Get notified when saved brands go live.
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/auth/register" style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', color: WHITE, background: RED, border: `2px solid ${RED}`, padding: '12px 22px', textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.14em' }}>JOIN FREE →</Link>
              <Link href="/auth/login" style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', color: INK, background: 'transparent', border: B, padding: '12px 22px', textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.14em' }}>SIGN IN</Link>
            </div>
          </div>
        )}

        {/* Empty */}
        {user && savedBrands.length === 0 && savedGems.length === 0 && savedMarkets.length === 0 && (
          <div style={{ padding: '64px 52px', borderBottom: B }}>
            <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(12,12,12,0.12)', marginBottom: '16px' }}>YOUR CIRCUIT IS EMPTY</div>
            <div style={{ fontFamily: FB, fontSize: '15px', color: STONE, lineHeight: 1.7, marginBottom: '28px', maxWidth: '480px' }}>Browse brands, save market dates, discover hidden gems.</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/brands" style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', color: WHITE, background: INK, border: B, padding: '12px 22px', textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.14em' }}>BROWSE BRANDS →</Link>
              <Link href="/markets" style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', color: INK, background: 'transparent', border: B, padding: '12px 22px', textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.14em' }}>SEE MARKETS →</Link>
            </div>
          </div>
        )}

        {/* Live brands */}
        {liveNow.length > 0 && (
          <div>
            <div style={{ background: RED, color: WHITE, padding: '0 52px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: B }}>
              <span style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>● ACTIVE RIGHT NOW</span>
              <span style={{ fontFamily: FM, fontSize: '10px', opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{liveNow.length} LIVE</span>
            </div>
            {liveNow.map(brand => <BrandRow key={brand.id} brand={brand} userId={user?.id ?? null} />)}
          </div>
        )}

        {/* Saved markets — upcoming only */}
        {upcomingMarkets.length > 0 && (
          <div>
            <div className="section-rule" style={{ padding: '0 52px' }}>
              <span className="section-rule-title">MY MARKET DATES</span>
              <span className="section-rule-link">{upcomingMarkets.length} UPCOMING</span>
            </div>
            {upcomingMarkets.map((market: any, i: number) => {
              const spaceSlug = market.space?.slug ?? market.space?.name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
              const isMarketLive = ['live', 'community_live'].includes(market.status)
              return (
                <div key={market.id} className="circuit-market-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '0 52px', height: '72px', borderBottom: Bsm, background: i % 2 === 0 ? WHITE : PAPER, transition: 'background .15s' }}>
                  <div style={{ flexShrink: 0, minWidth: '80px' }}>
                    <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '14px', color: INK, lineHeight: 1.2 }}>{formatDate(market.event_date)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/markets/${market.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1 }}>{market.title}</div>
                    </Link>
                    <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, marginTop: '3px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                      <span>{formatTime(market.starts_at)}–{formatTime(market.ends_at)}</span>
                      {market.space?.name && spaceSlug && (
                        <Link href={`/spaces/${spaceSlug}`} style={{ color: RED, textDecoration: 'none', fontWeight: 700 }}>{market.space.name} →</Link>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {isMarketLive && <span style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: GREEN, letterSpacing: '0.1em' }}>● LIVE</span>}
                    <SaveMarketButton marketId={market.id} marketTitle={market.title} userId={user?.id ?? null} initialSaved={true} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Not live brands */}
        {notLive.length > 0 && (
          <div>
            <div className="section-rule" style={{ padding: '0 52px' }}>
              <span className="section-rule-title">NOT HERE TODAY</span>
              <span className="section-rule-link">{notLive.length} TRACKED</span>
            </div>
            {notLive.map(brand => <BrandRow key={brand.id} brand={brand} userId={user?.id ?? null} />)}
          </div>
        )}

        {/* Saved Gems */}
        {savedGems.length > 0 && (
          <div>
            <div className="section-rule" style={{ padding: '0 52px' }}>
              <span className="section-rule-title">◆ MY GEMS</span>
              <span className="section-rule-link">{savedGems.length} SAVED</span>
            </div>
            {savedGems.map((gem: any) => {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${gem.name}${gem.address ? ', ' + gem.address : ''}, Lisbon`)}`
              return (
                <div key={gem.id} className="circuit-gem-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 52px', borderBottom: Bsm, background: WHITE, transition: 'background .15s' }}>
                  <div style={{ width: '44px', height: '44px', flexShrink: 0, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {GEM_ICONS[gem.category] ?? '◈'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1, marginBottom: '3px' }}>{gem.name}</div>
                    <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: STONE }}>
                      {gem.category.toUpperCase()} · NEAR {(gem.space as any)?.name?.toUpperCase() ?? ''}
                    </div>
                    {gem.description && <div style={{ fontFamily: FB, fontSize: '13px', color: STONE, fontStyle: 'italic', marginTop: '3px' }}>{gem.description}</div>}
                  </div>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK, border: Bsm, padding: '6px 14px', textDecoration: 'none', flexShrink: 0 }}>
                    MAP →
                  </a>
                </div>
              )
            })}
            <div style={{ padding: '16px 52px', borderBottom: Bsm }}>
              <Link href="/gems" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: RED, textDecoration: 'none' }}>DISCOVER MORE GEMS →</Link>
            </div>
          </div>
        )}

        {/* Discover links */}
        {user && (
          <div style={{ padding: '24px 52px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/brands" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: INK, background: WHITE, border: B, padding: '10px 18px', textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.14em' }}>DISCOVER BRANDS →</Link>
            <Link href="/markets" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: STONE, background: 'transparent', border: `1px solid rgba(12,12,12,0.2)`, padding: '10px 18px', textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.14em' }}>SEE MARKETS →</Link>
            <Link href="/gems" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: STONE, background: 'transparent', border: `1px solid rgba(12,12,12,0.2)`, padding: '10px 18px', textDecoration: 'none', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.14em' }}>DISCOVER GEMS →</Link>
          </div>
        )}
      </main>
    </>
  )
}

function BrandRow({ brand, userId }: { brand: any; userId: string | null }) {
  const offerActive = (brand.bio_i18n as any)?._offer_active !== false
  const activeOffer = brand.digital_offer && offerActive ? brand.digital_offer : null
  const category = (brand.bio_i18n as any)?._category?.split(',').map((c: string) => c.trim()).join(' · ')

  const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560', GREEN = '#1a5c30'
  const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
  const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

  return (
    <div style={{ borderBottom: Bsm, background: brand.is_live ? 'rgba(232,0,28,.02)' : WHITE }}>
      <div className="circuit-brand-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 52px', transition: 'background .15s' }}>
        <Link href={`/brands/${brand.slug ?? brand.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: '52px', height: '52px', background: INK, border: B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontWeight: 900, fontSize: '18px', color: RED, position: 'relative', overflow: 'hidden' }}>
            {brand.avatar_url
              ? <img src={brand.avatar_url} alt={brand.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : brand.display_name.slice(0, 2).toUpperCase()}
            {brand.is_live && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: GREEN, fontFamily: FM, fontWeight: 700, fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', padding: '2px 4px', textAlign: 'center' }}>LIVE</div>}
          </div>
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/brands/${brand.slug ?? brand.id}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1, marginBottom: '3px' }}>{brand.display_name}</div>
          </Link>
          {brand.is_live && brand.live_market_name && (
            <div style={{ fontFamily: FM, fontSize: '10px', color: RED, fontWeight: 700, marginBottom: '2px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ● LIVE AT {brand.live_market_name.toUpperCase()} · {brand.live_starts_at?.slice(0,5)}–{brand.live_ends_at?.slice(0,5)}
            </div>
          )}
          {category && <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{category}</div>}
        </div>
        <SaveBrandButton brandId={brand.id} brandName={brand.display_name} initialSaved={true} userId={userId} size="sm" digitalOffer={activeOffer} />
      </div>
      {activeOffer && (
        <div style={{ margin: '0 52px 12px', padding: '10px 14px', background: 'rgba(232,0,28,.04)', border: `1px solid rgba(232,0,28,.15)`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: RED, fontSize: '14px', flexShrink: 0 }}>✦</span>
          <span style={{ fontFamily: FB, fontSize: '15px', color: RED, fontStyle: 'italic', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{activeOffer}</span>
          <span style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(232,0,28,.6)', flexShrink: 0, fontWeight: 700 }}>SHOW AT STALL</span>
        </div>
      )}
    </div>
  )
}
