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

export default function BrandCard({ brand, view = 'grid' }: Props) {
  const href = `/brands/${brand.slug ?? brand.id}`
  const bio_i18n = brand.bio_i18n as any
  const category = bio_i18n?._category?.split(',')[0]?.trim() ?? null

  // Featured photo takes priority over avatar for the card image
  const cardImage = brand.featured_photo_url ?? brand.avatar_url ?? null
  const initials = brand.display_name.slice(0, 2).toUpperCase()

  if (view === 'grid') {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block', borderRight: '2px solid #181614', borderBottom: '2px solid #181614', background: brand.is_live ? 'rgba(200,41,26,.03)' : '#f0ece0', position: 'relative' as const, overflow: 'hidden' }}>

        {/* Live indicator bar */}
        {brand.is_live && (
          <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, background: '#1a5c30', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', padding: '3px 8px', zIndex: 2, textAlign: 'center' }}>
            ● LIVE NOW {brand.live_market_name ? `AT ${brand.live_market_name.toUpperCase()}` : ''}
          </div>
        )}

        {/* Card image — featured photo or avatar or initials placeholder */}
        <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#e6e0d0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
          {cardImage ? (
            <img
              src={cardImage}
              alt={brand.display_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(28px,6vw,48px)', color: 'rgba(24,22,20,.15)', letterSpacing: '-0.02em' }}>
              {initials}
            </span>
          )}

          {/* PRO badge overlay */}
          {brand.is_verified && (
            <div style={{ position: 'absolute' as const, top: brand.is_live ? '22px' : '6px', right: '6px', background: '#181614', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f0ece0', padding: '2px 5px' }}>
              ✦ PRO
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '10px 10px 12px', borderTop: '2px solid #181614' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(16px,3.5vw,22px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1, marginBottom: '4px' }}>
            {brand.display_name}
          </div>
          {category && (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', lineHeight: 1.3 }}>
              {category}
            </div>
          )}
        </div>
      </Link>
    )
  }

  // List view
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 14px', borderBottom: '2px solid rgba(24,22,20,.1)', background: brand.is_live ? 'rgba(200,41,26,.03)' : '#f0ece0' }}>
      <div style={{ width: '44px', height: '44px', flexShrink: 0, border: '2px solid #181614', overflow: 'hidden', background: '#e6e0d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {cardImage
          ? <img src={cardImage} alt={brand.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '16px', color: 'rgba(24,22,20,.2)' }}>{initials}</span>
        }
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1 }}>{brand.display_name}</div>
        {category && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)' }}>{category}</div>}
      </div>
      {brand.is_live && <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '8px', fontWeight: 700, color: '#1a5c30', letterSpacing: '0.1em', textTransform: 'uppercase' }}>● LIVE</span>}
    </Link>
  )
}
