'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Brand {
  id: string
  display_name: string
  slug: string | null
  avatar_url: string | null
  featured_photo_url?: string | null
  bio_i18n?: any
}

interface Props {
  brands: Brand[]
  dayLabel: string
  greetingLine: string
}

export default function HeroSlideshow({ brands, dayLabel, greetingLine }: Props) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)

  const hasBrands = brands.length > 0
  const INTERVAL = 5000

  useEffect(() => {
    if (!hasBrands || brands.length < 2) return
    setProgress(0)
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100))
    }, 50)
    const timer = setTimeout(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % brands.length)
        setFading(false)
        setProgress(0)
      }, 400)
    }, INTERVAL)
    return () => { clearInterval(tick); clearTimeout(timer) }
  }, [current, hasBrands, brands.length])

  const brand = hasBrands ? brands[current] : null
  const img = brand ? (brand.featured_photo_url ?? brand.avatar_url ?? null) : null
  const category = brand ? brand.bio_i18n?._category?.split(',')[0]?.trim() ?? null : null
  const priceRange = brand ? brand.bio_i18n?._price_range ?? null : null
  const href = brand ? `/brands/${brand.slug ?? brand.id}` : null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      padding: '56px 52px 0',
      borderRight: '2px solid #0C0C0C',
      position: 'relative',
      overflow: 'hidden',
      background: '#F4F1EC',
    }}>
      {/* Top kicker: day + greeting */}
      <div>
        <div style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: '10px',
          letterSpacing: '0.18em',
          color: '#6B6560',
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}>
          {dayLabel} · {greetingLine}
        </div>

        {/* Brand image area */}
        {hasBrands && brand && (
          <div style={{
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.4s ease',
          }}>
            {/* Full image */}
            <div style={{
              width: '100%',
              aspectRatio: '4/5',
              maxHeight: '420px',
              overflow: 'hidden',
              background: '#EDE9E2',
              border: '2px solid #0C0C0C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginBottom: '20px',
            }}>
              {img ? (
                <img
                  src={img}
                  alt={brand.display_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <span style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontWeight: 900,
                  fontSize: '96px',
                  color: 'rgba(12,12,12,0.08)',
                  letterSpacing: '-0.04em',
                }}>
                  {brand.display_name.slice(0, 2).toUpperCase()}
                </span>
              )}
              {/* Slide counter */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: '9px',
                letterSpacing: '0.12em',
                color: 'rgba(244,241,236,0.7)',
                background: 'rgba(12,12,12,0.5)',
                padding: '3px 8px',
              }}>
                {String(current + 1).padStart(2, '0')} / {String(brands.length).padStart(2, '0')}
              </div>
            </div>

            {/* Brand info */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontFamily: "'Barlow Condensed',sans-serif",
                fontWeight: 900,
                fontSize: 'clamp(28px,4vw,48px)',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 0.9,
                color: '#1A1A1A',
                marginBottom: '6px',
              }}>
                {brand.display_name}
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {category && (
                  <div style={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#6B6560',
                  }}>
                    {category}
                  </div>
                )}
                {priceRange && (
                  <div style={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    color: '#E8001C',
                  }}>
                    {priceRange}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback if no brands */}
        {!hasBrands && (
          <div style={{
            fontFamily: "'Barlow Condensed',sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(88px,11.5vw,168px)',
            lineHeight: 0.86,
            letterSpacing: '-0.015em',
            textTransform: 'uppercase',
            color: '#1A1A1A',
          }}>
            <div style={{ color: 'rgba(12,12,12,0.13)' }}>
              {dayLabel.split(' · ')[0] || 'MON'}
            </div>
            <div>GOOD</div>
            <div style={{ color: '#E8001C', fontStyle: 'italic' }}>
              {greetingLine.split(' · ')[1]?.split('.')[0] ?? 'EVE'}.
            </div>
          </div>
        )}
      </div>

      {/* Bottom: VIEW BRAND + progress bar */}
      {hasBrands && brand && href && (
        <div style={{ borderTop: '2px solid #0C0C0C' }}>
          {/* Progress bar */}
          <div style={{ height: '2px', background: 'rgba(12,12,12,0.1)', marginBottom: '0' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: '#E8001C',
              transition: 'width 0.05s linear',
            }} />
          </div>
          <Link href={href} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 0',
            textDecoration: 'none',
          }}>
            <span style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
            }}>
              VIEW BRAND
            </span>
            <span style={{ color: '#E8001C', fontSize: '16px' }}>→</span>
          </Link>
        </div>
      )}

      {/* Dot indicators */}
      {hasBrands && brands.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '52px',
          display: 'flex',
          gap: '6px',
        }}>
          {brands.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false) }, 300) }}
              style={{
                width: i === current ? '20px' : '6px',
                height: '3px',
                background: i === current ? '#E8001C' : 'rgba(12,12,12,0.2)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.3s, background 0.3s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
