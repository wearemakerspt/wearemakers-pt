'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function WelcomePage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // If already welcomed, skip to homepage
    if (localStorage.getItem('wam_welcomed')) {
      router.replace('/')
      return
    }
    // Fade in
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [router])

  function handleRole(role: 'visitor' | 'maker' | 'curator') {
    localStorage.setItem('wam_welcomed', '1')
    if (role === 'visitor') {
      router.push('/')
    } else {
      router.push(`/welcome/${role}`)
    }
  }

  function handleExplore() {
    localStorage.setItem('wam_welcomed', '1')
    router.push('/')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#111009',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
      zIndex: 99999,
    }}>

      {/* Grain */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.055, backgroundImage: GRAIN }} />

      {/* Grid lines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(90deg,transparent,transparent calc(100%/12 - 1px),rgba(255,255,255,.015) calc(100%/12 - 1px),rgba(255,255,255,.015) calc(100%/12))' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* Logo */}
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 'clamp(20px,4vw,26px)',
          letterSpacing: '-0.01em', textTransform: 'uppercase',
          color: '#F0EBE1',
        }}>
          WEAREMAKERS<span style={{ color: '#E8341A' }}>.PT</span>
        </div>

        {/* Main message */}
        <div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(36px,6vw,72px)',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            color: '#F0EBE1',
            letterSpacing: '-0.02em',
            marginBottom: '32px',
            borderLeft: '4px solid #E8341A',
            paddingLeft: '24px',
          }}>
            FORGET<br />
            SOUVENIR<br />
            <span style={{ color: '#E8341A', fontStyle: 'italic' }}>SHOPS.</span>
          </div>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(13px,1.8vw,16px)',
            color: 'rgba(240,235,225,0.55)',
            lineHeight: 1.75,
            maxWidth: '520px',
            paddingLeft: '28px',
            borderLeft: '1px solid rgba(240,235,225,0.12)',
          }}>
            The real Lisbon isn't behind glass. Every day, across the city's street markets, independent brands, creators, makers and artisans set up their stalls.
            <br /><br />
            <span style={{ color: 'rgba(240,235,225,0.85)' }}>This app is how you find them — live, today, around the corner.</span>
          </p>
        </div>

        {/* Role buttons */}
        <div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px', letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(240,235,225,0.3)',
            marginBottom: '16px',
          }}>
            WHO ARE YOU?
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { role: 'visitor' as const, label: "I'M A VISITOR", desc: 'Find makers near me', primary: false },
              { role: 'maker' as const, label: "I'M A MAKER", desc: 'Register my brand', primary: true },
              { role: 'curator' as const, label: "I'M A CURATOR", desc: 'Manage my market', primary: false },
            ].map(btn => (
              <button
                key={btn.role}
                onClick={() => handleRole(btn.role)}
                style={{
                  flex: '1 1 160px',
                  padding: '16px 20px',
                  background: btn.primary ? '#E8341A' : 'transparent',
                  border: btn.primary ? '3px solid #E8341A' : '3px solid rgba(240,235,225,0.2)',
                  color: '#F0EBE1',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: btn.primary ? '4px 4px 0 0 rgba(232,52,26,0.3)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  if (!btn.primary) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,235,225,0.5)'
                }}
                onMouseLeave={e => {
                  if (!btn.primary) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,235,225,0.2)'
                }}
              >
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: '18px',
                  textTransform: 'uppercase', letterSpacing: '-0.01em',
                  marginBottom: '4px',
                }}>
                  {btn.label}
                </div>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '9px', letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: btn.primary ? 'rgba(255,255,255,0.7)' : 'rgba(240,235,225,0.35)',
                }}>
                  {btn.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Skip */}
        <button
          onClick={handleExplore}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px', letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(240,235,225,0.25)',
            textAlign: 'left',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,235,225,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,235,225,0.25)')}
        >
          Just explore the app →
        </button>
      </div>
    </div>
  )
}
