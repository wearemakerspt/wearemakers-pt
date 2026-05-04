'use client'
import { useState, useTransition } from 'react'
import { adminSetMarketStatus, adminCreateMarket, adminAssignCurator, adminDeleteMarket, adminCancelMarket, adminUpdateMarket, adminSeedShadowMarkets } from '@/app/dashboard/admin/actions'

export default function AdminMarkets({ markets: initialMarkets, spaces, curators }: { markets: any[]; spaces: any[]; curators: any[] }) {
  const [list, setList] = useState(initialMarkets)
  const [isPending, startTransition] = useTransition()
  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [seedOpen, setSeedOpen] = useState(false)
  const [seedError, setSeedError] = useState<string | null>(null)
  const [seedResult, setSeedResult] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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

  const filtered = list.filter((m: any) => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      (m.title ?? '').toLowerCase().includes(q) ||
      (m.space?.name ?? '').toLowerCase().includes(q) ||
      (m.curator?.display_name ?? '').toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts: Record<string, number> = { all: list.length }
  list.forEach((m: any) => { statusCounts[m.status] = (statusCounts[m.status] ?? 0) + 1 })

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>

      {/* Action buttons */}
      <div style={{ marginBottom: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => { setCreateOpen(!createOpen); setSeedOpen(false) }} style={{ ...T, fontWeight: 700, fontSize: '10px', color: createOpen ? 'var(--P)' : 'var(--INK)', background: createOpen ? 'var(--INK)' : 'transparent', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer' }}>
          {createOpen ? '✕ CANCEL' : '+ CREATE MARKET'}
        </button>
        <button onClick={() => { setSeedOpen(!seedOpen); setCreateOpen(false); setSeedResult(null) }} style={{ ...T, fontWeight: 700, fontSize: '10px', color: seedOpen ? 'var(--P)' : 'var(--INK)', background: seedOpen ? 'rgba(24,22,20,.7)' : 'transparent', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer' }}>
          {seedOpen ? '✕ CANCEL' : '⬡ SEED SHADOW MARKETS'}
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

      {/* Seed shadow markets form */}
      {seedOpen && (
        <form
          action={(fd) => {
            setSeedError(null)
            setSeedResult(null)
            startTransition(async () => {
              const r = await adminSeedShadowMarkets(fd)
              if (r?.error) setSeedError(r.error)
              else {
                setSeedResult(`✓ ${r.count} shadow markets created`)
                setSeedOpen(false)
              }
            })
          }}
          style={{ marginBottom: '16px', padding: '14px', background: 'rgba(24,22,20,.04)', border: '2px solid var(--INK)' }}
        >
          <div style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--INK)', marginBottom: '4px' }}>SEED SHADOW MARKETS</div>
          <div style={{ fontFamily: 'var(--MONO)', fontSize: '11px', color: 'var(--GRY)', marginBottom: '12px' }}>
            Batch-creates hidden shadow markets for a recurring schedule. Shadow markets are invisible to the public until promoted to SCHEDULED.
          </div>
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
                <option value="">No curator</option>
                {curators.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>FROM DATE *</div>
              <input name="from_date" type="date" required style={inputStyle} />
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>TO DATE *</div>
              <input name="to_date" type="date" required style={inputStyle} />
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>STARTS AT *</div>
              <input name="starts_at" type="time" required defaultValue="10:00" style={inputStyle} />
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>ENDS AT *</div>
              <input name="ends_at" type="time" required defaultValue="18:00" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '6px' }}>DAYS OF WEEK *</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'SUN', value: '0' },
                  { label: 'MON', value: '1' },
                  { label: 'TUE', value: '2' },
                  { label: 'WED', value: '3' },
                  { label: 'THU', value: '4' },
                  { label: 'FRI', value: '5' },
                  { label: 'SAT', value: '6' },
                ].map(d => (
                  <label key={d.value} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', ...T, fontSize: '9px', fontWeight: 700 }}>
                    <input type="checkbox" name="days" value={d.value} style={{ accentColor: 'var(--INK)', width: '14px', height: '14px' }} />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {seedError && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700, marginBottom: '8px' }}>✗ {seedError}</div>}
          <button type="submit" disabled={isPending} style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '8px 16px', cursor: 'pointer' }}>
            {isPending ? 'SEEDING...' : 'SEED MARKETS →'}
          </button>
        </form>
      )}

      {seedResult && (
        <div style={{ ...T, fontSize: '10px', color: 'var(--GRN)', fontWeight: 700, marginBottom: '12px', padding: '8px 12px', background: 'rgba(26,92,48,.08)', border: '1px solid var(--GRN)' }}>
          {seedResult}
        </div>
      )}

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '10px', border: '2px solid var(--INK)', overflow: 'hidden', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `ALL (${statusCounts.all ?? 0})` },
          { key: 'scheduled', label: `SCHEDULED (${statusCounts.scheduled ?? 0})` },
          { key: 'live', label: `LIVE (${(statusCounts.live ?? 0) + (statusCounts.community_live ?? 0)})` },
          { key: 'shadow', label: `SHADOW (${statusCounts.shadow ?? 0})` },
          { key: 'cancelled', label: `CANCELLED (${statusCounts.cancelled ?? 0})` },
        ].map((t, i, arr) => (
          <button key={t.key} onClick={() => setStatusFilter(t.key)}
            style={{ ...T, fontSize: '9px', fontWeight: 700, flex: 1, padding: '7px 8px', cursor: 'pointer', background: statusFilter === t.key ? 'var(--INK)' : 'transparent', color: statusFilter === t.key ? 'var(--P)' : 'var(--INK)', border: 'none', borderRight: i < arr.length - 1 ? '1px solid rgba(24,22,20,.2)' : 'none', whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by title, space, curator..."
        style={{ width: '100%', background: 'var(--P2)', border: '2px solid var(--INK)', padding: '8px 12px', fontFamily: 'var(--MONO)', fontSize: '13px', color: 'var(--INK)', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' as const }}
      />

      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>{filtered.length} MARKETS</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '480px', overflowY: 'auto' }}>
        {filtered.map((m: any) => (
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
        {filtered.length === 0 && <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>{list.length === 0 ? 'No markets yet.' : 'No markets match.'}</div>}
      </div>
    </div>
  )
}
