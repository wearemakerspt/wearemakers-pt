'use client'
import { useState, useTransition } from 'react'
import { createSpace, toggleSpaceActive, deleteSpace } from '@/app/dashboard/admin/actions'

export default function AdminSpaces({ spaces: initialSpaces }: { spaces: any[] }) {
  const [spaces, setSpaces] = useState(initialSpaces)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = { width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '8px 10px', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const }

  function handleToggleActive(id: string, current: boolean) {
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
    startTransition(async () => { await toggleSpaceActive(id, !current) })
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone and will remove all associated markets.`)) return
    setSpaces(prev => prev.filter(s => s.id !== id))
    startTransition(async () => { await deleteSpace(id) })
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <button onClick={() => setOpen(!open)} style={{ ...T, fontWeight: 700, fontSize: '10px', color: open ? 'var(--P)' : 'var(--INK)', background: open ? 'var(--INK)' : 'transparent', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer' }}>
          {open ? '✕ CANCEL' : '+ NEW SPACE'}
        </button>
      </div>

      {open && (
        <form
          action={(fd) => {
            setError(null)
            startTransition(async () => {
              const r = await createSpace(fd)
              if (r?.error) setError(r.error)
              else setOpen(false)
            })
          }}
          style={{ marginBottom: '16px', padding: '14px', background: 'var(--P2)', border: '2px solid var(--INK)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            {[['name','SPACE NAME *'],['address','ADDRESS'],['parish','PARISH'],['city','CITY'],['lat','LATITUDE'],['lng','LONGITUDE']].map(([n,l]) => (
              <div key={n}>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>{l}</div>
                <input name={n} required={n==='name'} placeholder={l} style={inputStyle} />
              </div>
            ))}
          </div>
          {error && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700, marginBottom: '8px' }}>✗ {error}</div>}
          <button type="submit" disabled={isPending} style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--RED)', border: '2px solid var(--RED)', padding: '8px 16px', cursor: 'pointer' }}>
            {isPending ? 'CREATING...' : 'CREATE SPACE →'}
          </button>
        </form>
      )}

      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>{spaces.length} SPACES</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {spaces.map((s: any) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: s.is_active ? 'var(--P2)' : 'rgba(24,22,20,.04)', border: '1px solid rgba(24,22,20,.15)', opacity: s.is_active ? 1 : 0.6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>{s.name}</div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>{s.address} · {s.parish} · {s.lat}, {s.lng}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ ...T, fontSize: '9px', color: s.is_active ? 'var(--GRN)' : 'rgba(24,22,20,.3)', fontWeight: 700 }}>
                {s.is_active ? '● ACTIVE' : '○ INACTIVE'}
              </div>
              <button
                onClick={() => handleToggleActive(s.id, s.is_active)}
                disabled={isPending}
                style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(24,22,20,.3)', cursor: 'pointer', background: 'transparent', color: 'rgba(24,22,20,.5)' }}
              >
                {s.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
              </button>
              <button
                onClick={() => handleDelete(s.id, s.name)}
                disabled={isPending}
                style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)' }}
              >
                DEL
              </button>
            </div>
          </div>
        ))}
        {spaces.length === 0 && (
          <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No spaces yet.</div>
        )}
      </div>
    </div>
  )
}
