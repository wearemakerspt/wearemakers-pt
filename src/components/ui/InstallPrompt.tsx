'use client'
import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showIOSSteps, setShowIOSSteps] = useState(false)

  useEffect(() => {
    // Don't show if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    if (isStandalone) { setIsInstalled(true); return }

    // Don't show if already dismissed
    const dismissed = localStorage.getItem('wam_install_dismissed')
    if (dismissed) return

    // Only show on mobile
    if (window.innerWidth > 767) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    // Show after 3 seconds on homepage
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  function handleDismiss() {
    localStorage.setItem('wam_install_dismissed', '1')
    setShow(false)
  }

  function handleInstall() {
    if (isIOS) {
      setShowIOSSteps(true)
    }
  }

  if (isInstalled || !show) return null

  return (
    <>
      <style>{`
        @keyframes install-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: '64px', // above mobile tab bar
        left: 0, right: 0,
        zIndex: 8999,
        background: 'var(--INK)',
        borderTop: '3px solid var(--INK)',
        padding: '16px',
        animation: 'install-slide-up 0.2s linear',
      }}>

        {!showIOSSteps ? (
          <>
            {/* Icon + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div style={{ width: '52px', height: '52px', background: 'var(--RED)', border: '2px solid rgba(240,236,224,.2)', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '9px', color: 'var(--P)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1 }}>
                  WARE<br />MAKERS
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(20px,5vw,26px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--P)', lineHeight: 1, marginBottom: '3px' }}>
                  ADD TO HOME SCREEN
                </div>
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Instant access · Push notifications · No app store
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleInstall}
                style={{ fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--INK)', background: 'var(--P)', border: '3px solid var(--P)', padding: '10px 20px', cursor: 'pointer' }}
              >
                {isIOS ? 'HOW TO INSTALL →' : 'INSTALL APP →'}
              </button>
              <button
                onClick={handleDismiss}
                style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', padding: '10px 4px' }}
              >
                NOT NOW
              </button>
            </div>
          </>
        ) : (
          <>
            {/* iOS install steps */}
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', color: 'var(--P)', marginBottom: '14px' }}>
              ADD TO HOME SCREEN
            </div>

            {[
              { step: '1', text: <>Tap the <strong>Share</strong> button at the bottom of your browser</> },
              { step: '2', text: <>Scroll down and tap <strong>"Add to Home Screen"</strong></> },
              { step: '3', text: <>Tap <strong>"Add"</strong> — done. Open like any app.</> },
            ].map(({ step, text }) => (
              <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(240,236,224,.08)' }}>
                <div style={{ width: '28px', height: '28px', background: 'var(--RED)', color: 'var(--P)', fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {step}
                </div>
                <div style={{ fontFamily: 'var(--MONO)', fontSize: '15px', color: 'var(--P)', lineHeight: 1.5, opacity: 0.8 }}>
                  {text}
                </div>
              </div>
            ))}

            <button
              onClick={handleDismiss}
              style={{ marginTop: '14px', fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none', padding: '4px' }}
            >
              GOT IT ✓
            </button>
          </>
        )}
      </div>
    </>
  )
}
