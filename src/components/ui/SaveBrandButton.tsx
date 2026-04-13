'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  brandId: string
  brandName: string
  userId: string | null
  initialSaved?: boolean
  size?: 'sm' | 'md' | 'lg'
  dark?: boolean
  digitalOffer?: string | null
}

function trackEvent(event_type: string, brand_id: string, visitor_id: string | null) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type, brand_id, visitor_id }),
  }).catch(() => {})
}

type ModalStep = 'offer' | 'email' | null

export default function SaveBrandButton({
  brandId,
  brandName,
  userId,
  initialSaved = false,
  size = 'md',
  dark = false,
  digitalOffer,
}: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, setIsPending] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>(null)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailPending, setEmailPending] = useState(false)

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase
      .from('saved_brands')
      .select('id')
      .eq('visitor_id', userId)
      .eq('brand_id', brandId)
      .maybeSingle()
      .then(({ data }) => { if (data) setSaved(true) })
  }, [brandId, userId])

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isPending || !userId) return
    setIsPending(true)
    const next = !saved
    setSaved(next)

    try {
      const supabase = createClient()
      if (next) {
        await supabase.from('saved_brands').upsert(
          { visitor_id: userId, brand_id: brandId },
          { onConflict: 'visitor_id,brand_id' }
        )
        trackEvent('brand_save', brandId, userId)
        if (digitalOffer) {
          trackEvent('offer_redeem', brandId, userId)
          setModalStep('offer')
        } else {
          setModalStep('email')
        }
      } else {
        await supabase.from('saved_brands')
          .delete()
          .eq('visitor_id', userId)
          .eq('brand_id', brandId)
      }
    } catch {
      setSaved(!next)
    } finally {
      setIsPending(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || emailPending) return
    setEmailError('')
    setEmailPending(true)
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: brandId, email: email.trim(), visitor_id: userId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setEmailError(data.error ?? 'Something went wrong')
      } else {
        setEmailSent(true)
      }
    } catch {
      setEmailError('Something went wrong. Try again.')
    } finally {
      setEmailPending(false)
    }
  }

  function closeModal() {
    setModalStep(null)
    setEmail('')
    setEmailError('')
    setEmailSent(false)
  }

  function goToEmail() {
    setModalStep('email')
  }

  // Button styles
  const sizeStyle = {
    sm: { padding: '6px 12px', fontSize: '10px' },
    md: { padding: '9px 16px', fontSize: '11px' },
    lg: { padding: '12px 22px', fontSize: '12px' },
  }[size]

  const T = {
    fontFamily: 'var(--TAG)',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    cursor: isPending ? 'not-allowed' : 'pointer',
    opacity: isPending ? 0.6 : 1,
    transition: 'all .1s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    ...sizeStyle,
  }

  const buttonStyle = saved
    ? { ...T, background: 'var(--RED)', color: 'var(--P)' }
    : dark
      ? { ...T, background: 'transparent', color: 'var(--P)', outline: '2px solid rgba(240,236,224,.35)' }
      : { ...T, background: 'transparent', color: 'var(--INK)', outline: '2px solid rgba(24,22,20,.25)' }

  if (!userId) {
    return (
      <a
        href="/auth/login"
        style={{ ...T, background: 'transparent', color: dark ? 'rgba(240,236,224,.5)' : 'rgba(24,22,20,.4)', outline: '2px solid', outlineColor: dark ? 'rgba(240,236,224,.2)' : 'rgba(24,22,20,.2)', textDecoration: 'none' }}
      >
        <span>♡</span> SAVE
      </a>
    )
  }

  const INK = 'var(--INK)'
  const RED = 'var(--RED)'
  const P = 'var(--P)'
  const TAG = "'Share Tech Mono', monospace"
  const LOGO = "'Barlow Condensed', sans-serif"
  const MONO = "'JetBrains Mono', monospace"

  return (
    <>
      <button onClick={handleClick} disabled={isPending} style={buttonStyle}>
        <span style={{ fontSize: size === 'lg' ? '16px' : '13px' }}>
          {saved ? '♥' : '♡'}
        </span>
        <span>{saved ? 'SAVED' : 'SAVE'}</span>
      </button>

      {/* Modal overlay */}
      {modalStep && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(24,22,20,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={closeModal}
        >
          <div
            style={{ background: INK, border: '3px solid rgba(240,236,224,.15)', padding: '28px 24px', maxWidth: '400px', width: '100%', boxShadow: `8px 8px 0 0 ${RED}` }}
            onClick={e => e.stopPropagation()}
          >

            {/* ── STEP 1: Offer ── */}
            {modalStep === 'offer' && (
              <>
                <div style={{ fontFamily: TAG, fontWeight: 700, fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: '4px' }}>
                  ✦ OFFER UNLOCKED
                </div>
                <div style={{ fontFamily: LOGO, fontWeight: 900, fontSize: 'clamp(28px,8vw,40px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: P, marginBottom: '20px' }}>
                  {brandName}
                </div>
                <div style={{ padding: '24px', background: 'rgba(240,236,224,.04)', border: '2px dashed rgba(240,236,224,.15)', textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontFamily: TAG, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.4)', marginBottom: '8px' }}>
                    YOUR OFFER
                  </div>
                  <div style={{ fontFamily: LOGO, fontWeight: 900, fontSize: 'clamp(18px,5vw,26px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: P, lineHeight: 1.2 }}>
                    {digitalOffer}
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: '13px', color: 'rgba(240,236,224,.45)', lineHeight: 1.6, marginBottom: '20px', textAlign: 'center' }}>
                  Show this screen at the stall to redeem your offer.
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={goToEmail}
                    style={{ flex: 1, fontFamily: TAG, fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: RED, color: P, border: 'none', padding: '12px', cursor: 'pointer' }}
                  >
                    GOT IT ✓
                  </button>
                  <button
                    onClick={closeModal}
                    style={{ fontFamily: TAG, fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(240,236,224,.35)', border: '2px solid rgba(240,236,224,.15)', padding: '12px 16px', cursor: 'pointer' }}
                  >
                    CLOSE
                  </button>
                </div>
              </>
            )}

            {/* ── STEP 2: Email capture ── */}
            {modalStep === 'email' && !emailSent && (
              <>
                <div style={{ fontFamily: TAG, fontWeight: 700, fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: '8px' }}>
                  ✦ {brandName} SAVED
                </div>
                <div style={{ fontFamily: LOGO, fontWeight: 900, fontSize: 'clamp(22px,6vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.92, color: P, marginBottom: '14px' }}>
                  GET NOTIFIED WHEN<br />THEY GO LIVE
                </div>
                <div style={{ fontFamily: MONO, fontSize: '14px', color: 'rgba(240,236,224,.45)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Leave your email and we'll let you know the next time {brandName} sets up at a market.
                </div>
                <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError('') }}
                    placeholder="your@email.com"
                    style={{
                      fontFamily: MONO, fontSize: '16px', color: P,
                      background: 'rgba(240,236,224,.07)',
                      border: emailError ? `2px solid ${RED}` : '2px solid rgba(240,236,224,.2)',
                      padding: '12px 14px', outline: 'none', width: '100%',
                    }}
                    autoFocus
                  />
                  {emailError && (
                    <div style={{ fontFamily: TAG, fontSize: '9px', color: RED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {emailError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={emailPending || !email.trim()}
                    style={{ fontFamily: TAG, fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: email.trim() ? RED : 'rgba(200,41,26,.3)', color: P, border: 'none', padding: '13px', cursor: email.trim() ? 'pointer' : 'not-allowed', opacity: emailPending ? 0.6 : 1 }}
                  >
                    {emailPending ? 'SAVING...' : 'NOTIFY ME →'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{ fontFamily: TAG, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', color: 'rgba(240,236,224,.25)', border: 'none', padding: '8px', cursor: 'pointer' }}
                  >
                    No thanks
                  </button>
                </form>
              </>
            )}

            {/* ── STEP 2: Email confirmed ── */}
            {modalStep === 'email' && emailSent && (
              <>
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontFamily: LOGO, fontWeight: 900, fontSize: '48px', color: '#1a5c30', marginBottom: '12px' }}>✓</div>
                  <div style={{ fontFamily: LOGO, fontWeight: 900, fontSize: 'clamp(24px,6vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: P, lineHeight: 1, marginBottom: '10px' }}>
                    YOU'RE IN
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: '14px', color: 'rgba(240,236,224,.45)', lineHeight: 1.6, marginBottom: '24px' }}>
                    We'll email you the next time {brandName} is live at a market.
                  </div>
                  <button
                    onClick={closeModal}
                    style={{ fontFamily: TAG, fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: RED, color: P, border: 'none', padding: '12px 28px', cursor: 'pointer' }}
                  >
                    CLOSE ✓
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  )
}
