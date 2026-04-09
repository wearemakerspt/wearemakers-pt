'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  brandId: string
  brandName: string
  initialSaved?: boolean
  userId?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export default function SaveBrandButton({ brandId, brandName, initialSaved = false, userId, size = 'md' }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, setIsPending] = useState(false)

  // Sync with localStorage for anonymous users
  useEffect(() => {
    if (!userId) {
      const stored = localStorage.getItem('wam_circuit')
      if (stored) {
        const circuit: string[] = JSON.parse(stored)
        setSaved(circuit.includes(brandId))
      }
    }
  }, [brandId, userId])

  async function handleToggle() {
    if (isPending) return
    setIsPending(true)
    const next = !saved
    setSaved(next) // optimistic

    try {
      if (userId) {
        // Logged in — sync to database
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
        // Anonymous — localStorage only
        const stored = localStorage.getItem('wam_circuit')
        const circuit: string[] = stored ? JSON.parse(stored) : []
        const updated = next
          ? [...new Set([...circuit, brandId])]
          : circuit.filter(id => id !== brandId)
        localStorage.setItem('wam_circuit', JSON.stringify(updated))
      }
    } catch {
      setSaved(!next) // revert on error
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

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={saved ? `Remove ${brandName} from Circuit` : `Save ${brandName} to Circuit`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: s.gap,
        padding: s.padding, cursor: isPending ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: s.fontSize,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        border: `2px solid ${saved ? 'var(--RED)' : 'var(--INK)'}`,
        background: saved ? 'var(--RED)' : 'transparent',
        color: saved ? 'var(--P)' : 'var(--INK)',
        boxShadow: saved ? 'none' : 'var(--SHD-SM)',
        opacity: isPending ? 0.6 : 1,
        transition: 'background .1s, color .1s, border-color .1s',
      }}
    >
      <span style={{ fontSize: size === 'sm' ? '12px' : '16px' }}>
        {saved ? '♥' : '♡'}
      </span>
      <span>{saved ? 'SAVED' : 'SAVE'}</span>
    </button>
  )
}
