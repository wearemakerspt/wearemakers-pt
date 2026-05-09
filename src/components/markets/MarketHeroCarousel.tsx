'use client'
import { useState, useRef, useEffect } from 'react'

interface Maker {
  maker_id: string
  maker_name: string
  avatar_url: string | null
}

interface Props {
  makers: Maker[]
  marketTitle: string
  eventDate: string
  startsAt: string
  endsAt: string
  isLive: boolean
  checkinCount: number
}

export default function MarketHeroCarousel({
  makers,
  marketTitle,
  eventDate,
  startsAt,
  endsAt,
  isLive,
  checkinCount,
}: Props) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Only use makers with an avatar
  const photos = makers.filter(m => m.avatar_url)

  const count = photos.length
  const prev = () => setCurrent(i => (i - 1 + count) % count)
  const next = () => setCurrent(i => (i + 1) % count)

  // Auto-scroll every 3s
  useEffect(() => {
    if (count <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent(i => (i + 1) % count)
    }, 3000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [count])

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (count <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent(i => (i + 1) % count)
    }, 3000)
  }

  const dateLabel = new Date(eventDate + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  }).toUpperCase()

  const makerCount = makers.length
  const countLabel = isLive
    ? `${checkinCount} MAKER${checkinCount !== 1 ? 'S' : ''} LIVE`
    : `${makerCount} MAKER${makerCount !== 1 ? 'S' : ''} REGISTERED`

  // No photos at all — dark panel
  if (photos.length === 0) {
    return (
      <div className="mkt-mobile-hero mkt-mobile-hero-dark">
        <div className="mkt-mobile-hero-content">
          <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.4)', marginBottom: '10px' }}>
            {dateLabel} · {startsAt.slice(0,5)}–{endsAt.slice(0,5)}
          </div>
          <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(32px,9vw,52px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.9, color: '#F4F1EC', marginBottom: '12px' }}>
            {marketTitle}
          </h1>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.35)' }}>
            MAKERS BEING CONFIRMED
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="mkt-mobile-hero"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchStartX.current === null) return
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 40) {
          diff > 0 ? next() : prev()
          resetTimer()
        }
        touchStartX.current = null
      }}
    >
      {/* Images */}
      {photos.map((maker, i) => (
        <img
          key={maker.maker_id}
          src={maker.avatar_url!}
          alt={maker.maker_name}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: i === current ? 1 : 0,
            transition: 'opacity .5s ease',
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="mkt-mobile-hero-overlay" />

      {/* Content */}
      <div className="mkt-mobile-hero-content">
        {isLive ? (
          <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a5c30', background: 'rgba(26,92,48,0.2)', border: '1px solid #1a5c30', padding: '3px 10px', display: 'inline-block', marginBottom: '8px' }}>
            ● LIVE NOW
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.5)', marginBottom: '8px' }}>
            {dateLabel} · {startsAt.slice(0,5)}–{endsAt.slice(0,5)}
          </div>
        )}

        <h1 style={{ fontFamily: 'var(--fh)', fontWeight: 900, fontSize: 'clamp(32px,9vw,52px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.9, color: '#F4F1EC', marginBottom: '10px' }}>
          {marketTitle}
        </h1>

        <div style={{ fontFamily: 'var(--fm)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: isLive ? '#4ade80' : 'rgba(244,241,236,0.5)', marginBottom: '12px' }}>
          {countLabel}
        </div>

        {/* Dot indicators */}
        {photos.length > 1 && (
          <div style={{ display: 'flex', gap: '5px' }}>
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); resetTimer() }}
                style={{
                  width: i === current ? '18px' : '5px',
                  height: '5px',
                  borderRadius: '3px',
                  background: i === current ? '#E8001C' : 'rgba(244,241,236,0.35)',
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
