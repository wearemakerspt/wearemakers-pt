'use client'
import { useState, useTransition } from 'react'
import { adminSetMarketStatus, adminCreateMarket, adminAssignCurator, adminDeleteMarket, adminCancelMarket, adminUpdateMarket } from '@/app/dashboard/admin/actions'

export default function AdminMarkets({ markets: initialMarkets, spaces, curators }: { markets: any[]; spaces: any[]; curators: any[] }) {
  const [list, setList] = useState(initialMarkets)
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

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

  function handleCancel(id: string) {
    if (!confirm('Cancel this market? This will notify saved visitors.')) return
    setList(prev => prev.map(m => m.id === id ? { ...m, status: 'cancelled' } : m))
    startTransition(async () => { await adminCancelMarket(id) })
  }

  function handleUpdate(id: string, fd: FormData) {
    setEditError(null)
    startTransition(async () => {
      const r = await adminUpdateMarket(id, fd)
      if (r?.error) { setEditError(r.error) }
      else {
        setList(prev => prev.map(m => m.id === id ? {
          ...m,
          title: fd.get('title') as string,
          event_date: fd.get('event_date') as string,
          event_date_end: fd.get('event_date_end') || null,
          starts_at: fd.get('starts_at') as string,
          ends_at: fd.get('ends_at') as string,
        } : m))
        setEditId(null)
      }
    })
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
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>TITLE (leave blank to auto-generate)</div>
              <input name="title" type="text" placeholder="e.g. LX Market" style={inputStyle} />
            </div>
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
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>START DATE *</div>
              <input name="event_date" type="date" required style={inputStyle} />
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>END DATE (multi-day only)</div>
              <input name="event_date_end" type="date" style={inputStyle} />
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

            {/* Edit mode */}
            {editId === m.id ? (
              <form action={(fd) => handleUpdate(m.id, fd)}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>TITLE</div>
                    <input name="title" defaultValue={m.title} required style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px' }} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>SPACE / LOCATION</div>
                    <select name="space_id" defaultValue={(m.space as any)?.id ?? ''} style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px', cursor: 'pointer' }}>
                      <option value="">Select space</option>
                      {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>START DATE</div>
                    <input name="event_date" type="date" defaultValue={m.event_date} required style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px' }} />
                  </div>
                  <div>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>END DATE (multi-day)</div>
                    <input name="event_date_end" type="date" defaultValue={m.event_date_end ?? ''} style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px' }} />
                  </div>
                  <div>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>STARTS AT</div>
                    <input name="starts_at" type="time" defaultValue={m.starts_at?.slice(0,5)} required style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px' }} />
                  </div>
                  <div>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>ENDS AT</div>
                    <input name="ends_at" type="time" defaultValue={m.ends_at?.slice(0,5)} required style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px' }} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>CURATOR</div>
                    <select name="curator_id" defaultValue={(m.curator as any)?.id ?? ''} style={{ ...inputStyle, fontSize: '12px', padding: '5px 8px', cursor: 'pointer' }}>
                      <option value="">No curator</option>
                      {curators.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                    </select>
                  </div>
                </div>
                {editError && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', marginBottom: '6px' }}>✗ {editError}</div>}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="submit" disabled={isPending} style={{ ...T, fontSize: '9px', padding: '4px 10px', background: 'var(--INK)', color: 'var(--P)', border: 'none', cursor: 'pointer' }}>
                    {isPending ? 'SAVING...' : 'SAVE →'}
                  </button>
                  <button type="button" onClick={() => setEditId(null)} style={{ ...T, fontSize: '9px', padding: '4px 10px', background: 'transparent', color: 'rgba(24,22,20,.5)', border: '1px solid rgba(24,22,20,.2)', cursor: 'pointer' }}>
                    CANCEL
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>
                    {m.title ?? (m.space as any)?.name}
                  </div>
                  <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>
                    {m.event_date}{m.event_date_end ? ` → ${m.event_date_end}` : ''} · {m.starts_at?.slice(0,5)}–{m.ends_at?.slice(0,5)}
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

                <button onClick={() => { setEditId(m.id); setEditError(null) }} disabled={isPending} style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(24,22,20,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--INK)', flexShrink: 0 }}>EDIT</button>
                <button onClick={() => handleCancel(m.id)} disabled={isPending} style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(24,22,20,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--GRY)', flexShrink: 0 }}>CANCEL</button>
                <button onClick={() => handleDelete(m.id)} disabled={isPending} style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)', flexShrink: 0 }}>DEL</button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No markets yet.</div>}
      </div>
    </div>
  )
}
