import Link from 'next/link'

interface Brand {
  id: string
  display_name: string
  slug: string | null
  bio: string | null
  bio_i18n: any
  avatar_url: string | null
  featured_photo_url?: string | null
  is_verified: boolean
  is_live: boolean
  live_market_name?: string | null
  instagram_handle?: string | null
}

interface Props {
  brand: Brand
  view?: 'grid' | 'list'
}

const INK = '#1A1A1A'
const RED = '#E8001C'
const WHITE = '#F4F1EC'
const PAPER = '#EDE9E2'
const STONE = '#6B6560'
const GREEN = '#1a5c30'
const B = '2px solid #0C0C0C'
const Bsm = '1px solid rgba(12,12,12,0.15)'

export default function BrandCard({ brand, view = 'grid' }: Props) {
  const href = `/brands/${brand.slug ?? brand.id}`
  const bio_i18n = brand.bio_i18n as any
  const category = bio_i18n?._category?.split(',')[0]?.trim() ?? null
  const priceRange = bio_i18n?._price_range ?? null
  const cardImage = brand.featured_photo_url ?? brand.avatar_url ?? null
  const initials = brand.display_name.slice(0, 2).toUpperCase()

  if (view === 'grid') {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block', borderRight: Bsm, borderBottom: Bsm, background: brand.is_live ? 'rgba(232,0,28,.02)' : WHITE, position: 'relative' as const, overflow: 'hidden', transition: 'background .15s' }}
      className="brand-card-grid">
        {brand.is_live && (
          <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, background: GREEN, fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', padding: '4px 8px', zIndex: 2, textAlign: 'center' }}>
            ● LIVE NOW {brand.live_market_name ? `AT ${brand.live_market_name.toUpperCase()}` : ''}
          </div>
        )}

        {/* Image */}
        <div style={{ aspectRatio: '1', overflow: 'hidden', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
          {cardImage ? (
            <img src={cardImage} alt={brand.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(28px,6vw,48px)', color: 'rgba(12,12,12,0.12)', letterSpacing: '-0.02em' }}>{initials}</span>
          )}
          {brand.is_verified && (
            <div style={{ position: 'absolute' as const, top: brand.is_live ? '26px' : '6px', right: '6px', background: INK, fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: WHITE, padding: '2px 6px' }}>
              ✦ PRO
            </div>
          )}
          {/* Hover arrow */}
          <div style={{ position: 'absolute' as const, top: '12px', right: '12px', fontSize: '14px', color: STONE, opacity: 0, transition: 'opacity .2s', pointerEvents: 'none' }} className="bc-arr">→</div>
        </div>

        {/* Card body */}
        <div style={{ padding: '10px 12px 14px', borderTop: Bsm }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.03em', color: INK, lineHeight: 1, marginBottom: '4px' }}>
            {brand.display_name}
          </div>
          {category && (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: STONE }}>
              {category}
            </div>
          )}
          {priceRange && (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: RED, marginTop: '2px' }}>
              {priceRange}
            </div>
          )}
        </div>
      </Link>
    )
  }

  // List view
  return (
    <Link href={href} className="brand-card-list" style={{ textDecoration: 'none', display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', borderBottom: Bsm, background: brand.is_live ? 'rgba(232,0,28,.02)' : WHITE }}>
      <div style={{ width: '44px', height: '44px', flexShrink: 0, border: B, overflow: 'hidden', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {cardImage
          ? <img src={cardImage} alt={brand.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '16px', color: 'rgba(12,12,12,0.2)' }}>{initials}</span>
        }
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1 }}>{brand.display_name}</div>
        {category && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: STONE, marginTop: '2px' }}>{category}</div>}
      </div>
      {brand.is_live && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', fontWeight: 700, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase' }}>● LIVE</span>}
    </Link>
  )
}
