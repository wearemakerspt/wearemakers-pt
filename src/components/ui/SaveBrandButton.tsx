'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  brandId: string
  brandName: string
  initialSaved?: boolean
  userId?: string | null
  size?: 'sm' | 'md' | 'lg'
  dark?: boolean
  digitalOffer?: string | null
}

export default function SaveBrandButton({
  brandId,
  brandName,
  initialSaved = false,
  userId,
  size = 'md',
  dark = false,
  digitalOffer,
}: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, setIsPending] = useState(false)
  const [showOffer, setShowOffer] = useState(false)

  useEffect(() => {
    if (!userId) {
      try {
        const stored = localStorage.getItem('wam_circuit')
        if (stored) {
          const circuit: string[] = JSON.parse(stored)
          setSaved(circuit.includes(brandId))
        }
      } catch {}
    }
  }, [brandId, userId])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return
    setIsPending(true)
    const next = !saved
    setSaved(next)

    try {
      if (userId) {
        const supabase = createClient()
        if (next) {
          await supabase.from('saved_brands').upsert({
            visitor_id: userId,
            brand_id: brandId,
          }, { onConflict: 'visitor_id,brand_id' })
        } else {
          await supabase.from('saved_brands')
            .delete()
            .eq('visitor_id', userId)
            .eq('brand_id', brandId)
        }
      } else {
        const stored = localStorage.getItem('wam_circuit')
        const circuit: string[] = stored ? JSON.parse(stored) : []
        const updated = next
          ? [...new Set([...circuit, brandId])]
          : circuit.filter(id => id !== brandId)
        localStorage.setItem('wam_circuit', JSON.stringify(updated))
      }

      // Show offer modal when saving (not unsaving) and offer exists
      if (next && digitalOffer) {
        setShowOffer(true)
      }
    } catch {
      setSaved(!next)
    } finally {
      setIsPending(false)
    }
  }

  const sizes = {
    sm: { padding: '5px 10px', fontSize: '10px', gap: '5px' },
    md: { padding: '9px 16px', fontSize: '11px', gap: '7px' },
    lg: { padding: '14px 22px', fontSize: '12px', gap: '8px' },
  }
  const s = sizes[size]

  const borderColor = saved ? '#c8291a' : dark ? 'rgba(240,236,224,.5)' : 'var(--INK)'
  const bgColor = saved ? '#c8291a' : 'transparent'
  const textColor = saved ? '#f0ece0' : dark ? 'rgba(240,236,224,.8)' : 'var(--INK)'

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title={saved ? `Remove ${brandName} from Circuit` : `Save ${brandName} to Circuit`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: s.gap,
          padding: s.padding, cursor: isPending ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: s.fontSize,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          border: `2px solid ${borderColor}`,
          background: bgColor,
          color: textColor,
          opacity: isPending ? 0.6 : 1,
          transition: 'background .1s, color .1s, border-color .1s',
        }}
      >
        <span style={{ fontSize: size === 'sm' ? '12px' : '16px' }}>
          {saved ? '♥' : '♡'}
        </span>
        <span>{saved ? 'SAVED' : 'SAVE'}</span>
      </button>

      {/* ── Offer modal ── */}
      {showOffer && digitalOffer && (
        <div
          onClick={() => setShowOffer(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(17,16,9,.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#f0ece0',
              border: '3px solid #181614',
              boxShadow: '8px 8px 0 0 #c8291a',
              maxWidth: '400px',
              width: '100%',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div style={{ background: '#c8291a', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>✦</span>
                OFFER UNLOCKED
              </div>
              <button
                onClick={() => setShowOffer(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: '18px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* Brand name */}
            <div style={{ padding: '16px 16px 0' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>
                FROM
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1 }}>
                {brandName}
              </div>
            </div>

            {/* Offer text — the stamp */}
            <div style={{ margin: '16px', padding: '20px', background: '#181614', border: '2px dashed rgba(240,236,224,.15)', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(20px,5vw,28px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#f0ece0', lineHeight: 1.2 }}>
                {digitalOffer}
              </div>
            </div>

            {/* Instructions */}
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(24,22,20,.45)', lineHeight: 1.7, borderLeft: '2px solid #c8291a', paddingLeft: '10px' }}>
                Show this to the maker at their stall. The offer is yours — saved to your Circuit.
              </div>
            </div>

            {/* CTA */}
            <div style={{ padding: '0 16px 16px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowOffer(false)}
                style={{ flex: 1, fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#c8291a', color: '#fff', border: '2px solid #c8291a', padding: '12px', cursor: 'pointer' }}
              >
                GOT IT ✓
              </button>
              <button
                onClick={() => setShowOffer(false)}
                style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(24,22,20,.4)', border: '2px solid rgba(24,22,20,.15)', padding: '12px 16px', cursor: 'pointer' }}
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
