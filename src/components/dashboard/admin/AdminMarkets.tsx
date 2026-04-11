'use client'
import { useState, useTransition } from 'react'
import { adminSetMarketStatus, adminCreateMarket, adminAssignCurator, adminDeleteMarket } from '@/app/dashboard/admin/actions'

export default function AdminMarkets({ markets: initialMarkets, spaces, curators }: { markets: any[]; spaces: any[]; curators: any[] }) {
  const [list, setList] = useState(initialMarkets)
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = { width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '7px 10px', fontFamily: 'var(--MONO)', fontSize: '13px', color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const }

  function handleStatus(id: string, status: string) {
    setList(prev => prev.map(m => m.id === id ? { ...m, status } : m))
    startTransition(async () => { await adminSetMarketStatus(id, status) })
  }

  function handleAssignCurator(id: string, curatorId: string) {
    const curator = curators.find(c => c.id === curatorId) ?? null
    setList(prev => prev.map(m => m.id === id ? { ...m, curator } : m))
    startTransition(async () => { await adminAssignCurator(id, curatorId || null) })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this market? Cannot be undone.')) return
    setList(prev => prev.filter(m => m.id !== id))
    startTransition(async () => { await adminDeleteMarket(id) })
  }

  const statusColor: Record<string, string> = {
    live: 'var(--RED)',
    community_live: 'var(--GRN)',
    scheduled: 'rgba(24,22,20,.4)',
    shadow: 'rgba(24,22,20,.2)',
    cancelled: 'var(--INK)',
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>

      {/* Create market button */}
      <div style={{ marginBottom: '14px' }}>
        <button onClick={() => setCreateOpen(!createOpen)} style={{ ...T, fontWeight: 700, fontSize: '10px', color: createOpen ? 'var(--P)' : 'var(--INK)', background: createOpen ? 'var(--INK)' : 'transparent', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer' }}>
          {createOpen ? '✕ CANCEL' : '+ CREATE MARKET'}
        </button>
      </div>

      {/* Create market form */}
      {createOpen && (
        <form
          action={(fd) => {
            setCreateError(null)
            startTransition(async () => {
              const r = await adminCreateMarket(fd)
              if (r?.error) setCreateError(r.error)
              else setCreateOpen(false)
            })
          }}
          style={{ marginBottom: '16px', padding: '14px', background: 'var(--P2)', border: '2px solid var(--INK)' }}
        >
          <div style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--INK)', marginBottom: '12px' }}>NEW MARKET</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>SPACE *</div>
              <select name="space_id" required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select space</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>ASSIGN CURATOR</div>
              <select name="curator_id" style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">No curator (unassigned)</option>
                {curators.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>DATE *</div>
              <input name="event_date" type="date" required style={inputStyle} />
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>STATUS</div>
              <select name="status" style={{ ...inputStyle, cursor: 'pointer' }}>
                {['scheduled','shadow','live','cancelled'].map(s => (
                  <option key={s} value={s}>{s.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>STARTS AT *</div>
              <input name="starts_at" type="time" required defaultValue="10:00" style={inputStyle} />
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>ENDS AT *</div>
              <input name="ends_at" type="time" required defaultValue="18:00" style={inputStyle} />
            </div>
          </div>
          {createError && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700, marginBottom: '8px' }}>✗ {createError}</div>}
          <button type="submit" disabled={isPending} style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--RED)', border: '2px solid var(--RED)', padding: '8px 16px', cursor: 'pointer' }}>
            {isPending ? 'CREATING...' : 'CREATE MARKET →'}
          </button>
        </form>
      )}

      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>{list.length} MARKETS</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '480px', overflowY: 'auto' }}>
        {list.map((m: any) => (
          <div key={m.id} style={{ padding: '10px 12px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.1)', borderLeft: `4px solid ${statusColor[m.status] ?? 'transparent'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>
                  {(m.space as any)?.name ?? m.title}
                </div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>
                  {m.event_date}
                </div>
              </div>

              {/* Curator assignment */}
              <select
                defaultValue={(m.curator as any)?.id ?? ''}
                onChange={e => handleAssignCurator(m.id, e.target.value)}
                disabled={isPending}
                style={{ ...T, fontSize: '9px', padding: '4px 8px', border: '1px solid rgba(24,22,20,.2)', background: 'var(--P)', cursor: 'pointer', color: 'var(--INK)', maxWidth: '160px' }}
              >
                <option value="">No curator</option>
                {curators.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
              </select>

              {/* Status */}
              <select
                defaultValue={m.status}
                onChange={e => handleStatus(m.id, e.target.value)}
                disabled={isPending}
                style={{ ...T, fontSize: '9px', padding: '4px 8px', border: '1px solid var(--INK)', background: 'var(--P)', cursor: 'pointer', color: 'var(--INK)' }}
              >
                {['shadow','scheduled','live','community_live','cancelled'].map(s => (
                  <option key={s} value={s}>{s.replace('_',' ').toUpperCase()}</option>
                ))}
              </select>

              <button
                onClick={() => handleDelete(m.id)}
                disabled={isPending}
                style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)', flexShrink: 0 }}
              >
                DEL
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No markets yet.</div>}
      </div>
    </div>
  )
}
