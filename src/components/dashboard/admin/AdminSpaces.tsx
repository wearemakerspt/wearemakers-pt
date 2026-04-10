'use client'
import { useState, useTransition } from 'react'
import { createSpace } from '@/app/dashboard/admin/actions'

export default function AdminSpaces({ spaces }: { spaces: any[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = { width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '8px 10px', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <button onClick={() => setOpen(!open)} style={{ ...T, fontWeight: 700, fontSize: '10px', color: open ? 'var(--P)' : 'var(--INK)', background: open ? 'var(--INK)' : 'transparent', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer' }}>
          {open ? '✕ CANCEL' : '+ NEW SPACE'}
        </button>
      </div>

      {open && (
        <form action={(fd) => { setError(null); startTransition(async () => { const r = await createSpace(fd); if (r?.error) setError(r.error); else setOpen(false) }) }} style={{ marginBottom: '16px', padding: '14px', background: 'var(--P2)', border: '2px solid var(--INK)' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {spaces.map((s: any) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.15)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>{s.name}</div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>{s.address} · {s.lat}, {s.lng}</div>
            </div>
            <div style={{ ...T, fontSize: '9px', color: s.is_active ? 'var(--GRN)' : 'rgba(24,22,20,.3)', fontWeight: 700 }}>
              {s.is_active ? '● ACTIVE' : '○ INACTIVE'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
