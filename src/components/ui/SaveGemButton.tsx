'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ANON_KEYS, anonAdd, anonRemove, anonIsSaved, type AnonGem } from '@/lib/anonCircuit'

interface Props {
  gemId: string
  gemName: string
  userId: string | null
  size?: 'sm' | 'md'
}

export default function SaveGemButton({ gemId, gemName, userId, size = 'md' }: Props) {
  const [saved, setSaved] = useState(false)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!userId) {
      setSaved(anonIsSaved(ANON_KEYS.gems, gemId))
      return
    }
    const supabase = createClient()
    supabase
      .from('saved_gems')
      .select('id')
      .eq('visitor_id', userId)
      .eq('gem_id', gemId)
      .maybeSingle()
      .then(({ data }) => { if (data) setSaved(true) })
  }, [gemId, userId])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return

    // Anonymous — save to localStorage
    if (!userId) {
      const next = !saved
      setSaved(next)
      if (next) {
        const item: AnonGem = {
          id: gemId,
          name: gemName,
          category: '',
          description: null,
          address: null,
          space_name: null,
          saved_at: new Date().toISOString(),
        }
        anonAdd(ANON_KEYS.gems, item)
      } else {
        anonRemove(ANON_KEYS.gems, gemId)
      }
      return
    }

    setIsPending(true)
    const next = !saved
    setSaved(next)
    try {
      const supabase = createClient()
      if (next) {
        await supabase.from('saved_gems').upsert({
          visitor_id: userId, gem_id: gemId,
        }, { onConflict: 'visitor_id,gem_id' })
      } else {
        await supabase.from('saved_gems').delete()
          .eq('visitor_id', userId).eq('gem_id', gemId)
      }
    } catch {
      setSaved(!next)
    } finally {
      setIsPending(false)
    }
  }

  const s = size === 'sm'
    ? { padding: '5px 10px', fontSize: '9px' }
    : { padding: '7px 14px', fontSize: '10px' }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={saved ? `Remove ${gemName} from Circuit` : `Save ${gemName} to Circuit`}
      style={{
        fontFamily: 'var(--TAG)', fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        border: saved ? '2px solid var(--RED)' : '1px solid rgba(24,22,20,.25)',
        background: saved ? 'var(--RED)' : 'transparent',
        color: saved ? '#fff' : 'rgba(24,22,20,.5)',
        cursor: isPending ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        opacity: isPending ? 0.6 : 1,
        transition: 'all .1s',
        ...s,
      }}
    >
      <span style={{ fontSize: size === 'sm' ? '11px' : '14px' }}>
        {saved ? '◆' : '◇'}
      </span>
      <span>{saved ? 'SAVED' : 'SAVE'}</span>
    </button>
  )
}
