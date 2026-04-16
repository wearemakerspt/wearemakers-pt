'use client'

import { useState, useTransition } from 'react'
import { createMarket, updateMarket, deleteMarket, cancelMarket } from '@/app/dashboard/admin/market-actions'

interface Market {
  id: string
  title: string
  status: string
  event_date: string
  event_date_end?: string | null
  starts_at: string
  ends_at: string
  space: { name: string } | null
  curator: { id: string; display_name: string } | null
  space_id?: string
  curator_id?: string | null
}

interface Space { id: string; name: string; parish: string | null }
interface Curator { id: string; display_name: string; slug: string | null }

interface Props {
  markets: Market[]
  spaces: Space[]
  curators: Curator[]
}

const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--P)', border: '2px solid var(--INK)',
  padding: '8px 10px', fontFamily: 'var(--MONO)', fontSize: '14px',
  color: 'var(--INK)', outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(24,22,20,.45)',
  letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '5px', display: 'block',
}

type View = 'list' | 'create' | { edit: Market }

const STATUS_COLORS: Record<string, string> = {
  live: 'var(--GRN)', community_live: 'var(--GRN)', scheduled: 'rgba(24,22,20,.5)',
  cancelled: 'var(--RED)', shadow: 'rgba(24,22,20,.25)',
}

export default function AdminMarkets({ markets: initial, spaces, curators }: Props) {
  const [markets, setMarkets] = useState(initial)
  const [view, setView] = useState<View>('list')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleCreate(fd: FormData) {
    setError(null); setSuccess(null)
    startTransition(async () => {
      const r = await createMarket(fd)
      if (r?.error) { setError(r.error) }
      else { setSuccess('Market created'); setView('list') }
    })
  }

  function handleUpdate(fd: FormData) {
    setError(null); setSuccess(null)
    startTransition(async () => {
      const r = await updateMarket(fd)
      if (r?.error) { setError(r.error) }
      else { setSuccess('Market updated'); setView('list') }
    })
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      const r = await deleteMarket(id)
      if (r?.error) { setError(r.error) }
      else { setMarkets(prev => prev.filter(m => m.id !== id)); setSuccess('Market deleted') }
    })
  }

  function handleCancel(id: string, title: string) {
    if (!confirm(`Cancel "${title}"? Visitors will be notified.`)) return
    startTransition(async () => {
      const r = await cancelMarket(id)
      if (r?.error) { setError(r.error) }
      else {
        setMarkets(prev => prev.map(m => m.id === id ? { ...m, status: 'cancelled' } : m))
        setSuccess('Market cancelled')
      }
    })
  }

  // ── Create/Edit form ──
  function MarketForm({ market }: { market?: Market }) {
    const isEdit = !!market
    return (
      <form action={isEdit ? handleUpdate : handleCreate} style={{ padding: '14px' }}>
        {isEdit && <input type="hidden" name="market_id" value={market.id} />}
        <div style={{ ...T, fontWeight: 700, color: 'var(--INK)', marginBottom: '16px' }}>
          {isEdit ? `EDITING: ${market.title.toUpperCase()}` : 'CREATE NEW MARKET'}
        </div>

        {error && <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', marginBottom: '12px', padding: '8px 10px', background: 'rgba(200,41,26,.06)', border: '2px solid var(--RED)' }}>✗ {error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {/* Title */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>MARKET TITLE *</label>
            <input name="title" required defaultValue={market?.title} placeholder="e.g. LX Market — April Edition" style={inputStyle} />
          </div>

          {/* Space */}
          <div>
            <label style={labelStyle}>SPACE *</label>
            <select name="space_id" required defaultValue={market?.space_id ?? ''} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Select space</option>
              {spaces.map(s => <option key={s.id} value={s.id}>{s.name}{s.parish ? ` — ${s.parish}` : ''}</option>)}
            </select>
          </div>

          {/* Curator */}
          <div>
            <label style={labelStyle}>CURATOR (OPTIONAL)</label>
            <select name="curator_id" defaultValue={market?.curator?.id ?? ''} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">No curator</option>
              {curators.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
          </div>

          {/* Start date */}
          <div>
            <label style={labelStyle}>START DATE *</label>
            <input type="date" name="event_date" required defaultValue={market?.event_date} style={inputStyle} />
          </div>

          {/* End date — for multi-day markets */}
          <div>
            <label style={labelStyle}>END DATE (MULTI-DAY)</label>
            <input type="date" name="event_date_end" defaultValue={market?.event_date_end ?? ''} style={inputStyle} />
            <div style={{ fontFamily: 'var(--TAG)', fontSize: '8px', color: 'rgba(24,22,20,.35)', marginTop: '3px', letterSpacing: '0.08em' }}>Leave blank for single-day</div>
          </div>

          {/* Times */}
          <div>
            <label style={labelStyle}>OPENS AT *</label>
            <input type="time" name="starts_at" required defaultValue={market?.starts_at?.slice(0,5) ?? '10:00'} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>CLOSES AT *</label>
            <input type="time" name="ends_at" required defaultValue={market?.ends_at?.slice(0,5) ?? '19:00'} style={inputStyle} />
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>STATUS</label>
              <select name="status" defaultValue={market.status} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="shadow">SHADOW (hidden)</option>
                <option value="scheduled">SCHEDULED</option>
                <option value="live">LIVE</option>
                <option value="community_live">COMMUNITY LIVE</option>
                <option value="cancelled">CANCELLED</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="submit" disabled={isPending} style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '10px 18px', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
            {isPending ? 'SAVING...' : isEdit ? 'SAVE CHANGES →' : 'CREATE MARKET →'}
          </button>
          <button type="button" onClick={() => { setView('list'); setError(null) }} style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'rgba(24,22,20,.5)', background: 'transparent', border: '2px solid rgba(24,22,20,.2)', padding: '10px 14px', cursor: 'pointer' }}>
            CANCEL
          </button>
        </div>
      </form>
    )
  }

  // ── List view ──
  const upcomingOrLive = markets.filter(m => !['shadow'].includes(m.status)).sort((a, b) => a.event_date > b.event_date ? 1 : -1)
  const shadowMarkets = markets.filter(m => m.status === 'shadow')

  return (
    <div style={{ padding: '14px' }}>
      {success && <div style={{ ...T, fontSize: '10px', color: 'var(--GRN)', fontWeight: 700, marginBottom: '12px', padding: '8px 10px', background: 'rgba(26,92,48,.06)', border: '2px solid var(--GRN)' }}>✓ {success}</div>}

      {view === 'list' ? (
        <>
          <button onClick={() => { setView('create'); setError(null); setSuccess(null) }}
            style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '10px 18px', cursor: 'pointer', marginBottom: '14px' }}>
            + CREATE MARKET
          </button>

          {/* Market rows */}
          {upcomingOrLive.map(m => (
            <div key={m.id} style={{ borderBottom: '2px solid rgba(24,22,20,.1)', padding: '12px 0', display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                {/* Status badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: STATUS_COLORS[m.status] ?? 'var(--GRY)', display: 'inline-block', borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ ...T, fontSize: '9px', color: STATUS_COLORS[m.status] ?? 'var(--GRY)', fontWeight: 700 }}>{m.status.toUpperCase().replace('_', ' ')}</span>
                </div>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>
                  {m.title}
                </div>
                <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.45)', lineHeight: 1.5 }}>
                  {m.event_date}{m.event_date_end && m.event_date_end !== m.event_date ? ` → ${m.event_date_end}` : ''} · {m.starts_at?.slice(0,5)}–{m.ends_at?.slice(0,5)}
                  {m.space?.name ? ` · ${m.space.name}` : ''}
                  {m.curator?.display_name ? ` · ↳ ${m.curator.display_name}` : ''}
                </div>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => { setView({ edit: m }); setError(null); setSuccess(null) }}
                  style={{ ...T, fontSize: '9px', padding: '5px 10px', border: '2px solid var(--INK)', background: 'transparent', color: 'var(--INK)', cursor: 'pointer', fontWeight: 700 }}>
                  EDIT
                </button>
                {m.status !== 'cancelled' && (
                  <button onClick={() => handleCancel(m.id, m.title)} disabled={isPending}
                    style={{ ...T, fontSize: '9px', padding: '5px 10px', border: '2px solid rgba(200,41,26,.4)', background: 'transparent', color: 'var(--RED)', cursor: 'pointer' }}>
                    CANCEL
                  </button>
                )}
                <button onClick={() => handleDelete(m.id, m.title)} disabled={isPending}
                  style={{ ...T, fontSize: '9px', padding: '5px 10px', border: '1px solid rgba(24,22,20,.2)', background: 'transparent', color: 'rgba(24,22,20,.4)', cursor: 'pointer' }}>
                  DEL
                </button>
              </div>
            </div>
          ))}

          {upcomingOrLive.length === 0 && (
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', padding: '20px 0' }}>No markets yet. Create one above.</div>
          )}

          {shadowMarkets.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '2px solid rgba(24,22,20,.06)' }}>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.3)', marginBottom: '8px' }}>SHADOW MARKETS ({shadowMarkets.length})</div>
              {shadowMarkets.map(m => (
                <div key={m.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed rgba(24,22,20,.08)' }}>
                  <div style={{ flex: 1, ...T, fontSize: '9px', color: 'rgba(24,22,20,.3)' }}>
                    {m.event_date} · {m.title} · {m.space?.name ?? '—'}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => { setView({ edit: m }); setError(null) }}
                      style={{ ...T, fontSize: '8px', padding: '3px 8px', border: '1px solid rgba(24,22,20,.2)', background: 'transparent', color: 'rgba(24,22,20,.5)', cursor: 'pointer' }}>
                      EDIT
                    </button>
                    <button onClick={() => handleDelete(m.id, m.title)} disabled={isPending}
                      style={{ ...T, fontSize: '8px', padding: '3px 8px', border: '1px solid rgba(200,41,26,.2)', background: 'transparent', color: 'var(--RED)', cursor: 'pointer' }}>
                      DEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : view === 'create' ? (
        <MarketForm />
      ) : (
        <MarketForm market={(view as { edit: Market }).edit} />
      )}
    </div>
  )
}
