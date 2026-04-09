'use client'

import { useState, useTransition, useRef } from 'react'
import { createMarket } from '@/app/dashboard/curator/actions'
import type { Space } from '@/types/database'

interface Props { spaces: Space[] }

export default function CreateMarketForm({ spaces }: Props) {
  const [open, setOpen] = useState(false)
  const [isRange, setIsRange] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const nextSaturday = (() => {
    const d = new Date()
    const day = d.getDay()
    d.setDate(d.getDate() + ((6 - day + 7) % 7 || 7))
    return d.toISOString().split('T')[0]
  })()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createMarket(formData)
      if (result?.error) { setError(result.error) }
      else {
        setSuccess(true)
        setOpen(false)
        formRef.current?.reset()
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dashed rgba(24,22,20,.3)', padding: '8px 0', fontFamily: 'var(--MONO)', fontSize: '15px', color: 'var(--INK)', outline: 'none' }
  const labelStyle = { ...T, fontSize: '10px', color: 'rgba(24,22,20,.45)', display: 'block', marginBottom: '5px' }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          ...T, fontWeight: 700, fontSize: '12px',
          color: open ? 'var(--P)' : 'var(--INK)',
          background: open ? 'var(--INK)' : 'var(--P)',
          border: '3px solid var(--INK)', padding: '11px 18px',
          cursor: 'pointer', boxShadow: open ? 'none' : 'var(--SHD)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <span>{open ? '✕' : '+'}</span>
        <span>{open ? 'CANCEL' : 'ADD NEW MARKET'}</span>
      </button>

      {success && (
        <div style={{ marginTop: '8px', ...T, fontWeight: 700, fontSize: '10px', color: 'var(--GRN)' }}>
          ✓ MARKET CREATED — appears in the ledger below
        </div>
      )}

      {open && (
        <div style={{ marginTop: '12px', border: '3px solid var(--INK)', background: 'var(--P)', boxShadow: 'var(--SHD)' }}>
          <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', ...T, fontWeight: 700, borderBottom: '3px solid var(--INK)' }}>
            NEW MARKET DATE
          </div>
          <div style={{ padding: '16px' }}>
            <form ref={formRef} action={handleSubmit}>

              {/* Space */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>SPACE / LOCATION *</label>
                <select name="space_id" required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select a space...</option>
                  {spaces.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.parish ?? s.city}</option>
                  ))}
                </select>
              </div>

              {/* Single day vs range toggle */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>MARKET TYPE</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { value: 'single', label: 'SINGLE DAY' },
                    { value: 'range', label: 'DATE RANGE' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIsRange(opt.value === 'range')}
                      style={{
                        ...T, fontSize: '10px', fontWeight: 700, padding: '7px 14px',
                        border: '2px solid var(--INK)',
                        background: (isRange ? opt.value === 'range' : opt.value === 'single') ? 'var(--INK)' : 'transparent',
                        color: (isRange ? opt.value === 'range' : opt.value === 'single') ? 'var(--P)' : 'var(--INK)',
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date + Time row */}
              <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={labelStyle}>{isRange ? 'START DATE *' : 'DATE *'}</label>
                  <input type="date" name="event_date" defaultValue={nextSaturday} required style={inputStyle} />
                </div>
                {isRange && (
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={labelStyle}>END DATE *</label>
                    <input type="date" name="event_date_end" required style={inputStyle} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: '80px' }}>
                  <label style={labelStyle}>OPENS</label>
                  <input type="time" name="starts_at" defaultValue="10:00" style={inputStyle} />
                </div>
                <div style={{ flex: 1, minWidth: '80px' }}>
                  <label style={labelStyle}>CLOSES</label>
                  <input type="time" name="ends_at" defaultValue="19:00" style={inputStyle} />
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>MARKET TITLE (optional)</label>
                <input type="text" name="title" placeholder="e.g. LX Market Spring Edition" style={inputStyle} />
              </div>

              {/* Status */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>INITIAL STATUS</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'scheduled', label: 'SCHEDULED — publish now, open later' },
                    { value: 'shadow', label: 'SHADOW — private, not visible yet' },
                  ].map(opt => (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', ...T, fontSize: '10px', color: 'rgba(24,22,20,.6)' }}>
                      <input type="radio" name="status" value={opt.value} defaultChecked={opt.value === 'scheduled'} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ marginBottom: '12px', borderLeft: '3px solid var(--RED)', paddingLeft: '10px', ...T, fontWeight: 700, color: 'var(--RED)', fontSize: '10px' }}>
                  ✗ {error}
                </div>
              )}

              <button type="submit" disabled={isPending}
                style={{ ...T, fontWeight: 700, color: 'var(--P)', background: 'var(--RED)', border: '3px solid var(--RED)', padding: '12px 20px', cursor: isPending ? 'not-allowed' : 'pointer', boxShadow: 'var(--SHD-SM)', opacity: isPending ? 0.5 : 1 }}>
                {isPending ? 'CREATING...' : 'CREATE MARKET →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
