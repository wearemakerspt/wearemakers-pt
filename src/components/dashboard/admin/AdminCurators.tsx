'use client'
import { useState, useTransition } from 'react'
import { deleteCurator, approveCurator, rejectCurator } from '@/app/dashboard/admin/actions'

export default function AdminCurators({ curators, spaces }: { curators: any[]; spaces: any[] }) {
  const [list, setList] = useState(curators)
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'pending' | 'active'>('pending')

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  const pending = list.filter((c: any) => !c.is_approved)
  const active = list.filter((c: any) => c.is_approved !== false)

  const displayed = tab === 'pending' ? pending : active

  function handleDelete(id: string) {
    if (!confirm('Delete this curator?')) return
    setList(prev => prev.filter(c => c.id !== id))
    startTransition(async () => { await deleteCurator(id) })
  }

  function handleApprove(id: string) {
    setList(prev => prev.map(c => c.id === id ? { ...c, is_approved: true, is_active: true } : c))
    startTransition(async () => { await approveCurator(id) })
  }

  function handleReject(id: string) {
    if (!confirm('Reject and delete this curator application?')) return
    setList(prev => prev.filter(c => c.id !== id))
    startTransition(async () => { await rejectCurator(id) })
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '12px', border: '2px solid var(--INK)', overflow: 'hidden' }}>
        {[
          { key: 'pending', label: `PENDING (${pending.length})` },
          { key: 'active', label: `ACTIVE (${active.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{ ...T, fontSize: '10px', fontWeight: 700, flex: 1, padding: '8px', cursor: 'pointer', background: tab === t.key ? 'var(--INK)' : 'transparent', color: tab === t.key ? 'var(--P)' : 'var(--INK)', border: 'none', borderRight: t.key === 'pending' ? '2px solid var(--INK)' : 'none' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>{displayed.length} CURATORS</div>

      {/* Pending tab */}
      {tab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {displayed.length === 0 && (
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', padding: '8px 0' }}>
              No pending curator applications.
            </div>
          )}
          {displayed.map((c: any) => (
            <div key={c.id} style={{ padding: '12px', background: 'rgba(200,41,26,.04)', border: '2px solid rgba(200,41,26,.2)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1, marginBottom: '4px' }}>
                    {c.display_name}
                  </div>
                  {c.instagram_handle && (
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>@{c.instagram_handle.replace('@','')}</div>
                  )}
                  <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>
                    Applied {c.applied_at ? new Date(c.applied_at).toLocaleDateString('en-GB') : new Date(c.created_at).toLocaleDateString('en-GB')}
                  </div>

                  {/* Note about next step */}
                  <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.5)', marginTop: '8px', padding: '6px 10px', background: 'var(--P2)', borderLeft: '2px solid rgba(24,22,20,.2)', lineHeight: 1.6, textTransform: 'none' as const, fontFamily: 'var(--MONO)', letterSpacing: 0 }}>
                    After approving, assign a market in §2 Markets.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  <button onClick={() => handleApprove(c.id)} disabled={isPending}
                    style={{ ...T, fontSize: '9px', fontWeight: 700, padding: '6px 12px', background: 'var(--GRN)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    ✓ APPROVE
                  </button>
                  <button onClick={() => handleReject(c.id)} disabled={isPending}
                    style={{ ...T, fontSize: '8px', padding: '5px 10px', border: '1px solid var(--RED)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)' }}>
                    ✕ REJECT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active tab */}
      {tab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {displayed.map((c: any) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.1)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>
                  {c.display_name}
                </div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>
                  {c.instagram_handle ? `@${c.instagram_handle.replace('@','')} · ` : ''}
                  Joined {new Date(c.created_at).toLocaleDateString('en-GB')}
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)} disabled={isPending}
                style={{ ...T, fontSize: '8px', padding: '5px 10px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)' }}>
                DELETE
              </button>
            </div>
          ))}
          {displayed.length === 0 && <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No active curators yet.</div>}
        </div>
      )}
    </div>
  )
}
