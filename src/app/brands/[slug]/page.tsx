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

const GEM_ICONS: Record<string, string> = {
  coffee: '☕', food: '🍽', drinks: '🍷', studio: '◆', shop: '◈'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const [brand, user] = await Promise.all([getBrandBySlug(slug), getCurrentUser()])
  if (!brand) notFound()

  const supabase = await createClient()

  // Fetch gallery photos and team members in parallel
  const [photosRes, membersRes] = await Promise.all([
    supabase.from('brand_photos').select('id, photo_url, caption, sort_order').eq('brand_id', brand.id).order('sort_order'),
    supabase.from('brand_members').select('id, name, role, photo_url, bio, sort_order').eq('brand_id', brand.id).order('sort_order'),
  ])

  const photos = photosRes.data ?? []
  const members = membersRes.data ?? []

  const { headers } = await import('next/headers')
  const acceptLang = (await headers()).get('accept-language') ?? ''
  const lang = (['pt', 'en', 'es', 'de', 'fr', 'it'].find(l =>
    acceptLang.toLowerCase().includes(l)
  )) ?? 'pt'

  const bio_i18n = brand.bio_i18n as any
  const localeBio = lang !== 'pt' && bio_i18n?.[lang] ? bio_i18n[lang] : brand.bio

  let initialSaved = false
  if (user) {
    try {
      const { data } = await supabase
        .from('saved_brands').select('id')
        .eq('visitor_id', user.id).eq('brand_id', brand.id).maybeSingle()
      initialSaved = !!data
    } catch { }
  }

  const offerActive = bio_i18n?._offer_active !== false
  const activeOffer = brand.digital_offer && offerActive ? brand.digital_offer : null
  const liveMarketId = brand.is_live ? (brand as any).live_market_id ?? null : null
  const featuredPhoto = (brand as any).featured_photo_url ?? null

  return (
    <>
      <SiteHeader user={user} liveCount={brand.is_live ? 1 : 0} />
      <BrandViewTracker brandId={brand.id} marketId={liveMarketId} visitorId={user?.id ?? null} />

      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

        {/* Featured photo hero — if set */}
        {featuredPhoto && (
          <div style={{ width: '100%', height: 'clamp(200px, 40vw, 360px)', overflow: 'hidden', borderBottom: '3px solid #181614' }}>
            <img src={featuredPhoto} alt={brand.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Dark brand header */}
        <div style={{ background: '#181614', padding: '20px 16px', borderBottom: '3px solid #181614' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '10px' }}>
            BRAND MANIFESTO · WEAREMAKERS.PT
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(40px,12vw,72px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: '#f0ece0' }}>
              {brand.display_name}
            </div>
            {brand.is_live && <span className="badge-live">{brand.live_market_name}</span>}
            {brand.is_verified && <span className="badge-pro">✦ PRO</span>}
          </div>
          {brand.instagram_handle && (
            <InstagramTapTracker brandId={brand.id} handle={brand.instagram_handle} marketId={liveMarketId} visitorId={user?.id ?? null}
              style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', color: '#c8291a', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {brand.instagram_handle}
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', opacity: 0.6 }}>↗</span>
            </InstagramTapTracker>
          )}
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <SaveBrandButton brandId={brand.id} brandName={brand.display_name} initialSaved={initialSaved} userId={user?.id ?? null} size="lg" dark={true} digitalOffer={activeOffer} />
            {activeOffer && !initialSaved && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,236,224,.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#c8291a' }}>✦</span> SAVE TO UNLOCK OFFER
              </div>
            )}
          </div>
        </div>

        {/* Categories + price range */}
        {(bio_i18n?._category || bio_i18n?._price_range) && (
          <div style={{ padding: '10px 16px', borderBottom: '3px solid #181614', background: '#e6e0d0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {bio_i18n?._category && bio_i18n._category.split(',').map((cat: string) => cat.trim()).filter(Boolean).map((cat: string) => (
              <span key={cat} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', border: '2px solid #181614', color: '#181614', background: '#f0ece0' }}>{cat}</span>
            ))}
            {bio_i18n?._price_range && (
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', border: '2px solid #c8291a', color: '#c8291a', background: 'rgba(200,41,26,.06)' }}>{bio_i18n._price_range}</span>
            )}
          </div>
        )}

        {/* Bio */}
        {localeBio && (
          <div style={{ padding: '20px 16px', borderBottom: '3px solid #181614' }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', color: '#181614', lineHeight: 1.75, marginBottom: 0 }}>{localeBio}</p>
          </div>
        )}

        {/* Active offer */}
        {activeOffer && (
          <div style={{ padding: '16px', borderBottom: '3px solid #181614', background: '#181614' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                ✦ {brand.is_live ? "TODAY'S OFFER" : 'CURRENT OFFER'}
              </div>
              {brand.is_live && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#1a5c30', color: '#fff', padding: '2px 6px' }}>LIVE NOW</span>}
            </div>
            <div style={{ padding: '20px', background: 'rgba(240,236,224,.04)', border: '2px dashed rgba(240,236,224,.12)', textAlign: 'center', marginBottom: '10px' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(20px,5vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#f0ece0', lineHeight: 1.2 }}>{activeOffer}</div>
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,.3)', lineHeight: 1.6 }}>
              Save this brand to your Circuit — offer unlocks automatically.
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              THE WORK · {photos.length} PHOTOS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
              {photos.map((photo, i) => (
                <div key={photo.id} style={{ aspectRatio: '1', overflow: 'hidden', borderRight: i % 3 !== 2 ? '2px solid #181614' : 'none', borderBottom: '2px solid #181614', position: 'relative' as const }}>
                  <img src={photo.photo_url} alt={photo.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {photo.caption && (
                    <div style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, background: 'rgba(24,22,20,.75)', fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: 'rgba(240,236,224,.8)', padding: '4px 8px', letterSpacing: '0.08em' }}>
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meet the team */}
        {members.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              THE PEOPLE
            </div>
            {members.map((member, i) => (
              <div key={member.id} style={{ display: 'flex', gap: '14px', padding: '16px', borderBottom: '2px solid rgba(24,22,20,.1)', background: i % 2 === 0 ? '#f0ece0' : '#e6e0d0', alignItems: 'flex-start' }}>
                <div style={{ width: '56px', height: '56px', flexShrink: 0, border: '2px solid #181614', overflow: 'hidden', background: 'rgba(24,22,20,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {member.photo_url
                    ? <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '22px', color: 'rgba(24,22,20,.2)' }}>{member.name.slice(0, 1).toUpperCase()}</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1, marginBottom: '3px' }}>{member.name}</div>
                  {member.role && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c8291a', marginBottom: '4px' }}>{member.role}</div>}
                  {member.bio && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: 'rgba(24,22,20,.55)', lineHeight: 1.5 }}>{member.bio}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Where to find me */}
        {brand.upcoming_markets.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', background: '#181614' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              <span style={{ color: '#f0ece0' }}>WHERE TO FIND ME</span>
            </div>
            {brand.upcoming_markets.map((um, i) => (
              <div key={um.market_id} style={{ borderBottom: '2px solid #181614', padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'center', background: i % 2 === 0 ? '#f0ece0' : '#e6e0d0' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: '13px', color: '#181614', flexShrink: 0, width: '72px', lineHeight: 1.3 }}>{formatDate(um.event_date)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614' }}>{um.market_title}</div>
                  {um.space_address && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(24,22,20,.38)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' }}>{um.space_address}</div>}
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: i === 0 ? '#1a5c30' : 'rgba(24,22,20,.4)' }}>{i === 0 ? 'CONFIRMED' : 'TENTATIVE'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Hidden Gems */}
        {brand.gems && brand.gems.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} /> HIDDEN GEMS
            </div>
            {brand.gems.map((g: any) => (
              <div key={g.id} style={{ borderBottom: '2px solid #181614', display: 'flex', gap: 0, minHeight: '64px' }}>
                <div style={{ width: '52px', flexShrink: 0, background: '#181614', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', borderRight: '2px solid #181614' }}>{GEM_ICONS[g.category] ?? '◈'}</div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', marginBottom: '3px' }}>{g.name}</div>
                  {g.description && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', color: 'rgba(24,22,20,.5)', fontStyle: 'italic', lineHeight: 1.4 }}>{g.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instagram action */}
        <div style={{ padding: '16px', borderTop: '3px solid #181614', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {brand.instagram_handle && (
            <InstagramTapTracker brandId={brand.id} handle={brand.instagram_handle} marketId={liveMarketId} visitorId={user?.id ?? null}
              style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#c8291a', color: '#fff', border: '3px solid #c8291a', padding: '12px 20px', textDecoration: 'none', display: 'inline-block' }}>
              INSTAGRAM →
            </InstagramTapTracker>
          )}
        </div>

        {/* Back */}
        <div style={{ padding: '12px 16px', borderTop: '3px solid #181614' }}>
          <Link href="/brands" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>← ALL BRANDS</Link>
        </div>
      </main>
    </>
  )
}
