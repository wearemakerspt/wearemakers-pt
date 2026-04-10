'use client'
import { useState, useTransition } from 'react'
import { approveGem, rejectGem } from '@/app/dashboard/admin/actions'

export default function AdminGems({ gems }: { gems: any[] }) {
  const [list, setList] = useState(gems)
  const [isPending, startTransition] = useTransition()
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  const pending = list.filter((g: any) => !g.is_approved)
  const approved = list.filter((g: any) => g.is_approved)

  function handleApprove(id: string) {
    setList(prev => prev.map(g => g.id === id ? { ...g, is_approved: true } : g))
    startTransition(async () => { await approveGem(id) })
  }

  function handleReject(id: string) {
    if (!confirm('Reject and delete this gem?')) return
    setList(prev => prev.filter(g => g.id !== id))
    startTransition(async () => { await rejectGem(id) })
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      {pending.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ ...T, fontWeight: 700, color: 'var(--RED)', fontSize: '10px', marginBottom: '8px' }}>
            ● {pending.length} PENDING APPROVAL
          </div>
          {pending.map((g: any) => (
            <div key={g.id} style={{ padding: '10px 12px', background: 'rgba(200,41,26,.05)', border: '2px solid var(--RED)', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '17px', textTransform: 'uppercase', color: 'var(--INK)' }}>{g.name}</div>
                  <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.5)', marginTop: '2px' }}>
                    {g.category?.toUpperCase()} · {(g.space as any)?.name} · by {(g.vetted_by as any)?.display_name}
                  </div>
                  {g.description && <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.5)', marginTop: '4px' }}>{g.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => handleApprove(g.id)} disabled={isPending}
                    style={{ ...T, fontSize: '9px', fontWeight: 700, padding: '6px 12px', background: 'var(--GRN)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    ✓ APPROVE
                  </button>
                  <button onClick={() => handleReject(g.id)} disabled={isPending}
                    style={{ ...T, fontSize: '9px', padding: '6px 10px', background: 'transparent', color: 'var(--RED)', border: '1px solid var(--RED)', cursor: 'pointer' }}>
                    ✕ REJECT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)' }}>
        {approved.length} APPROVED GEMS · {pending.length} PENDING
      </div>
    </div>
  )
}
