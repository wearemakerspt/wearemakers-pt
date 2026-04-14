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

export default async function BrandProfilePage({ params }: Props) {
  const { slug } = await params
  const [brand, user] = await Promise.all([getBrandBySlug(slug), getCurrentUser()])
  if (!brand) notFound()

  const supabase = await createClient()

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

      <style>{`
        .bp-hero { display: grid; grid-template-columns: 1fr 340px; border-bottom: 2px solid #0C0C0C; }
        .bp-hero-l { padding: 52px; border-right: 2px solid #0C0C0C; display: flex; flex-direction: column; gap: 28px; }
        .bp-hero-r { background: #1A1A1A; color: #F4F1EC; padding: 40px 36px; display: flex; flex-direction: column; gap: 24px; }
        .bp-market-row { display: flex; align-items: center; gap: 24px; padding: 0 40px; height: 72px; border-bottom: 1px solid rgba(12,12,12,0.15); text-decoration: none; color: inherit; transition: background .12s; }
        .bp-market-row:last-child { border-bottom: none; }
        .bp-market-row:hover { background: var(--paper); }
        .bp-market-row:hover .bp-arrow { color: var(--red) !important; }
        .bp-members { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .bp-member { padding: 32px 40px; border-right: 1px solid rgba(12,12,12,0.15); display: flex; gap: 20px; align-items: flex-start; }
        .bp-member:last-child { border-right: none; }
        @media (max-width: 860px) {
          .bp-hero { grid-template-columns: 1fr; }
          .bp-hero-l { border-right: none; border-bottom: 2px solid #0C0C0C; padding: 32px 24px; }
          .bp-hero-r { padding: 28px 24px; }
          .bp-market-row { padding: 0 24px; gap: 16px; }
          .bp-member { padding: 24px; }
        }
        @media (hover: none) { .lightbox-arrow { display: none !important; } }
      `}</style>

      <main style={{ background: 'var(--white)', minHeight: '100dvh' }}>

        {/* ── Breadcrumb ── */}
        <div style={{ height: '42px', display: 'flex', alignItems: 'center', padding: '0 40px', borderBottom: '1px solid rgba(12,12,12,0.15)', background: 'var(--paper)' }}>
          <Link href="/brands" className="dh-back">← ALL BRANDS</Link>
        </div>

        {/* ── Hero ── */}
        <div className="bp-hero">

          {/* Left */}
          <div className="bp-hero-l">

            {isLive && (
              <div className="badge-live" style={{ width: 'fit-content' }}>
                LIVE NOW{brand.live_market_name ? ` · ${brand.live_market_name.toUpperCase()}` : ''}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
              <div style={{ width: '88px', height: '88px', flexShrink: 0, border: '2px solid #0C0C0C', background: 'var(--paper)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fh)', fontWeight: 900, fontSize: '26px', color: 'var(--stone)' }}>
                {brand.avatar_url
                  ? <img src={brand.avatar_url} alt={brand.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : brand.display_name.slice(0, 2).toUpperCase()
                }
              </div>
              <div style={{ flex: 1, paddingBottom: '4px' }}>
                <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(48px,6vw,82px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: 'var(--ink)', marginBottom: '12px' }}>
                  {brand.display_name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {brand.is_verified && <span className="badge-pro">✦ PRO MAKER</span>}
                  {category && (
                    <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--stone)' }}>
                      {category.split(',').map((c: string) => c.trim()).join(' · ')}
                    </span>
                  )}
                  {priceRange && (
                    <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', color: 'var(--red)', letterSpacing: '0.1em' }}>{priceRange}</span>
                  )}
                </div>
              </div>
            </div>

            {brand.bio && (
              <p style={{ fontFamily: 'var(--fb)', fontWeight: 300, fontSize: '15px', color: 'var(--ash)', lineHeight: 1.75, maxWidth: '540px' }}>
                {brand.bio}
              </p>
            )}

            {hasOffer && !initialSaved && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--red)', textTransform: 'uppercase', border: '1px solid rgba(232,0,28,0.3)', padding: '9px 16px', width: 'fit-content' }}>
                ✦ SAVE TO UNLOCK EXCLUSIVE OFFER
              </div>
            )}
          </div>

          {/* Right — dark sidebar */}
          <div className="bp-hero-r">

            <SaveBrandButton
              brandId={brand.id}
              brandName={brand.display_name}
              initialSaved={initialSaved}
              userId={user?.id ?? null}
              digitalOffer={hasOffer ? brand.digital_offer : null}
            />

            <div className="dh-divider" />

            {brand.instagram_handle && (
              <div>
                <div className="dh-sidebar-label">INSTAGRAM</div>
                <InstagramTapTracker brandId={brand.id} handle={brand.instagram_handle} marketId={null}>
                  <a href={`https://instagram.com/${brand.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="dh-sidebar-val" style={{ display: 'block', color: '#F4F1EC' }}>
                    {brand.instagram_handle} ↗
                  </a>
                </InstagramTapTracker>
              </div>
            )}

            {brand.shop_url && (
              <div>
                <div className="dh-sidebar-label">ONLINE SHOP</div>
                <a href={brand.shop_url} target="_blank" rel="noopener noreferrer" className="dh-sidebar-val" style={{ display: 'block', color: '#F4F1EC' }}>
                  VISIT SHOP ↗
                </a>
              </div>
            )}

            {brand.whatsapp && (
              <div>
                <div className="dh-sidebar-label">WHATSAPP</div>
                <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="dh-sidebar-val" style={{ display: 'block', color: '#F4F1EC' }}>
                  SEND MESSAGE ↗
                </a>
              </div>
            )}

            {hasOffer && initialSaved && (
              <>
                <div className="dh-divider" />
                <div style={{ background: 'rgba(232,0,28,0.1)', border: '1px solid rgba(232,0,28,0.25)', padding: '16px' }}>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '0.22em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: '8px' }}>✦ YOUR EXCLUSIVE OFFER</div>
                  <div style={{ fontFamily: 'var(--fb)', fontSize: '15px', color: '#F4F1EC', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '10px' }}>{brand.digital_offer}</div>
                  <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', color: 'rgba(244,241,236,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>SHOW THIS AT THE STALL</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Photo Gallery ── */}
        {photos.length > 0 && (
          <div style={{ borderBottom: '2px solid #0C0C0C' }}>
            <div className="section-rule">
              <span className="section-rule-title">THE WORK</span>
              <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--stone)', textTransform: 'uppercase' }}>{photos.length} PHOTO{photos.length !== 1 ? 'S' : ''}</span>
            </div>
            <BrandGallery photos={photos} />
          </div>
        )}

        {/* ── Team Members ── */}
        {members.length > 0 && (
          <div style={{ borderBottom: '2px solid #0C0C0C' }}>
            <div className="section-rule">
              <span className="section-rule-title">THE PEOPLE</span>
            </div>
            <div className="bp-members">
              {members.map((m) => (
                <div key={m.id} className="bp-member">
                  {m.photo_url && (
                    <div style={{ width: '60px', height: '60px', flexShrink: 0, border: '2px solid #0C0C0C', overflow: 'hidden' }}>
                      <img src={m.photo_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: 'var(--fh)', fontWeight: 700, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1 }}>{m.name}</div>
                    {m.role && <div style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--red)', marginTop: '5px' }}>{m.role}</div>}
                    {m.bio && <div style={{ fontFamily: 'var(--fb)', fontWeight: 300, fontSize: '14px', color: 'var(--ash)', lineHeight: 1.65, marginTop: '10px' }}>{m.bio}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WHERE TO FIND ME ── */}
        {brand.upcoming_markets.length > 0 && (
          <div style={{ borderBottom: '2px solid #0C0C0C' }}>
            <div className="section-rule">
              <span className="section-rule-title">WHERE TO FIND ME</span>
              <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--stone)', textTransform: 'uppercase' }}>{brand.upcoming_markets.length} UPCOMING</span>
            </div>
            {brand.upcoming_markets.map((market) => {
              const d = new Date(market.event_date + 'T12:00:00')
              return (
                <Link key={market.market_id} href={`/markets/${market.market_id}`} className="bp-market-row">
                  <div style={{ flexShrink: 0, width: '52px' }}>
                    <div className="mrd-day">{d.getDate()}</div>
                    <div className="mrd-dow">{d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="mkt-row-name">{market.market_title}</div>
                    <div className="mkt-row-loc">{market.space_name}{market.space_address ? ` · ${market.space_address}` : ''} · {market.starts_at?.slice(0, 5)}</div>
                  </div>
                  <span className="bp-arrow mkt-row-arr" style={{ opacity: 0.2 }}>→</span>
                </Link>
              )
            })}
          </div>
        )}

        <div className="wam-nav-spacer" />
      </main>
    </>
  )
}
