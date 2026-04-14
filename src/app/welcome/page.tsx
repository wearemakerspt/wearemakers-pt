'use client'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  function handleRole(role: 'visitor' | 'maker' | 'curator') {
    if (typeof window !== 'undefined') localStorage.setItem('wam_welcomed', '1')
    if (role === 'visitor') router.push('/')
    else router.push(`/welcome/${role}`)
  }

  function handleExplore() {
    if (typeof window !== 'undefined') localStorage.setItem('wam_welcomed', '1')
    router.push('/')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0C0C0C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', zIndex: 99999 }}>

      {/* Grain */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")` }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* Logo */}
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(18px,3.5vw,24px)', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#F4F1EC' }}>
          WEARE<span style={{ color: '#E8001C' }}>MAKERS</span>.PT
        </div>

        {/* Main message */}
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(36px,6vw,72px)', lineHeight: 0.88, textTransform: 'uppercase', color: '#F4F1EC', letterSpacing: '-0.02em', marginBottom: '32px', borderLeft: '4px solid #E8001C', paddingLeft: '24px' }}>
            FORGET<br />SOUVENIR<br /><span style={{ color: '#E8001C', fontStyle: 'italic' }}>SHOPS.</span>
          </div>
          <p style={{ fontFamily: "'Barlow',sans-serif", fontWeight: 300, fontSize: 'clamp(13px,1.8vw,15px)', color: 'rgba(244,241,236,0.5)', lineHeight: 1.75, maxWidth: '520px', paddingLeft: '28px', borderLeft: '1px solid rgba(244,241,236,0.1)' }}>
            The real Lisbon isn't behind glass. Every day, across the city's street markets, independent brands, creators, makers and artisans set up their stalls.
            <br /><br />
            <span style={{ color: 'rgba(244,241,236,0.85)' }}>This app is how you find them — live, today, around the corner.</span>
          </p>
        </div>

        {/* Role buttons */}
        <div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.3)', marginBottom: '16px' }}>WHO ARE YOU?</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { role: 'visitor' as const, label: "I'M A VISITOR", desc: 'Find makers near me', primary: false },
              { role: 'maker' as const, label: "I'M A MAKER", desc: 'Register my brand', primary: true },
              { role: 'curator' as const, label: "I'M A CURATOR", desc: 'Manage my market', primary: false },
            ].map(btn => (
              <button key={btn.role} onClick={() => handleRole(btn.role)} style={{ flex: '1 1 160px', padding: '18px 20px', background: btn.primary ? '#E8001C' : 'transparent', border: btn.primary ? '2px solid #E8001C' : '2px solid rgba(244,241,236,0.2)', color: '#F4F1EC', cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s, background .15s' }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '4px' }}>{btn.label}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: btn.primary ? 'rgba(255,255,255,0.65)' : 'rgba(244,241,236,0.35)' }}>{btn.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Skip */}
        <button onClick={handleExplore} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.25)', textAlign: 'left', transition: 'color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(244,241,236,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(244,241,236,0.25)')}
        >
          Just explore the app →
        </button>
      </div>
    </div>
  )
}
