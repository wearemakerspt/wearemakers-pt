'use client'
import { useState, useEffect, useCallback } from 'react'

interface Photo {
  id: string
  photo_url: string
  caption: string | null
}

interface Props {
  photos: Photo[]
}

export default function BrandGallery({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = useCallback(() => setLightboxIndex(null), [])

  const prev = useCallback(() => {
    setLightboxIndex(i => i === null ? null : (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  const next = useCallback(() => {
    setLightboxIndex(i => i === null ? null : (i + 1) % photos.length)
  }, [photos.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, prev, next, close])

  // Prevent body scroll when lightbox open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightboxIndex])

  const TAG = { fontFamily: "'Share Tech Mono',monospace", letterSpacing: '0.12em', textTransform: 'uppercase' as const }

  return (
    <>
      {/* Section header */}
      <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
        THE WORK · {photos.length} PHOTO{photos.length !== 1 ? 'S' : ''}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(i)}
            style={{
              aspectRatio: '1', overflow: 'hidden', padding: 0, border: 'none',
              borderRight: i % 3 !== 2 ? '2px solid #181614' : 'none',
              borderBottom: '2px solid #181614',
              position: 'relative' as const, cursor: 'zoom-in',
              background: '#e6e0d0', display: 'block',
            }}
          >
            <img
              src={photo.photo_url}
              alt={photo.caption ?? ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
            {photo.caption && (
              <div style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, background: 'rgba(24,22,20,.75)', fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: 'rgba(240,236,224,.8)', padding: '4px 8px', letterSpacing: '0.08em' }}>
                {photo.caption}
              </div>
            )}
            {/* Hover overlay */}
            <div style={{ position: 'absolute' as const, inset: 0, background: 'rgba(24,22,20,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(24,22,20,.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(24,22,20,0)')}
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(18,16,14,.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={close}
        >
          {/* Close button */}
          <button
            onClick={close}
            style={{ position: 'absolute' as const, top: '16px', right: '20px', background: 'none', border: 'none', color: 'rgba(240,236,224,.5)', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', padding: '8px', zIndex: 1 }}
          >
            CLOSE ✕
          </button>

          {/* Counter */}
          <div style={{ position: 'absolute' as const, top: '18px', left: '20px', ...TAG, fontSize: '10px', color: 'rgba(240,236,224,.35)' }}>
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Prev arrow */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              style={{ position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(240,236,224,.08)', border: '2px solid rgba(240,236,224,.15)', color: '#f0ece0', fontFamily: "'Share Tech Mono',monospace", fontSize: '18px', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
            >
              ←
            </button>
          )}

          {/* Image */}
          <div
            style={{ maxWidth: 'min(90vw, 900px)', maxHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].photo_url}
              alt={photos[lightboxIndex].caption ?? ''}
              style={{ maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain', display: 'block', border: '2px solid rgba(240,236,224,.1)' }}
            />
            {photos[lightboxIndex].caption && (
              <div style={{ ...TAG, fontSize: '10px', color: 'rgba(240,236,224,.4)', textAlign: 'center' as const }}>
                {photos[lightboxIndex].caption}
              </div>
            )}

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%', padding: '4px 0' }}>
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setLightboxIndex(i)}
                    style={{ width: '48px', height: '48px', flexShrink: 0, padding: 0, border: `2px solid ${i === lightboxIndex ? '#c8291a' : 'rgba(240,236,224,.15)'}`, cursor: 'pointer', overflow: 'hidden', background: 'transparent', opacity: i === lightboxIndex ? 1 : 0.5, transition: 'all .15s' }}
                  >
                    <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Next arrow */}
          {photos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              style={{ position: 'absolute' as const, right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(240,236,224,.08)', border: '2px solid rgba(240,236,224,.15)', color: '#f0ece0', fontFamily: "'Share Tech Mono',monospace", fontSize: '18px', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
            >
              →
            </button>
          )}
        </div>
      )}
    </>
  )
}
