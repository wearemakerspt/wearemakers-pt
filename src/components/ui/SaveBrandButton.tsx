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
  const [showModal, setShowModal] = useState(false)

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
        // Track save event
        trackEvent('brand_save', brandId, userId)
        // Show offer modal if offer is active
        if (digitalOffer) {
          setShowModal(true)
          trackEvent('offer_redeem', brandId, userId)
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

  // Size variants
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
    ...sizeStyle,
  }

  const buttonStyle = saved
    ? { ...T, background: 'var(--RED)', color: dark ? 'var(--P)' : 'var(--P)', border: `2px solid var(--RED)` }
    : dark
      ? { ...T, background: 'transparent', color: 'var(--P)', border: '2px solid rgba(240,236,224,.35)' }
      : { ...T, background: 'transparent', color: 'var(--INK)', border: '2px solid rgba(24,22,20,.25)' }

  if (!userId) {
    return (
      <a
        href="/auth/login"
        style={{ ...T, background: 'transparent', color: dark ? 'rgba(240,236,224,.5)' : 'rgba(24,22,20,.4)', border: '2px solid', borderColor: dark ? 'rgba(240,236,224,.2)' : 'rgba(24,22,20,.2)', textDecoration: 'none' }}
      >
        <span>♡</span> SAVE
      </a>
    )
  }

  return (
    <>
      <button onClick={handleClick} disabled={isPending} style={buttonStyle}>
        <span style={{ fontSize: size === 'lg' ? '16px' : '13px' }}>
          {saved ? '♥' : '♡'}
        </span>
        <span>{saved ? 'SAVED' : 'SAVE'}</span>
      </button>

      {/* Offer modal */}
      {showModal && digitalOffer && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(24,22,20,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: 'var(--INK)', border: '3px solid rgba(240,236,224,.15)', padding: '28px 24px', maxWidth: '400px', width: '100%', boxShadow: '8px 8px 0 0 var(--RED)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--RED)', marginBottom: '4px' }}>
              ✦ OFFER UNLOCKED
            </div>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(28px,8vw,40px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: 'var(--P)', marginBottom: '20px' }}>
              {brandName}
            </div>

            {/* Stamp */}
            <div style={{ padding: '24px', background: 'rgba(240,236,224,.04)', border: '2px dashed rgba(240,236,224,.15)', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,224,.4)', marginBottom: '8px' }}>
                YOUR OFFER
              </div>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(18px,5vw,26px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--P)', lineHeight: 1.2 }}>
                {digitalOffer}
              </div>
            </div>

            {/* Instructions */}
            <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(240,236,224,.45)', lineHeight: 1.6, marginBottom: '20px', textAlign: 'center' }}>
              Show this screen at the stall to redeem your offer.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--RED)', color: 'var(--P)', border: '2px solid var(--RED)', padding: '12px', cursor: 'pointer' }}
              >
                GOT IT ✓
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(240,236,224,.35)', border: '2px solid rgba(240,236,224,.15)', padding: '12px 16px', cursor: 'pointer' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
