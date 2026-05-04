'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ANON_KEYS, anonAdd, anonRemove, anonIsSaved, type AnonMarket } from '@/lib/anonCircuit'

interface Props {
  marketId: string
  marketTitle: string
  userId: string | null
  initialSaved?: boolean
  dark?: boolean
}

export default function SaveMarketButton({ marketId, marketTitle, userId, initialSaved = false, dark = false }: Props) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!userId) {
      setSaved(anonIsSaved(ANON_KEYS.markets, marketId))
      return
    }
    const supabase = createClient()
    supabase
      .from('saved_markets')
      .select('id')
      .eq('visitor_id', userId)
      .eq('market_id', marketId)
      .maybeSingle()
      .then(({ data }) => { if (data) setSaved(true) })
  }, [marketId, userId])

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return

    // Anonymous — save to localStorage
    if (!userId) {
      const next = !saved
      setSaved(next)
      if (next) {
        const item: AnonMarket = {
          id: marketId,
          title: marketTitle,
          event_date: '',
          starts_at: '',
          ends_at: '',
          space_name: null,
          saved_at: new Date().toISOString(),
        }
        anonAdd(ANON_KEYS.markets, item)
      } else {
        anonRemove(ANON_KEYS.markets, marketId)
      }
      return
    }

    setIsPending(true)
    const next = !saved
    setSaved(next)
    try {
      const supabase = createClient()
      if (next) {
        await supabase.from('saved_markets').upsert(
          { visitor_id: userId, market_id: marketId },
          { onConflict: 'visitor_id,market_id' }
        )
      } else {
        await supabase.from('saved_markets').delete()
          .eq('visitor_id', userId).eq('market_id', marketId)
      }
    } catch {
      setSaved(!next)
    } finally {
      setIsPending(false)
    }
  }

  const T = {
    fontFamily: 'var(--TAG)',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    fontSize: '11px',
    padding: '10px 18px',
    cursor: isPending ? 'not-allowed' : 'pointer',
    opacity: isPending ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    transition: 'all .1s',
  }

  const buttonStyle = saved
    ? { ...T, background: 'var(--RED)', color: 'var(--P)' }
    : dark
      ? { ...T, background: 'transparent', color: 'var(--P)', outline: '2px solid rgba(240,236,224,.35)' }
      : { ...T, background: 'transparent', color: 'var(--INK)', outline: '2px solid rgba(24,22,20,.25)' }

  return (
    <button onClick={handleClick} disabled={isPending} style={buttonStyle}>
      <span style={{ fontSize: '14px' }}>{saved ? '♥' : '♡'}</span>
      <span>{saved ? 'DATE SAVED' : 'SAVE DATE'}</span>
    </button>
  )
}
