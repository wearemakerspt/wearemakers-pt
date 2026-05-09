'use client'
import { useState, useRef } from 'react'

interface Photo {
  id: string
  photo_url: string
  caption: string | null
}

interface Props {
  photos: Photo[]
  brandName: string
  category: string | null
  priceRange: string | null
  isLive: boolean
}

export default function BrandHeroCarousel({ photos, brandName, category, priceRange, isLive }: Props) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)

  if (photos.length === 0) return null

  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length)
  const next = () => setCurrent(i => (i + 1) % photos.length)

  return (
    <div
      className="bp-mobile-hero"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchStartX.current === null) return
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 40) { diff > 0 ? next() : prev() }
        touchStartX.current = null
      }}
    >
      {/* Images */}
      {photos.map((photo, i) => (
        <img
          key={photo.id}
          src={photo.photo_url}
          alt={photo.caption ?? brandName}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: i === current ? 0.9 : 0,
            transition: 'opacity .35s ease',
          }}
        />
      ))}

      {/* Gradient */}
      <div className="bp-mobile-hero-overlay" />

      {/* Content */}
      <div className="bp-mobile-hero-content">
        {isLive && (
          <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a5c30', background: 'rgba(26,92,48,0.15)', border: '1px solid #1a5c30', padding: '3px 10px', display: 'inline-block', marginBottom: '8px' }}>
            ● LIVE NOW
          </div>
        )}
        <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(36px,10vw,56px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.9, color: '#F4F1EC', marginBottom: '6px' }}>
          {brandName}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {category && <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.6)' }}>{category.split(',')[0].trim()}</span>}
          {priceRange && <span style={{ fontFamily: 'var(--fm)', fontSize: '9px', color: '#E8001C', letterSpacing: '0.1em' }}>{priceRange}</span>}
        </div>

        {/* Dot indicators */}
        {photos.length > 1 && (
          <div style={{ display: 'flex', gap: '5px', marginTop: '14px' }}>
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? '18px' : '5px',
                  height: '5px',
                  borderRadius: '3px',
                  background: i === current ? '#E8001C' : 'rgba(244,241,236,0.4)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all .2s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
