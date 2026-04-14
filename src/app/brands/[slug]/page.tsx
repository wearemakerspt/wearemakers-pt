import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getBrandBySlug } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/components/ui/SiteHeader'
import SaveBrandButton from '@/components/ui/SaveBrandButton'
import BrandViewTracker from '@/components/ui/BrandViewTracker'
import InstagramTapTracker from '@/components/ui/InstagramTapTracker'

export const dynamic = 'force-dynamic'
interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) return { title: 'Brand Not Found' }
  return {
    title: `${brand.display_name} — WEAREMAKERS.PT`,
    description: brand.bio ?? `${brand.display_name} — independent maker at Lisbon street markets.`,
    alternates: { canonical: `/brands/${slug}` },
  }
}

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560', GREEN = '#1a5c30'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

export default async function BrandProfilePage({ params }: Props) {
  const { slug } = await params
  const [brand, user] = await Promise.all([getBrandBySlug(slug), getCurrentUser()])
  if (!brand) notFound()

  const isLive = brand.is_live
  const bio_i18n = brand.bio_i18n as any
  const category = bio_i18n?._category ?? null
  const priceRange = bio_i18n?._price_range ?? null
  const offerActive = bio_i18n?._offer_active !== false
  const hasOffer = !!(brand.digital_offer && offerActive)

  let initialSaved = false
  if (user) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.from('saved_brands').select('id').eq('visitor_id', user.id).eq('brand_id', brand.id).maybeSingle()
      initialSaved = !!data
    } catch { }
  }

  return (
    <>
      <SiteHeader user={user} liveCount={isLive ? 1 : 0} />
      <BrandViewTracker brandId={brand.id} marketId={null} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        <style>{`
          .brand-market-row:hover > div { background: ${PAPER} !important; }
          @media (max-width: 860px) {
            .brand-hero { grid-template-columns: 1fr !important; }
            .brand-hero > div:first-child { border-right: none !important; border-bottom: ${B} !important; padding: 36px 24px !important; }
            .brand-hero > div:last-child { padding: 28px 24px !important; }
          }
        `}</style>

        {/* Hero — two column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', borderBottom: B, minHeight: '320px' }} className="brand-hero">

          {/* Left — brand info */}
          <div style={{ padding: '52px', borderRight: B, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {isLive && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: FM, fontSize: '10px', letterSpacing: '0.16em', color: WHITE, background: GREEN, padding: '5px 12px', marginBottom: '20px', textTransform: 'uppercase' }}>
                  <span style={{ fontSize: '7px' }}>●</span> LIVE NOW {brand.live_market_name ? `AT ${brand.live_market_name.toUpperCase()}` : ''}
                </div>
              )}

              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', flexShrink: 0, border: B, background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontWeight: 900, fontSize: '24px', color: STONE, overflow: 'hidden' }}>
                  {brand.avatar_url
                    ? <img src={brand.avatar_url} alt={brand.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : brand.display_name.slice(0, 2).toUpperCase()
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(36px,6vw,72px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: INK, marginBottom: '8px' }}>
                    {brand.display_name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {brand.is_verified && (
                      <span style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK, border: `1px solid ${INK}`, padding: '3px 8px' }}>✦ PRO MAKER</span>
                    )}
                    {category && (
                      <span style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: STONE }}>
                        {category.split(',').map((c: string) => c.trim()).join(' · ')}
                      </span>
                    )}
                    {priceRange && (
                      <span style={{ fontFamily: FM, fontSize: '10px', color: RED, letterSpacing: '0.08em' }}>{priceRange}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {brand.bio && (
                <p style={{ fontFamily: FB, fontSize: '15px', color: STONE, lineHeight: 1.75, maxWidth: '540px', marginBottom: '24px' }}>
                  {brand.bio}
                </p>
              )}
            </div>

            {/* Offer unlock hint */}
            {hasOffer && !initialSaved && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: FM, fontSize: '10px', letterSpacing: '0.12em', color: RED, textTransform: 'uppercase', border: `1px solid rgba(232,0,28,.25)`, padding: '8px 14px', width: 'fit-content' }}>
                <span>✦</span> SAVE TO UNLOCK EXCLUSIVE OFFER
              </div>
            )}
          </div>

          {/* Right sidebar — dark */}
          <div style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: '24px', background: INK, color: WHITE }}>

            <SaveBrandButton
              brandId={brand.id}
              brandName={brand.display_name}
              initialSaved={initialSaved}
              userId={user?.id ?? null}
              digitalOffer={hasOffer ? brand.digital_offer : null}
            />

            <div style={{ width: '100%', height: '1px', background: 'rgba(244,241,236,0.1)' }} />

            {/* Instagram */}
            {brand.instagram_handle && (
              <div>
                <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>INSTAGRAM</div>
                <InstagramTapTracker brandId={brand.id} handle={brand.instagram_handle} marketId={null}>
                  <a href={`https://instagram.com/${brand.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', letterSpacing: '0.04em', textTransform: 'uppercase', color: WHITE, textDecoration: 'none' }}>
                    {brand.instagram_handle} ↗
                  </a>
                </InstagramTapTracker>
              </div>
            )}

            {/* Online Shop */}
            {brand.shop_url && (
              <div>
                <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>ONLINE SHOP</div>
                <a href={brand.shop_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: FH, fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', color: WHITE, textDecoration: 'none' }}>
                  VISIT SHOP ↗
                </a>
              </div>
            )}

            {/* WhatsApp */}
            {brand.whatsapp && (
              <div>
                <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>WHATSAPP</div>
                <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: FH, fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', color: WHITE, textDecoration: 'none' }}>
                  SEND MESSAGE ↗
                </a>
              </div>
            )}

            {/* Unlocked offer */}
            {hasOffer && initialSaved && (
              <div style={{ background: 'rgba(232,0,28,.12)', border: '1px solid rgba(232,0,28,.3)', padding: '14px' }}>
                <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.16em', color: RED, textTransform: 'uppercase', marginBottom: '6px' }}>✦ YOUR EXCLUSIVE OFFER</div>
                <div style={{ fontFamily: FB, fontSize: '15px', color: WHITE, fontStyle: 'italic' }}>{brand.digital_offer}</div>
                <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.4)', marginTop: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SHOW THIS AT THE STALL</div>
              </div>
            )}
          </div>
        </div>

        {/* WHERE TO FIND ME — upcoming markets */}
        {brand.upcoming_markets.length > 0 && (
          <div>
            <div className="section-rule">
              <span className="section-rule-title">WHERE TO FIND ME</span>
              <span className="section-rule-link">{brand.upcoming_markets.length} UPCOMING</span>
            </div>
            {brand.upcoming_markets.map((market, i) => {
              const d = new Date(market.event_date + 'T12:00:00')
              return (
                <Link key={market.market_id} href={`/markets/${market.market_id}`} className="brand-market-row"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '0 52px', height: '72px', borderBottom: Bsm, background: i % 2 === 0 ? WHITE : PAPER, transition: 'background .15s' }}>
                    <div style={{ flexShrink: 0, width: '64px' }}>
                      <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '32px', color: INK, lineHeight: 1 }}>{d.getDate()}</div>
                      <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1 }}>
                        {market.market_title}
                      </div>
                      <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, marginTop: '3px', letterSpacing: '0.06em' }}>
                        {market.space_name}{market.space_address ? ` · ${market.space_address}` : ''} · {market.starts_at?.slice(0, 5)}
                      </div>
                    </div>
                    <div style={{ fontFamily: FM, fontSize: '14px', color: 'rgba(12,12,12,0.2)' }}>→</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Back */}
        <div style={{ padding: '24px 52px', borderTop: B }}>
          <Link href="/brands" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>← ALL BRANDS</Link>
        </div>
      </main>
    </>
  )
}
