'use client'
import { useState, useTransition } from 'react'
import { setTop20, removeTop20 } from '@/app/dashboard/admin/actions'

export default function AdminTop20({ top20, searchableMakers }: { top20: any[]; searchableMakers: any[] }) {
  const [slots, setSlots] = useState<any[]>(top20)
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [pickingSlot, setPickingSlot] = useState<number | null>(null)
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  const filtered = query.length > 1
    ? searchableMakers.filter(m => m.display_name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  function handlePick(makerId: string, position: number) {
    setPickingSlot(null); setQuery('')
    startTransition(async () => {
      const r = await setTop20(makerId, position)
      if (!r?.error) setSlots(prev => {
        const next = prev.filter(s => s.position !== position)
        const maker = searchableMakers.find(m => m.id === makerId)
        return [...next, { position, maker_id: makerId, maker }].sort((a,b) => a.position - b.position)
      })
    })
  }

  function handleRemove(position: number) {
    setSlots(prev => prev.filter(s => s.position !== position))
    startTransition(async () => { await removeTop20(position) })
  }

  const allSlots = Array.from({ length: 20 }, (_, i) => i + 1)

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      <div style={{ borderLeft: '3px solid var(--RED)', paddingLeft: '10px', marginBottom: '14px' }}>
        <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.6)', lineHeight: 1.6 }}>
          Select the top 20 maker brands to feature on the homepage. Drag positions to reorder. {slots.length}/20 filled.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '6px', marginBottom: '14px' }}>
        {allSlots.map(pos => {
          const entry = slots.find(s => s.position === pos)
          return (
            <div key={pos} style={{ padding: '10px', background: entry ? 'var(--INK)' : 'var(--P2)', border: `2px solid ${entry ? 'var(--INK)' : 'rgba(24,22,20,.2)'}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', color: entry ? 'rgba(240,236,224,.2)' : 'rgba(24,22,20,.15)', flexShrink: 0, lineHeight: 1 }}>
                {String(pos).padStart(2,'0')}
              </div>
              {entry ? (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', color: 'var(--P)', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.maker?.display_name}
                    </div>
                  </div>
                  <button onClick={() => handleRemove(pos)} style={{ ...T, fontSize: '8px', color: 'rgba(240,236,224,.4)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0', flexShrink: 0 }}>✕</button>
                </>
              ) : (
                <button onClick={() => setPickingSlot(pickingSlot === pos ? null : pos)}
                  style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.4)', background: 'transparent', border: 'none', cursor: 'pointer', flex: 1, textAlign: 'left', padding: 0 }}>
                  {pickingSlot === pos ? 'PICKING...' : '+ ADD'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {pickingSlot !== null && (
        <div style={{ border: '2px solid var(--INK)', background: 'var(--P2)', padding: '12px' }}>
          <div style={{ ...T, fontWeight: 700, color: 'rgba(24,22,20,.5)', marginBottom: '8px' }}>PICK MAKER FOR SLOT {pickingSlot}</div>
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search brand name..."
            style={{ width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '8px 12px', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none', marginBottom: '8px', boxSizing: 'border-box' as const }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {filtered.map((m: any) => (
              <button key={m.id} onClick={() => handlePick(m.id, pickingSlot)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'var(--P)', border: '1px solid rgba(24,22,20,.15)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', flex: 1 }}>{m.display_name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
