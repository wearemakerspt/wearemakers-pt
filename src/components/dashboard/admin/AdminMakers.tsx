'use client'
import { useState, useTransition } from 'react'
import { toggleVerifiedBadge, toggleMakerActive, deleteMaker } from '@/app/dashboard/admin/actions'

export default function AdminMakers({ makers }: { makers: any[] }) {
  const [list, setList] = useState(makers)
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  const filtered = list.filter((m: any) =>
    m.display_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.instagram_handle ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function handleVerify(id: string, current: boolean) {
    setList(prev => prev.map(m => m.id === id ? { ...m, is_verified: !current } : m))
    startTransition(async () => { await toggleVerifiedBadge(id, !current) })
  }

  function handleToggleActive(id: string, current: boolean) {
    setList(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m))
    startTransition(async () => { await toggleMakerActive(id, !current) })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this maker? Cannot be undone.')) return
    setList(prev => prev.filter(m => m.id !== id))
    startTransition(async () => { await deleteMaker(id) })
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search makers..." style={{ width: '100%', background: 'var(--P2)', border: '2px solid var(--INK)', padding: '8px 12px', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' as const }} />
      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>{filtered.length} MAKERS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '400px', overflowY: 'auto' }}>
        {filtered.map((m: any) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.1)', opacity: m.is_active === false ? 0.5 : 1 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '17px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>
                {m.display_name}
                {m.is_verified && <span style={{ ...T, fontSize: '8px', color: 'var(--P)', background: 'var(--INK)', padding: '2px 5px', marginLeft: '6px' }}>PRO</span>}
              </div>
              {m.instagram_handle && <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '1px' }}>@{m.instagram_handle.replace('@','')}</div>}
            </div>
            <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
              <button onClick={() => handleVerify(m.id, m.is_verified)} disabled={isPending}
                style={{ ...T, fontSize: '8px', fontWeight: 700, padding: '4px 8px', border: '1px solid', cursor: 'pointer', background: m.is_verified ? 'var(--INK)' : 'transparent', color: m.is_verified ? 'var(--P)' : 'var(--INK)', borderColor: 'var(--INK)' }}>
                {m.is_verified ? '✓ PRO' : 'VERIFY'}
              </button>
              <button onClick={() => handleToggleActive(m.id, m.is_active !== false)} disabled={isPending}
                style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(24,22,20,.3)', cursor: 'pointer', background: 'transparent', color: 'rgba(24,22,20,.5)' }}>
                {m.is_active === false ? 'ENABLE' : 'DISABLE'}
              </button>
              <button onClick={() => handleDelete(m.id)} disabled={isPending}
                style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)' }}>
                DEL
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
