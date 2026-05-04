'use client'
import { useState, useTransition } from 'react'
import { approveGem, rejectGem, adminCreateGem, adminUpdateGem } from '@/app/dashboard/admin/actions'

const GEM_CATEGORIES = ['coffee', 'food', 'drinks', 'studio', 'shop']

export default function AdminGems({ gems: initialGems, spaces }: { gems: any[]; spaces: any[] }) {
  const [list, setList] = useState(initialGems)
  const [isPending, startTransition] = useTransition()
  const [addOpen, setAddOpen] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = { width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '7px 10px', fontFamily: 'var(--MONO)', fontSize: '13px', color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const }

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

  function handleEdit(id: string) {
    setEditingId(id)
    setEditError(null)
  }

  function handleSaveEdit(id: string, fd: FormData) {
    setEditError(null)
    startTransition(async () => {
      const r = await adminUpdateGem(id, fd)
      if (r?.error) {
        setEditError(r.error)
      } else {
        setList(prev => prev.map(g => g.id === id ? {
          ...g,
          name: fd.get('name') as string,
          category: fd.get('category') as string,
          description: fd.get('description') as string || g.description,
          address: fd.get('address') as string || g.address,
          lat: parseFloat(fd.get('lat') as string) || g.lat,
          lng: parseFloat(fd.get('lng') as string) || g.lng,
          space: spaces.find(s => s.id === fd.get('space_id')) ?? g.space,
        } : g))
        setEditingId(null)
      }
    })
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>

      {/* Admin add gem */}
      <div style={{ marginBottom: '14px' }}>
        <button onClick={() => setAddOpen(!addOpen)} style={{ ...T, fontWeight: 700, fontSize: '10px', color: addOpen ? 'var(--P)' : 'var(--INK)', background: addOpen ? 'var(--INK)' : 'transparent', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer' }}>
          {addOpen ? '✕ CANCEL' : '+ ADD GEM'}
        </button>
      </div>

      {addOpen && (
        <form
          action={(fd) => {
            setAddError(null)
            startTransition(async () => {
              const r = await adminCreateGem(fd)
              if (r?.error) setAddError(r.error)
              else {
                setAddOpen(false)
                // Optimistically add to approved list
                setList(prev => [...prev, { id: Date.now().toString(), name: fd.get('name'), category: fd.get('category'), is_approved: true, space: spaces.find(s => s.id === fd.get('space_id')), description: fd.get('description') }])
              }
            })
          }}
          style={{ marginBottom: '16px', padding: '14px', background: 'var(--P2)', border: '2px solid var(--INK)' }}
        >
          <div style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--INK)', marginBottom: '12px' }}>
            ADD GEM — AUTO-APPROVED
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>GEM NAME *</div>
              <input name="name" required placeholder="e.g. Café Lisboa" style={inputStyle} />
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>CATEGORY *</div>
              <select name="category" required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select</option>
                {GEM_CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>NEAR SPACE *</div>
              <select name="space_id" required style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select space</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>ADDRESS</div>
              <input name="address" placeholder="Street address" style={inputStyle} />
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>LATITUDE</div>
              <input name="lat" type="number" step="any" placeholder="38.7xxx" style={inputStyle} />
            </div>
            <div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>LONGITUDE</div>
              <input name="lng" type="number" step="any" placeholder="-9.1xxx" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px' }}>DESCRIPTION</div>
              <input name="description" placeholder="Why is this place special?" style={inputStyle} />
            </div>
          </div>
          {addError && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700, marginBottom: '8px' }}>✗ {addError}</div>}
          <button type="submit" disabled={isPending} style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--GRN)', border: '2px solid var(--GRN)', padding: '8px 16px', cursor: 'pointer' }}>
            {isPending ? 'ADDING...' : 'ADD GEM →'}
          </button>
        </form>
      )}

      {/* Pending approval */}
      {pending.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ ...T, fontWeight: 700, color: 'var(--RED)', fontSize: '10px', marginBottom: '8px' }}>
            ● {pending.length} PENDING APPROVAL
          </div>
          {pending.map((g: any) => (
            <div key={g.id} style={{ marginBottom: '6px' }}>
              <div style={{ padding: '10px 12px', background: 'rgba(200,41,26,.05)', border: '2px solid var(--RED)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '17px', textTransform: 'uppercase', color: 'var(--INK)' }}>{g.name}</div>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.5)', marginTop: '2px' }}>
                      {g.category?.toUpperCase()} · {(g.space as any)?.name} · by {(g.vetted_by as any)?.display_name}
                    </div>
                    {g.description && <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.5)', marginTop: '4px' }}>{g.description}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => handleEdit(editingId === g.id ? null : g.id)} disabled={isPending}
                      style={{ ...T, fontSize: '9px', fontWeight: 700, padding: '6px 10px', background: editingId === g.id ? 'var(--INK)' : 'transparent', color: editingId === g.id ? 'var(--P)' : 'var(--INK)', border: '1px solid var(--INK)', cursor: 'pointer' }}>
                      {editingId === g.id ? '✕' : 'EDIT'}
                    </button>
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
              {editingId === g.id && <GemEditForm gem={g} spaces={spaces} isPending={isPending} error={editError} onSave={(fd) => handleSaveEdit(g.id, fd)} onCancel={() => setEditingId(null)} inputStyle={inputStyle} T={T} />}
            </div>
          ))}
        </div>
      )}

      {/* Approved gems */}
      {approved.length > 0 && (
        <div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>
            ✓ {approved.length} APPROVED GEMS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '400px', overflowY: 'auto' }}>
            {approved.map((g: any) => (
              <div key={g.id}>
                <div style={{ padding: '8px 12px', background: 'var(--P2)', border: editingId === g.id ? '2px solid var(--INK)' : '1px solid rgba(24,22,20,.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '15px', textTransform: 'uppercase', color: 'var(--INK)' }}>{g.name}</div>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '1px' }}>
                      {g.category?.toUpperCase()} · {(g.space as any)?.name}
                      {g.address && <span> · {g.address}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => handleEdit(editingId === g.id ? null : g.id)} disabled={isPending}
                      style={{ ...T, fontSize: '8px', padding: '3px 9px', border: '1px solid rgba(24,22,20,.3)', cursor: 'pointer', background: editingId === g.id ? 'var(--INK)' : 'transparent', color: editingId === g.id ? 'var(--P)' : 'var(--INK)', flexShrink: 0 }}>
                      {editingId === g.id ? '✕' : 'EDIT'}
                    </button>
                    <button onClick={() => handleReject(g.id)} disabled={isPending}
                      style={{ ...T, fontSize: '8px', padding: '3px 7px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)', flexShrink: 0 }}>
                      DEL
                    </button>
                  </div>
                </div>
                {editingId === g.id && <GemEditForm gem={g} spaces={spaces} isPending={isPending} error={editError} onSave={(fd) => handleSaveEdit(g.id, fd)} onCancel={() => setEditingId(null)} inputStyle={inputStyle} T={T} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 && !addOpen && (
        <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No gems yet. Add the first one above.</div>
      )}
    </div>
  )
}

function GemEditForm({ gem, spaces, isPending, error, onSave, onCancel, inputStyle, T }: {
  gem: any
  spaces: any[]
  isPending: boolean
  error: string | null
  onSave: (fd: FormData) => void
  onCancel: () => void
  inputStyle: React.CSSProperties
  T: React.CSSProperties
}) {
  return (
    <form
      action={(fd) => onSave(fd)}
      style={{ padding: '12px', background: 'var(--P2)', border: '2px solid var(--INK)', borderTop: 'none' }}
    >
      <div style={{ ...T, fontWeight: 700, fontSize: '9px', color: 'var(--INK)', marginBottom: '10px' }}>EDIT GEM</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>GEM NAME *</div>
          <input name="name" required defaultValue={gem.name} style={inputStyle} />
        </div>
        <div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>CATEGORY *</div>
          <select name="category" required defaultValue={gem.category} style={{ ...inputStyle, cursor: 'pointer' }}>
            {['coffee', 'food', 'drinks', 'studio', 'shop'].map(c => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>NEAR SPACE *</div>
          <select name="space_id" required defaultValue={gem.space?.id ?? ''} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Select space</option>
            {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>ADDRESS</div>
          <input name="address" defaultValue={gem.address ?? ''} placeholder="Street address" style={inputStyle} />
        </div>
        <div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>LATITUDE</div>
          <input name="lat" type="number" step="any" defaultValue={gem.lat ?? ''} placeholder="38.7xxx" style={inputStyle} />
        </div>
        <div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>LONGITUDE</div>
          <input name="lng" type="number" step="any" defaultValue={gem.lng ?? ''} placeholder="-9.1xxx" style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '3px' }}>DESCRIPTION</div>
          <input name="description" defaultValue={gem.description ?? ''} placeholder="Why is this place special?" style={inputStyle} />
        </div>
      </div>
      {error && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700, marginBottom: '8px' }}>✗ {error}</div>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" disabled={isPending}
          style={{ ...T, fontWeight: 700, fontSize: '9px', color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '7px 14px', cursor: 'pointer' }}>
          {isPending ? 'SAVING...' : 'SAVE →'}
        </button>
        <button type="button" onClick={onCancel}
          style={{ ...T, fontSize: '9px', color: 'var(--INK)', background: 'transparent', border: '2px solid var(--INK)', padding: '7px 12px', cursor: 'pointer' }}>
          CANCEL
        </button>
      </div>
    </form>
  )
}
