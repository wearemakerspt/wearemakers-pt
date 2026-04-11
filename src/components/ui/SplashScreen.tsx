'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const SKIP_ROUTES = ['/auth', '/dashboard', '/pitch', '/espacos']

export default function SplashScreen() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'hidden' | 'in' | 'hold' | 'out' | 'done'>('hidden')

  const skip = SKIP_ROUTES.some(r => pathname.startsWith(r))

  useEffect(() => {
    if (skip) return
    if (typeof window === 'undefined') return

    const seen = localStorage.getItem('wam_splash_seen')
    if (seen) return

    // Start animation
    setPhase('in')

    const holdTimer = setTimeout(() => setPhase('hold'), 400)
    const outTimer = setTimeout(() => setPhase('out'), 1400)
    const doneTimer = setTimeout(() => {
      setPhase('done')
      localStorage.setItem('wam_splash_seen', '1')
    }, 1800)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(outTimer)
      clearTimeout(doneTimer)
    }
  }, [skip])

  if (skip || phase === 'hidden' || phase === 'done') return null

  const opacity = phase === 'in' ? 1 : phase === 'hold' ? 1 : 0
  const contentOpacity = phase === 'in' ? 1 : phase === 'hold' ? 1 : 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#111009',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        opacity: phase === 'out' ? 0 : 1,
        transition: phase === 'out'
          ? 'opacity 0.4s ease'
          : phase === 'in'
          ? 'opacity 0.4s ease'
          : 'none',
        pointerEvents: 'all',
      }}
    >
      {/* Grain overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.055,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Content */}
      <div
        style={{
          textAlign: 'center',
          opacity: contentOpacity,
          transition: 'opacity 0.4s ease',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(32px, 8vw, 56px)',
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          color: '#F0EBE1',
          lineHeight: 1,
          marginBottom: '20px',
        }}>
          WEAREMAKERS<span style={{ color: '#E8341A' }}>.PT</span>
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 'clamp(10px, 2vw, 12px)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(240,235,225,0.4)',
          lineHeight: 1.6,
        }}>
          A verdadeira Lisboa não está atrás de vidros.
        </div>
      </div>
    </div>
  )
}
