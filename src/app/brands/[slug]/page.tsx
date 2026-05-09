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
import MapEmbed from '@/components/ui/MapEmbed'

export const dynamic = 'force-dynamic'
interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) return { title: 'Brand Not Found' }

  const bio_i18n = brand.bio_i18n as any
  const category = bio_i18n?._category?.split(',')[0]?.trim() ?? 'Independent Maker'
  const avatar = brand.avatar_url ?? ''
  const ogUrl = `https://wearemakers.pt/api/og?type=brand&title=${encodeURIComponent(brand.display_name)}&sub=${encodeURIComponent(category)}&avatar=${encodeURIComponent(avatar)}`
  const description = brand.bio ?? `${brand.display_name} — independent maker at Lisbon street markets.`

  return {
    title: `${brand.display_name} — WEAREMAKERS.PT`,
    description,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title: brand.display_name,
      description,
      url: `https://wearemakers.pt/brands/${slug}`,
      siteName: 'WEAREMAKERS.PT',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: brand.display_name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: brand.display_name,
      description,
      images: [ogUrl],
    },
  }
}

function BrandJsonLd({ brand }: { brand: any }) {
  const bio_i18n = brand.bio_i18n as any
  const category = bio_i18n?._category?.split(',')[0]?.trim() ?? 'Independent Maker'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brand.display_name,
    description: brand.bio ?? `${brand.display_name} — independent maker at Lisbon street markets.`,
    url: `https://wearemakers.pt/brands/${brand.slug ?? brand.id}`,
    image: brand.avatar_url ?? undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lisbon',
      addressCountry: 'PT',
    },
    sameAs: brand.instagram_handle
      ? [`https://instagram.com/${brand.instagram_handle.replace('@', '')}`]
      : undefined,
    priceRange: bio_i18n?._price_range ?? undefined,
    knowsAbout: category,
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
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
      <BrandJsonLd brand={brand} />
      <SiteHeader user={user} liveCount={isLive ? 1 : 0} />
      <BrandViewTracker brandId={brand.id} marketId={null} />

      <style>{`
        .bp-hero { display: grid; grid-template-columns: 1fr 340px; border-bottom: 2px solid #0C0C0C; }
        .bp-hero-l { padding: 52px; border-right: 1px solid rgba(12,12,12,0.15); display: flex; flex-direction: column; gap: 28px; }
        .bp-hero-r { background: #1A1A1A; color: #F4F1EC; padding: 40px 36px; display: flex; flex-direction: column; gap: 24px; }
        .bp-market-row { display: flex; align-items: center; gap: 24px; padding: 0 40px; height: 72px; border-bottom: 1px solid rgba(12,12,12,0.15); text-decoration: none; color: inherit; transition: background .12s; }
        .bp-market-row:last-child { border-bottom: none; }
        .bp-market-row:hover { background: var(--paper); }
        .bp-market-row:hover .bp-arrow { color: var(--red) !important; }
        .bp-members { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .bp-member { padding: 32px 40px; border-right: 1px solid rgba(12,12,12,0.15); display: flex; gap: 20px; align-items: flex-start; }
        .bp-member:last-child { border-right: none; }
        .bp-mobile-hero { display: none; }
        .bp-mobile-contacts { display: none; }
        .bp-mobile-save { display: none; }
        @media (max-width: 860px) {
          .bp-hero { grid-template-columns: 1fr; }
          .bp-hero-l { border-right: none; border-bottom: 1px solid rgba(12,12,12,0.15); padding: 20px; gap: 12px; }
          .bp-hero-r { display: none !important; }
          .bp-market-row { padding: 0 20px; gap: 12px; }
          .bp-member { padding: 20px; }
          .bp-hero-save { display: none !important; }
          .bp-hero-desktop-name { display: none !important; }
          .bp-hero-desktop-avatar { display: none !important; }
          .bp-mobile-hero { display: block; position: relative; width: 100%; min-height: 88vw; background: #1A1A1A; overflow: hidden; border-bottom: 1px solid rgba(12,12,12,0.15); }
          .bp-mobile-hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.9; }
          .bp-mobile-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 35%, rgba(12,12,12,0.85) 100%); }
          .bp-mobile-hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px 20px; }
          .bp-mobile-contacts { display: grid; grid-template-columns: repeat(3, 1fr); background: #1A1A1A; border-bottom: 1px solid rgba(12,12,12,0.15); }
          .bp-mobile-contact-item { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 12px; gap: 8px; text-decoration: none; border-right: 1px solid rgba(244,241,236,0.08); }
          .bp-mobile-contact-item:last-child { border-right: none; }
          .bp-mobile-contact-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
          .bp-mobile-contact-label { font-family: var(--fm); font-size: 8px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(244,241,236,0.4); text-align: center; }
          .bp-mobile-save { display: block; padding: 20px; border-bottom: 1px solid rgba(12,12,12,0.15); }
        }
        @media (hover: none) { .lightbox-arrow { display: none !important; } }
      `}</style>

      <main style={{ background: 'var(--white)', minHeight: '100dvh' }}>

        {/* ── Breadcrumb ── */}
        <div style={{ height: '44px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '2px solid #0C0C0C', background: '#1A1A1A' }}>
          <Link href="/brands" style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.6)', textDecoration: 'none' }}>← ALL BRANDS</Link>
        </div>

        {/* ── Mobile full-bleed hero ── */}
        <div className="bp-mobile-hero">
          {(brand.featured_photo_url || brand.avatar_url) && (
            <img src={brand.featured_photo_url ?? brand.avatar_url!} alt={brand.display_name} />
          )}
          <div className="bp-mobile-hero-overlay" />
          <div className="bp-mobile-hero-content">
            {isLive && (
              <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a5c30', background: 'rgba(26,92,48,0.15)', border: '1px solid #1a5c30', padding: '3px 10px', display: 'inline-block', marginBottom: '8px' }}>
                ● LIVE NOW
              </div>
            )}
            <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(36px,10vw,56px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.9, color: '#F4F1EC', marginBottom: '6px' }}>
              {brand.display_name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {category && <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.6)' }}>{category.split(',')[0].trim()}</span>}
              {priceRange && <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: 'var(--red)', letterSpacing: '0.1em' }}>{priceRange}</span>}
            </div>
          </div>
        </div>

        {/* ── Mobile contacts + save ── */}
        {(brand.instagram_handle || brand.shop_url || brand.whatsapp) && (
          <div className="bp-mobile-contacts">
            {brand.instagram_handle && (
              <InstagramTapTracker brandId={brand.id} handle={brand.instagram_handle} marketId={null}>
                <a href={`https://instagram.com/${brand.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bp-mobile-contact-item">
                  <div className="bp-mobile-contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="20" height="20" rx="5" stroke="#F4F1EC" strokeWidth="1.5"/>
                      <circle cx="12" cy="12" r="4" stroke="#F4F1EC" strokeWidth="1.5"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="#F4F1EC"/>
                    </svg>
                  </div>
                  <span className="bp-mobile-contact-label">INSTAGRAM</span>
                </a>
              </InstagramTapTracker>
            )}
            {brand.shop_url && (
              <a href={brand.shop_url} target="_blank" rel="noopener noreferrer" className="bp-mobile-contact-item">
                <div className="bp-mobile-contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9h18M3 9l2-5h14l2 5M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M9 13h6" stroke="#F4F1EC" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="bp-mobile-contact-label">SHOP</span>
              </a>
            )}
            {brand.whatsapp && (
              <a href={`https://wa.me/${brand.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="bp-mobile-contact-item">
                <div className="bp-mobile-contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.09-1.35A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke="#F4F1EC" strokeWidth="1.5"/>
                    <path d="M8.5 9.5c.5 1 1.5 2.5 3 3.5s2.5 1.5 3 1.5" stroke="#F4F1EC" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="bp-mobile-contact-label">WHATSAPP</span>
              </a>
            )}
          </div>
        )}

        {/* ── Mobile save button ── */}
        <div className="bp-mobile-save">
          <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--stone)', marginBottom: '10px' }}>
            SAVE TO GET NOTIFIED WHEN THEY GO LIVE
          </div>
          <SaveBrandButton
            brandId={brand.id}
            brandName={brand.display_name}
            initialSaved={initialSaved}
            userId={user?.id ?? null}
            digitalOffer={hasOffer ? brand.digital_offer : null}
            dark={false}
          />
          {hasOffer && !initialSaved && (
            <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--red)', textTransform: 'uppercase', marginTop: '8px' }}>
              ✦ UNLOCK EXCLUSIVE OFFER ON SAVE
            </div>
          )}
          {hasOffer && initialSaved && (
            <div style={{ marginTop: '12px', background: 'rgba(232,0,28,0.06)', border: '1px solid rgba(232,0,28,0.2)', padding: '14px' }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '0.22em', color: 'var(--red)', textTransform: 'uppercase', marginBottom: '6px' }}>✦ YOUR EXCLUSIVE OFFER</div>
              <div style={{ fontFamily: 'var(--fb)', fontSize: '15px', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '8px' }}>{brand.digital_offer}</div>
              <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', color: 'var(--stone)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>SHOW THIS AT THE STALL</div>
            </div>
          )}
        </div>

        {/* ── Hero — desktop two-column ── */}
        <div className="bp-hero">

          {/* Left */}
          <div className="bp-hero-l">

            {isLive && (
              <div className="badge-live" style={{ width: 'fit-content' }}>
                LIVE NOW{brand.live_market_name ? ` · ${brand.live_market_name.toUpperCase()}` : ''}
              </div>
            )}

            <div className="bp-hero-desktop-name" style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
              <div className="bp-hero-desktop-avatar" style={{ width: '88px', height: '88px', flexShrink: 0, border: '1px solid rgba(12,12,12,0.15)', background: 'var(--paper)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--fh)', fontWeight: 900, fontSize: '26px', color: 'var(--stone)' }}>
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

            {/* Save button — hidden on mobile (shown in dark sidebar below) */}
            <div className="bp-hero-save" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <SaveBrandButton
                brandId={brand.id}
                brandName={brand.display_name}
                initialSaved={initialSaved}
                userId={user?.id ?? null}
                digitalOffer={hasOffer ? brand.digital_offer : null}
                size="lg"
              />
              {hasOffer && !initialSaved && (
                <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--red)', textTransform: 'uppercase' }}>
                  ✦ SAVE TO UNLOCK EXCLUSIVE OFFER
                </span>
              )}
            </div>
          </div>

          {/* Right — dark sidebar */}
          <div className="bp-hero-r">

            <SaveBrandButton
              brandId={brand.id}
              brandName={brand.display_name}
              initialSaved={initialSaved}
              userId={user?.id ?? null}
              digitalOffer={hasOffer ? brand.digital_offer : null}
              dark={true}
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
          <div style={{ borderBottom: '1px solid rgba(12,12,12,0.15)' }}>
            <BrandGallery photos={photos} />
          </div>
        )}

        {/* ── Team Members ── */}
        {members.length > 0 && (
          <div style={{ borderBottom: '1px solid rgba(12,12,12,0.15)' }}>
            <div className="section-rule">
              <span className="section-rule-title">THE PEOPLE</span>
            </div>
            <div className="bp-members">
              {members.map((m) => (
                <div key={m.id} className="bp-member">
                  {m.photo_url && (
                    <div style={{ width: '60px', height: '60px', flexShrink: 0, border: '1px solid rgba(12,12,12,0.15)', overflow: 'hidden' }}>
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
          <div style={{ borderBottom: '1px solid rgba(12,12,12,0.15)' }}>
            <div className="section-rule">
              <span className="section-rule-title">WHERE TO FIND ME</span>
              <span style={{ fontFamily: 'var(--fm)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--stone)', textTransform: 'uppercase' }}>{brand.upcoming_markets.length} UPCOMING</span>
            </div>
            {/* Map of next upcoming market location */}
            {brand.upcoming_markets[0]?.space_lat && brand.upcoming_markets[0]?.space_lng && (
              <MapEmbed
                lat={brand.upcoming_markets[0].space_lat}
                lng={brand.upcoming_markets[0].space_lng}
                label={brand.upcoming_markets[0].space_name}
                address={brand.upcoming_markets[0].space_address}
                height={220}
              />
            )}
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
