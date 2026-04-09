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
      ).slice(0, 6)
    : []

  function handlePin(makerId: string, position: number) {
    setError(null)
    setPinningTo(null)
    setQuery('')
    startTransition(async () => {
      const fd = new FormData()
      fd.set('maker_id', makerId)
      fd.set('position', String(position))
      const result = await pinFeaturedMaker(fd)
      if (result?.error) { setError(result.error) }
    })
  }

  function handleUnpin(pinId: string, position: number) {
    setSlots(prev => prev.map(s => s.position === position ? { ...s, pinned: null } : s))
    startTransition(async () => {
      const fd = new FormData()
      fd.set('pin_id', pinId)
      const result = await unpinFeaturedMaker(fd)
      if (result?.error) { setError(result.error) }
    })
  }

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>

      <div style={{ borderLeft: '3px solid var(--RED)', paddingLeft: '10px', marginBottom: '14px' }}>
        <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.6)', lineHeight: 1.6 }}>
          Pin up to 3 makers to the homepage spotlight carousel. {pinnedCount}/3 slots used.
        </div>
      </div>

      {/* 3 slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        {slots.map(slot => (
          <div key={slot.position} style={{ border: `2px solid ${slot.pinned ? 'var(--INK)' : 'rgba(24,22,20,.2)'}`, background: slot.pinned ? 'var(--INK)' : 'var(--P2)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', color: slot.pinned ? 'rgba(240,236,224,.2)' : 'rgba(24,22,20,.15)', lineHeight: 1, flexShrink: 0 }}>
              {String(slot.position).padStart(2, '0')}
            </div>
            {slot.pinned ? (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', color: 'var(--P)', lineHeight: 1, marginBottom: '2px' }}>
                    {slot.pinned.maker.display_name}
                  </div>
                  {slot.pinned.pinned_until && (
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.35)' }}>
                      UNTIL {new Date(slot.pinned.pinned_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}
                    </div>
                  )}
                </div>
                <button onClick={() => handleUnpin(slot.pinned!.id, slot.position)} disabled={isPending}
                  style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.4)', background: 'transparent', border: '1px dashed rgba(240,236,224,.2)', padding: '5px 10px', cursor: 'pointer' }}>
                  UNPIN
                </button>
              </>
            ) : (
              <>
                <div style={{ flex: 1, ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>
                  EMPTY SLOT — search to pin a maker
                </div>
                <button onClick={() => setPinningTo(pinningTo === slot.position ? null : slot.position)}
                  style={{ ...T, fontSize: '9px', fontWeight: 700, color: 'var(--INK)', background: 'transparent', border: '2px solid var(--INK)', padding: '5px 10px', cursor: 'pointer' }}>
                  + PIN
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Search panel — shows when a slot is being filled */}
      {pinningTo !== null && (
        <div style={{ border: '2px solid var(--INK)', background: 'var(--P2)', padding: '12px' }}>
          <div style={{ ...T, fontWeight: 700, color: 'rgba(24,22,20,.5)', marginBottom: '8px' }}>
            PINNING TO SLOT {pinningTo} — SEARCH MAKERS
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Brand name or Instagram..."
            autoFocus
            style={{ width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '8px 12px', fontFamily: 'var(--MONO)', fontSize: '15px', color: 'var(--INK)', outline: 'none', marginBottom: '8px' }}
          />
          {filteredMakers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredMakers.map(m => (
                <button key={m.id} onClick={() => handlePin(m.id, pinningTo)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'var(--P)', border: '1px solid rgba(24,22,20,.15)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1, flex: 1 }}>
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
            </div>
          )}
          {query.length > 1 && filteredMakers.length === 0 && (
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No makers found for "{query}"</div>
          )}
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
