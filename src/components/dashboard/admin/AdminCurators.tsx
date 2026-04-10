'use client'
import { useState, useTransition } from 'react'
import { deleteCurator, assignCuratorToSpace } from '@/app/dashboard/admin/actions'

export default function AdminCurators({ curators, spaces }: { curators: any[]; spaces: any[] }) {
  const [list, setList] = useState(curators)
  const [isPending, startTransition] = useTransition()
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  function handleDelete(id: string) {
    if (!confirm('Delete this curator?')) return
    setList(prev => prev.filter(c => c.id !== id))
    startTransition(async () => { await deleteCurator(id) })
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>{list.length} CURATORS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {list.map((c: any) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.1)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>{c.display_name}</div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>
                Joined {new Date(c.created_at).toLocaleDateString('en-GB')}
              </div>
            </div>
            <button onClick={() => handleDelete(c.id)} disabled={isPending}
              style={{ ...T, fontSize: '8px', padding: '5px 10px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)' }}>
              DELETE
            </button>
          </div>
        ))}
        {list.length === 0 && <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No curators yet.</div>}
      </div>
    </div>
  )
}
