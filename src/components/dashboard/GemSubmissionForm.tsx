'use client'
import { useState, useTransition } from 'react'
import { submitGem, deleteGem } from '@/app/dashboard/maker/actions'

const GEM_CATEGORIES = [
  { value: 'coffee', label: '☕ Coffee' },
  { value: 'food', label: '🍽 Food' },
  { value: 'drinks', label: '🍷 Drinks' },
  { value: 'studio', label: '◆ Studio / Shop' },
  { value: 'shop', label: '◈ Other' },
]

interface Space { id: string; name: string; parish: string | null }
interface Gem {
  id: string; name: string; category: string
  description: string | null; is_approved: boolean
  space?: { name: string } | null
}
interface Props { spaces: Space[]; existingGems: Gem[] }

export default function GemSubmissionForm({ spaces, existingGems: initial }: Props) {
  const [gems, setGems] = useState(initial)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = { width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '9px 12px', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '5px', display: 'block' }

  const pending = gems.filter(g => !g.is_approved)
  const approved = gems.filter(g => g.is_approved)

  function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}"?`)) return
    setGems(prev => prev.filter(g => g.id !== id))
    startTransition(async () => { await deleteGem(id) })
  }

  function handleSubmit(fd: FormData) {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const r = await submitGem(fd)
      if (r?.error) {
        setError(r.error)
      } else {
        setSuccess(true)
        setOpen(false)
      }
    })
  }

  return (
    <div style={{ padding: '14px' }}>

      <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.5)', lineHeight: 1.6, marginBottom: '16px', paddingBottom: '14px', borderBottom: '2px solid rgba(24,22,20,.08)' }}>
        Share up to 3 places you love near each market — a coffee shop, a restaurant, a hidden studio.
        Approved gems appear on the market page for visitors to discover.
      </div>

      {success && (
        <div style={{ ...T, fontSize: '10px', color: 'var(--GRN)', fontWeight: 700, marginBottom: '12px', padding: '10px 12px', background: 'rgba(26,92,48,.06)', border: '2px solid var(--GRN)' }}>
          ✓ GEM SUBMITTED — PENDING ADMIN APPROVAL
        </div>
      )}

      <button
        onClick={() => { setOpen(!open); setSuccess(false) }}
        style={{ ...T, fontWeight: 700, fontSize: '10px', color: open ? 'var(--P)' : 'var(--INK)', background: open ? 'var(--INK)' : 'transparent', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer', marginBottom: open ? '14px' : '0' }}
      >
        {open ? '✕ CANCEL' : '+ SUBMIT A GEM'}
      </button>

      {open && (
        <form action={handleSubmit} style={{ padding: '16px', background: 'var(--P2)', border: '2px solid var(--INK)', marginBottom: '16px', marginTop: '14px' }}>
          <div style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--INK)', marginBottom: '14px' }}>NEW HIDDEN GEM</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>PLACE NAME *</label>
              <input name="name" required placeholder="e.g. Café Tati" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CATEGORY *</label>
              <select name="category" required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select category</option>
                {GEM_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>NEAR WHICH MARKET *</label>
              <select name="space_id" required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select market location</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}{s.parish ? ` — ${s.parish}` : ''}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>WHY IS THIS PLACE SPECIAL?</label>
              <input name="description" placeholder="Best espresso in Mouraria. Always fresh." style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>ADDRESS (OPTIONAL)</label>
              <input name="address" placeholder="Rua da Palma 7, Lisboa" style={inputStyle} />
            </div>
          </div>
          {error && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700, marginBottom: '10px' }}>✗ {error}</div>}
          <button type="submit" disabled={isPending} style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--RED)', border: '2px solid var(--RED)', padding: '10px 18px', cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
            {isPending ? 'SUBMITTING...' : 'SUBMIT FOR APPROVAL →'}
          </button>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.3)', marginTop: '10px' }}>
            The WAM team will review your gem before it goes live.
          </div>
        </form>
      )}

      {/* Pending gems */}
      {pending.length > 0 && (
        <div style={{ marginBottom: '16px', marginTop: open ? '0' : '14px' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>AWAITING APPROVAL ({pending.length})</div>
          {pending.map(g => (
            <div key={g.id} style={{ padding: '10px 12px', background: 'rgba(200,41,26,.04)', border: '1px solid rgba(200,41,26,.2)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>{g.name}</div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>{g.category.toUpperCase()} · {(g.space as any)?.name ?? ''}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.35)', padding: '3px 8px', border: '1px solid rgba(24,22,20,.2)' }}>PENDING</div>
                <button onClick={() => handleDelete(g.id, g.name)} disabled={isPending}
                  style={{ ...T, fontSize: '8px', padding: '3px 8px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)' }}>
                  DEL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approved gems */}
      {approved.length > 0 && (
        <div style={{ marginTop: (open || pending.length > 0) ? '0' : '14px' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>LIVE GEMS ({approved.length})</div>
          {approved.map(g => (
            <div key={g.id} style={{ padding: '10px 12px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.1)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>{g.name}</div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>{g.category.toUpperCase()} · {(g.space as any)?.name ?? ''}</div>
                {g.description && <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'rgba(24,22,20,.45)', marginTop: '3px' }}>{g.description}</div>}
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ ...T, fontSize: '8px', color: 'var(--GRN)', fontWeight: 700 }}>✓ LIVE</div>
                <button onClick={() => handleDelete(g.id, g.name)} disabled={isPending}
                  style={{ ...T, fontSize: '8px', padding: '3px 8px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)' }}>
                  DEL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {gems.length === 0 && !open && (
        <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', marginTop: '12px' }}>
          No gems submitted yet. Share a place you love near your market.
        </div>
      )}
    </div>
  )
}
