import Link from 'next/link'
import type { BrandSummary } from '@/lib/queries/brands'

interface Props {
  brand: BrandSummary
  view?: 'grid' | 'list'
}

export default function BrandCard({ brand: b, view = 'list' }: Props) {
  const initials = b.display_name.slice(0, 2).toUpperCase()

  if (view === 'grid') {
    return (
      <Link
        href={`/brands/${b.slug ?? b.id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div
          style={{
            background: '#181614',
            borderRight: '2px solid #181614',
            borderBottom: '2px solid #181614',
            cursor: 'pointer',
          }}
        >
          {/* Image square */}
          <div style={{ aspectRatio: '1', background: '#181614', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '7px', overflow: 'hidden' }}>
            {b.is_live && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#1a5c30', color: '#fff', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '7px' }}>●</span> LIVE
              </div>
            )}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(18px,5vw,26px)', color: 'rgba(240,236,224,.15)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
              {initials}
            </div>
            {b.avatar_url && (
              <img src={b.avatar_url} alt={b.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          {/* Info */}
          <div style={{ background: '#f0ece0', padding: '8px 9px', borderTop: '2px solid #181614' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(14px,3.5vw,18px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {b.display_name}
            </div>
            {b.is_verified && (
              <span className="badge-pro" style={{ fontSize: '9px', marginBottom: '2px', display: 'inline-block' }}>✦ PRO</span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // List view
  return (
    <Link
      href={`/brands/${b.slug ?? b.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        className="transition-colors hover:bg-parchment-2"
        style={{ borderBottom: '3px solid #181614', padding: '14px', display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#f0ece0', cursor: 'pointer', position: 'relative' }}
      >
        {/* Avatar */}
        <div style={{ width: '56px', height: '56px', flexShrink: 0, background: '#181614', border: '3px solid #181614', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', color: '#c8291a', position: 'relative', overflow: 'hidden' }}>
          {b.avatar_url
            ? <img src={b.avatar_url} alt={b.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </div>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1 }}>
              {b.display_name}
            </div>
            {b.is_live && <span className="badge-live">{b.live_market_name}</span>}
            {b.is_verified && <span className="badge-pro">✦ PRO</span>}
          </div>

          {b.bio && (
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '15px', color: 'rgba(24,22,20,.5)', lineHeight: 1.5, marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {b.bio}
            </div>
          )}

          {b.instagram_handle && (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '13px', color: '#c8291a', letterSpacing: '0.06em' }}>
              {b.instagram_handle}
            </div>
          )}
        </div>

        {/* Live arrow */}
        {b.is_live && (
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '14px', color: '#c8291a', flexShrink: 0, alignSelf: 'center' }}>→</div>
        )}
      </div>
    </Link>
  )
}
