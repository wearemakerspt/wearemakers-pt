import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getBrandBySlug } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/components/ui/SiteHeader'
import SaveBrandButton from '@/components/ui/SaveBrandButton'
import BrandGallery from '@/components/brands/BrandGallery'
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

  const supabase = await createClient()

  // Fetch photos, members, and saved status in parallel
  const [photosRes, membersRes, savedRes] = await Promise.all([
    supabase.from('brand_photos').select('id, photo_url, caption, sort_order').eq('brand_id', brand.id).order('sort_order'),
    supabase.from('brand_members').select('id, name, role, photo_url, bio, sort_order').eq('brand_id', brand.id).order('sort_order'),
    user
      ? supabase.from('saved_brands').select('id').eq('visitor_id', user.id).eq('brand_id', brand.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const photos = (photosRes.data ?? []) as { id: string; photo_url: string; caption: string | null; sort_order: number }[]
  const members = (membersRes.data ?? []) as { id: string; name: string; role: string | null; photo_url: string | null; bio: string | null; sort_order: number }[]
  const initialSaved = !!(savedRes as any).data

  const isLive = brand.is_live
  const bio_i18n = brand.bio_i18n as any
  const category = bio_i18n?._category ?? null
  const priceRange = bio_i18n?._price_range ?? null
  const offerActive = bio_i18n?._offer_active !== false
  const hasOffer = !!(brand.digital_offer && offerActive)

  return (
    <>
      <SiteHeader user={user} liveCount={isLive ? 1 : 0} />
      <BrandViewTracker brandId={brand.id} marketId={null} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        <style>{`
          .brand-market-row > div:hover { background: ${PAPER} !important; }
          @media (max-width: 860px) {
            .brand-hero { grid-template-columns: 1fr !important; }
            .brand-hero > div:first-child { border-right: none !important; border-bottom: ${B} !important; padding: 32px 20px !important; }
            .brand-hero > div:last-child { padding: 24px 20px !important; }
            .brand-members-grid { grid-template-columns: 1fr !important; }
          }
          @media (hover: none) { .lightbox-arrows { display: none !important; } }
        `}</style>

        {/* ── Hero — two column ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', borderBottom: B, minHeight: '300px' }} className="brand-hero">

          {/* Left — brand identity */}
          <div style={{ padding: '48px 52px', borderRight: B, display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {isLive && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: FM, fontSize: '10px', letterSpacing: '0.16em', color: WHITE, background: GREEN, padding: '5px 12px', textTransform: 'uppercase', width: 'fit-content' }}>
                <span style={{ fontSize: '7px' }}>●</span> LIVE NOW{brand.live_market_name ? ` · ${brand.live_market_name.toUpperCase()}` : ''}
              </div>
            )}

            {/* Avatar + name row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{ width: '72px', height: '72px', flexShrink: 0, border: B, background: PAPER, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontWeight: 900, fontSize: '22px', color: STONE }}>
                {brand.avatar_url
                  ? <img src={brand.avatar_url} alt={brand.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : brand.display_name.slice(0, 2).toUpperCase()
                }
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(36px,5vw,68px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.9, color: INK, marginBottom: '10px' }}>
                  {brand.display_name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
              <p style={{ fontFamily: FB, fontSize: '15px', color: STONE, lineHeight: 1.75, maxWidth: '520px' }}>
                {brand.bio}
              </p>
            )}

            {/* Offer unlock hint */}
            {hasOffer && !initialSaved && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: FM, fontSize: '10px', letterSpacing: '0.12em', color: RED, textTransform: 'uppercase', border: `1px solid rgba(232,0,28,.25)`, padding: '8px 14px', width: 'fit-content' }}>
                <span>✦</span> SAVE TO UNLOCK EXCLUSIVE OFFER
              </div>
            )}
          </div>

          {/* Right — dark sidebar */}
          <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '20px', background: INK, color: WHITE }}>

            <SaveBrandButton
              brandId={brand.id}
              brandName={brand.display_name}
              initialSaved={initialSaved}
              userId={user?.id ?? null}
              digitalOffer={hasOffer ? brand.digital_offer : null}
            />

            <div style={{ width: '100%', height: '1px', background: 'rgba(244,241,236,0.08)' }} />

            {brand.instagram_handle && (
              <div>
                <div style={{ fontFamily: FM, fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.35)', marginBottom: '6px', textTransform: 'uppercase' }}>INSTAGRAM</div>
                <InstagramTapTracker brandId={brand.id} handle={brand.instagram_handle} marketId={null}>
                  <a href={`https://instagram.com/${brand.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: FH, fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', color: WHITE, textDecoration: 'none' }}>
                    {brand.instagram_handle} ↗
                  </a>
                </InstagramTapTracker>
              </div>
            )}

            {brand.shop_url && (
              <div>
                <div style={{ fontFamily: FM, fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.35)', marginBottom: '6px', textTransform: 'uppercase' }}>ONLINE SHOP</div>
                <a href={brand.shop_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: FH, fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', color: WHITE, textDecoration: 'none' }}>
                  VISIT SHOP ↗
                </a>
              </div>
            )}

            {brand.whatsapp && (
              <div>
                <div style={{ fontFamily: FM, fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.35)', marginBottom: '6px', textTransform: 'uppercase' }}>WHATSAPP</div>
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
                <div style={{ fontFamily: FB, fontSize: '15px', color: WHITE, fontStyle: 'italic', marginBottom: '8px' }}>{brand.digital_offer}</div>
                <div style={{ fontFamily: FM, fontSize: '9px', color: 'rgba(244,241,236,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SHOW THIS AT THE STALL</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Photo Gallery ── */}
        {photos.length > 0 && (
          <div style={{ borderBottom: B }}>
            <div style={{ padding: '10px 16px', borderBottom: Bsm, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: PAPER }}>
              <span style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: INK }}>THE WORK</span>
              <span style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.1em' }}>{photos.length} PHOTO{photos.length !== 1 ? 'S' : ''}</span>
            </div>
            <BrandGallery photos={photos} />
          </div>
        )}

        {/* ── Team Members ── */}
        {members.length > 0 && (
          <div style={{ borderBottom: B }}>
            <div style={{ padding: '10px 16px', borderBottom: Bsm, background: PAPER }}>
              <span style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: INK }}>THE PEOPLE</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${members.length}, 1fr)` }} className="brand-members-grid">
              {members.map((m, i) => (
                <div key={m.id} style={{ padding: '28px 32px', borderRight: i < members.length - 1 ? Bsm : 'none', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {m.photo_url && (
                    <div style={{ width: '56px', height: '56px', flexShrink: 0, border: Bsm, overflow: 'hidden' }}>
                      <img src={m.photo_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1 }}>{m.name}</div>
                    {m.role && <div style={{ fontFamily: FM, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: RED, marginTop: '4px' }}>{m.role}</div>}
                    {m.bio && <div style={{ fontFamily: FB, fontSize: '13px', color: STONE, lineHeight: 1.6, marginTop: '8px' }}>{m.bio}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WHERE TO FIND ME ── */}
        {brand.upcoming_markets.length > 0 && (
          <div style={{ borderBottom: B }}>
            <div style={{ padding: '10px 16px 10px 52px', borderBottom: Bsm, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: PAPER }}>
              <span style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: INK }}>WHERE TO FIND ME</span>
              <span style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.1em' }}>{brand.upcoming_markets.length} UPCOMING</span>
            </div>
            {brand.upcoming_markets.map((market, i) => {
              const d = new Date(market.event_date + 'T12:00:00')
              return (
                <Link key={market.market_id} href={`/markets/${market.market_id}`} className="brand-market-row"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '0 52px', height: '72px', borderBottom: Bsm, background: i % 2 === 0 ? WHITE : PAPER, transition: 'background .12s' }}>
                    <div style={{ flexShrink: 0, width: '56px' }}>
                      <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '30px', color: INK, lineHeight: 1 }}>{d.getDate()}</div>
                      <div style={{ fontFamily: FM, fontSize: '9px', color: STONE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
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
                    <span style={{ fontFamily: FM, fontSize: '14px', color: 'rgba(12,12,12,0.2)' }}>→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ── Back ── */}
        <div style={{ padding: '24px 52px' }}>
          <Link href="/brands" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>← ALL BRANDS</Link>
        </div>

      </main>
    </>
  )
}
