'use client'
import { useState, useTransition } from 'react'
import { deleteVisitor, downloadVisitorEmails } from '@/app/dashboard/admin/actions'

export default function AdminVisitors({ visitors }: { visitors: any[] }) {
  const [list, setList] = useState(visitors)
  const [isPending, startTransition] = useTransition()
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  function handleDelete(id: string) {
    if (!confirm('Delete this visitor account?')) return
    setList(prev => prev.filter(v => v.id !== id))
    startTransition(async () => { await deleteVisitor(id) })
  }

  function handleDownloadCSV() {
    const csv = ['id,display_name,created_at', ...list.map(v => `${v.id},${v.display_name},${v.created_at}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'wam-visitors.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.5)' }}>{list.length} VISITORS</div>
        <button onClick={handleDownloadCSV} style={{ ...T, fontWeight: 700, fontSize: '9px', color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '6px 12px', cursor: 'pointer' }}>
          ↓ DOWNLOAD CSV
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>
        {list.map((v: any) => (
          <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.1)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)' }}>{v.display_name}</div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)' }}>{new Date(v.created_at).toLocaleDateString('en-GB')}</div>
            </div>
            <button onClick={() => handleDelete(v.id)} disabled={isPending}
              style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)' }}>
              DEL
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
