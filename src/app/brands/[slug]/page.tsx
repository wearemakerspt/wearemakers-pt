import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getBrandBySlug } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import SaveBrandButton from '@/components/ui/SaveBrandButton'

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

  // Check if visitor has saved this brand
  let initialSaved = false
  if (user && brand) {
    const { createClient: createServer } = await import('@/lib/supabase/server')
    const supabase = await createServer()
    const { data } = await supabase
      .from('saved_brands')
      .select('id')
      .eq('visitor_id', user.id)
      .eq('brand_id', brand.id)
      .single()
    initialSaved = !!data
  }
  if (!brand) notFound()

  const initials = brand.display_name.slice(0, 2).toUpperCase()

  return (
    <>
      <SiteHeader user={user} liveCount={brand.is_live ? 1 : 0} />
      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

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
            <a
              href={`https://instagram.com/${brand.instagram_handle.replace('@','')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', color: '#c8291a', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {brand.instagram_handle}
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', opacity: 0.6 }}>↗</span>
            </a>
          )}
          {/* Save to Circuit */}
          <div style={{ marginTop: '12px' }}>
            <SaveBrandButton
              brandId={brand.id}
              brandName={brand.display_name}
              initialSaved={initialSaved}
              userId={user?.id ?? null}
              size="lg"
            />
          </div>
        </div>

        {/* Categories + price range strip */}
        {((brand.bio_i18n as any)?._category || (brand.bio_i18n as any)?._price_range) && (
          <div style={{ padding: '10px 16px', borderBottom: '3px solid #181614', background: '#e6e0d0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {(brand.bio_i18n as any)?._category && (
              (brand.bio_i18n as any)._category.split(',').map((cat: string) => cat.trim()).filter(Boolean).map((cat: string) => (
                <span key={cat} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', border: '2px solid #181614', color: '#181614', background: '#f0ece0' }}>
                  {cat}
                </span>
              ))
            )}
            {(brand.bio_i18n as any)?._price_range && (
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', border: '2px solid #c8291a', color: '#c8291a', background: 'rgba(200,41,26,.06)' }}>
                {(brand.bio_i18n as any)._price_range}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        <div style={{ padding: '20px 16px', borderBottom: '3px solid #181614' }}>
          {brand.bio && (
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '18px', color: '#181614', lineHeight: 1.75, marginBottom: 0 }}>
              {brand.bio}
            </p>
          )}
        </div>

        {/* Active offer — show if offer exists and not explicitly deactivated */}
        {brand.digital_offer && (brand.bio_i18n as any)?._offer_active !== false && (
          <div style={{ padding: '16px', borderBottom: '3px solid #181614', background: '#e6e0d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                ✦ {brand.is_live ? "TODAY'S OFFER" : 'CURRENT OFFER'}
              </div>
              {brand.is_live && (
                <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#1a5c30', color: '#fff', padding: '2px 6px' }}>
                  LIVE NOW
                </span>
              )}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '17px', color: '#181614', lineHeight: 1.6, fontStyle: 'italic' }}>
              {brand.digital_offer}
            </div>
          </div>
        )}

        {/* Where to find me */}
        {brand.upcoming_markets.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px', background: '#181614' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              <span style={{ color: '#f0ece0' }}>WHERE TO FIND ME</span>
            </div>
            {brand.upcoming_markets.map((um, i) => (
              <div key={um.market_id} style={{ borderBottom: '2px solid #181614', padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'center', background: i % 2 === 0 ? '#f0ece0' : '#e6e0d0' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: '13px', color: '#181614', flexShrink: 0, width: '72px', lineHeight: 1.3 }}>
                  {formatDate(um.event_date)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614' }}>
                    {um.market_title}
                  </div>
                  {um.space_address && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(24,22,20,.38)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' }}>
                      {um.space_address}
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: i === 0 ? '#1a5c30' : 'rgba(24,22,20,.4)' }}>
                  {i === 0 ? 'CONFIRMED' : 'TENTATIVE'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hidden Gems */}
        {brand.gems.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              HIDDEN GEMS
            </div>
            {brand.gems.map(g => (
              <div key={g.id} style={{ borderBottom: '2px solid #181614', display: 'flex', gap: 0, minHeight: '64px' }}>
                <div style={{ width: '52px', flexShrink: 0, background: '#181614', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', borderRight: '2px solid #181614' }}>
                  {GEM_ICONS[g.category] ?? '◈'}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', marginBottom: '3px' }}>
                    {g.name}
                  </div>
                  {g.description && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', color: 'rgba(24,22,20,.5)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {g.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save / Instagram actions */}
        <div style={{ padding: '16px', borderTop: '3px solid #181614', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {brand.instagram_handle && (
            <a
              href={`https://instagram.com/${brand.instagram_handle.replace('@','')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#c8291a', color: '#fff', border: '3px solid #c8291a', padding: '12px 20px', textDecoration: 'none', display: 'inline-block' }}
            >
              INSTAGRAM →
            </a>
          )}
          <Link
            href="/auth/register"
            style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#f0ece0', color: '#181614', border: '3px solid #181614', padding: '12px 20px', textDecoration: 'none', display: 'inline-block' }}
          >
            + SAVE BRAND
          </Link>
        </div>

        {/* Back */}
        <div style={{ padding: '12px 16px', borderTop: '3px solid #181614' }}>
          <Link href="/brands" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← ALL BRANDS
          </Link>
        </div>
      </main>
    </>
  )
}
