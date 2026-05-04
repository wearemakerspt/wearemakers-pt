'use client'

import { useState, useTransition } from 'react'
import { pinFeaturedMaker, unpinFeaturedMaker } from '@/app/dashboard/curator/actions'
import type { FeaturedSlot } from '@/lib/queries/curator'
import type { Profile } from '@/types/database'

interface Props {
  slots: FeaturedSlot[]
  searchableMakers: Pick<Profile, 'id' | 'display_name' | 'slug' | 'instagram_handle' | 'is_verified' | 'bio'>[]
}

export default function SpotlightPins({ slots: initialSlots, searchableMakers }: Props) {
  const [slots, setSlots] = useState(initialSlots)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [pinningTo, setPinningTo] = useState<number | null>(null)

  const pinnedCount = slots.filter(s => s.pinned !== null).length

  const filteredMakers = query.length > 1
    ? searchableMakers.filter(m =>
        m.display_name.toLowerCase().includes(query.toLowerCase()) ||
        (m.instagram_handle ?? '').toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  function handlePin(makerId: string, position: number) {
    setError(null)
    setPinningTo(null)
    setQuery('')
    const maker = searchableMakers.find(m => m.id === makerId)
    setSlots(prev => prev.map(s => s.position === position
      ? { ...s, pinned: { id: '', maker_id: makerId, curator_id: '', market_id: null, pinned_at: new Date().toISOString(), pinned_until: new Date(Date.now() + 7 * 86400_000).toISOString(), maker: maker as any } }
      : s
    ))
    startTransition(async () => {
      const fd = new FormData()
      fd.set('maker_id', makerId)
      fd.set('position', String(position))
      const result = await pinFeaturedMaker(fd)
      if (result?.error) {
        setError(result.error)
        setSlots(prev => prev.map(s => s.position === position ? { ...s, pinned: null } : s))
      }
    })
  }

  function handleUnpin(pinId: string, position: number) {
    setSlots(prev => prev.map(s => s.position === position ? { ...s, pinned: null } : s))
    startTransition(async () => {
      const result = await unpinFeaturedMaker(pinId)
      if (result?.error) setError(result.error)
    })
  }

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const allSlots = Array.from({ length: 20 }, (_, i) => i + 1)

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>

      <div style={{ borderLeft: '3px solid var(--RED)', paddingLeft: '10px', marginBottom: '14px' }}>
        <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.6)', lineHeight: 1.6 }}>
          Pin up to 20 makers to the homepage spotlight carousel. {pinnedCount}/20 slots used.
        </div>
      </div>

      {/* Compact grid of 20 slots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '6px', marginBottom: '14px' }}>
        {allSlots.map(pos => {
          const slot = slots.find(s => s.position === pos)
          const pinned = slot?.pinned ?? null
          return (
            <div key={pos} style={{ padding: '10px', background: pinned ? 'var(--INK)' : 'var(--P2)', border: `2px solid ${pinned ? 'var(--INK)' : 'rgba(24,22,20,.2)'}`, display: 'flex', alignItems: 'center', gap: '8px', minHeight: '52px' }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', color: pinned ? 'rgba(240,236,224,.2)' : 'rgba(24,22,20,.15)', flexShrink: 0, lineHeight: 1 }}>
                {String(pos).padStart(2, '0')}
              </div>
              {pinned ? (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', color: 'var(--P)', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pinned.maker.display_name}
                    </div>
                    {pinned.pinned_until && (
                      <div style={{ ...T, fontSize: '8px', color: 'rgba(240,236,224,.3)', marginTop: '2px' }}>
                        UNTIL {new Date(pinned.pinned_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleUnpin(pinned.id, pos)} disabled={isPending}
                    style={{ ...T, fontSize: '8px', color: 'rgba(240,236,224,.4)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0', flexShrink: 0 }}>
                    ✕
                  </button>
                </>
              ) : (
                <button onClick={() => setPinningTo(pinningTo === pos ? null : pos)}
                  style={{ ...T, fontSize: '8px', color: pinningTo === pos ? 'var(--RED)' : 'rgba(24,22,20,.4)', background: 'transparent', border: 'none', cursor: 'pointer', flex: 1, textAlign: 'left', padding: 0 }}>
                  {pinningTo === pos ? 'PICKING...' : '+ PIN'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Search panel — appears when a slot is being filled */}
      {pinningTo !== null && (
        <div style={{ border: '2px solid var(--INK)', background: 'var(--P2)', padding: '12px' }}>
          <div style={{ ...T, fontWeight: 700, color: 'rgba(24,22,20,.5)', marginBottom: '8px' }}>
            PINNING TO SLOT {String(pinningTo).padStart(2, '0')} — SEARCH MAKERS
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Brand name or Instagram..."
            autoFocus
            style={{ width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '8px 12px', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none', marginBottom: '8px', boxSizing: 'border-box' as const }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filteredMakers.map(m => (
              <button key={m.id} onClick={() => handlePin(m.id, pinningTo)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'var(--P)', border: '1px solid rgba(24,22,20,.15)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', flex: 1, lineHeight: 1 }}>
                  {m.display_name}
                </div>
                {m.instagram_handle && (
                  <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>@{m.instagram_handle.replace('@', '')}</div>
                )}
                {m.is_verified && (
                  <span style={{ ...T, fontSize: '8px', fontWeight: 700, color: 'var(--P)', background: 'var(--INK)', padding: '2px 5px' }}>PRO</span>
                )}
              </button>
            ))}
            {query.length > 1 && filteredMakers.length === 0 && (
              <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No makers found.</div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '10px', borderLeft: '3px solid var(--RED)', paddingLeft: '10px', ...T, fontWeight: 700, color: 'var(--RED)' }}>
          ✗ {error}
        </div>
      )}
    </div>
  )
}
