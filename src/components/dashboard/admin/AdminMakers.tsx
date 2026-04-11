'use client'
import { useState, useTransition } from 'react'
import { toggleVerifiedBadge, toggleMakerActive, deleteMaker, approveMaker, rejectMaker } from '@/app/dashboard/admin/actions'

export default function AdminMakers({ makers }: { makers: any[] }) {
  const [list, setList] = useState(makers)
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'pending' | 'active'>('pending')

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  const pending = list.filter((m: any) => !m.is_approved)
  const active = list.filter((m: any) => m.is_approved !== false)

  const filtered = (tab === 'pending' ? pending : active).filter((m: any) =>
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

  function handleApprove(id: string) {
    setList(prev => prev.map(m => m.id === id ? { ...m, is_approved: true, is_active: true } : m))
    startTransition(async () => { await approveMaker(id) })
  }

  function handleReject(id: string) {
    if (!confirm('Reject and delete this maker application?')) return
    setList(prev => prev.filter(m => m.id !== id))
    startTransition(async () => { await rejectMaker(id) })
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

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search makers..."
        style={{ width: '100%', background: 'var(--P2)', border: '2px solid var(--INK)', padding: '8px 12px', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' as const }}
      />

      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>{filtered.length} MAKERS</div>

      {/* Pending tab */}
      {tab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', padding: '8px 0' }}>
              {pending.length === 0 ? 'No pending applications.' : 'No results.'}
            </div>
          )}
          {filtered.map((m: any) => (
            <div key={m.id} style={{ padding: '10px 12px', background: 'rgba(200,41,26,.04)', border: '2px solid rgba(200,41,26,.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '17px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>
                    {m.display_name}
                  </div>
                  <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>
                    {m.instagram_handle ? `@${m.instagram_handle.replace('@', '')} · ` : ''}
                    Applied {m.applied_at ? new Date(m.applied_at).toLocaleDateString('en-GB') : new Date(m.created_at).toLocaleDateString('en-GB')}
                  </div>
                  {m.bio_i18n?._category && (
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.5)', marginTop: '2px' }}>
                      {m.bio_i18n._category}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  <button onClick={() => handleApprove(m.id)} disabled={isPending}
                    style={{ ...T, fontSize: '9px', fontWeight: 700, padding: '6px 12px', background: 'var(--GRN)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    ✓ APPROVE
                  </button>
                  <button onClick={() => handleReject(m.id)} disabled={isPending}
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
          {filtered.length === 0 && <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No makers found.</div>}
        </div>
      )}
    </div>
  )
}
