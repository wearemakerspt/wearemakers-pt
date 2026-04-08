'use client'

import { useState, useTransition, useRef } from 'react'
import { saveFieldNotes } from '@/app/dashboard/maker/actions'

interface Props { initialOffer: string | null }

export default function FieldNotesEditor({ initialOffer }: Props) {
  const [value, setValue] = useState(initialOffer ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const charLimit = 160
  const remaining = charLimit - value.length
  const isOverLimit = remaining < 0

  async function handleSubmit(formData: FormData) {
    setError(null); setSaved(false)
    startTransition(async () => {
      const result = await saveFieldNotes(formData)
      if (result?.error) { setError(result.error) }
      else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    })
  }

  return (
    <div>
      <div style={{ borderLeft: '3px solid var(--RED)', paddingLeft: '10px', marginBottom: '14px' }}>
        <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', lineHeight: 1.6 }}>
          This text appears on your public card and Courtesy screen. Visitors see it in the live feed.
        </div>
      </div>

      <form action={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(24,22,20,.45)', display: 'block', marginBottom: '8px' }}>
            TODAY&apos;S OFFER / FIELD NOTE
          </label>
          <textarea
            name="offer"
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={3}
            placeholder="e.g. 10% off all pots today. Show this screen at the stall."
            maxLength={charLimit + 20}
            style={{
              width: '100%', background: 'transparent',
              border: `2px ${isOverLimit ? 'solid' : 'dashed'} ${isOverLimit ? 'var(--RED)' : 'var(--INK)'}`,
              padding: '10px 12px', fontFamily: 'var(--MONO)', fontSize: '16px',
              color: 'var(--INK)', lineHeight: 1.6, resize: 'vertical', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(24,22,20,.3)' }}>
              {value.length > 0 ? `"${value.slice(0, 40)}${value.length > 40 ? '...' : ''}"` : '— no offer set —'}
            </span>
            <span style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: isOverLimit ? 'var(--RED)' : 'rgba(24,22,20,.3)', fontWeight: isOverLimit ? 700 : 400 }}>
              {remaining} chars
            </span>
          </div>
        </div>

        {value && (
          <div style={{ marginBottom: '14px', border: '2px dashed var(--INK)', background: 'var(--P2)', padding: '10px 12px' }}>
            <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(24,22,20,.35)', marginBottom: '4px' }}>LIVE FEED PREVIEW</div>
            <div style={{ fontFamily: 'var(--MONO)', fontSize: '15px', color: 'var(--INK)', fontStyle: 'italic', lineHeight: 1.6 }}>✦ {value}</div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={isPending || isOverLimit}
            style={{
              fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'var(--P)', background: 'var(--INK)',
              border: '3px solid var(--INK)', padding: '11px 18px', cursor: isPending ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--SHD-SM)', opacity: isPending || isOverLimit ? 0.5 : 1,
            }}
          >
            {isPending ? 'SAVING...' : 'SAVE NOTES →'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => setValue('')}
              style={{ fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', background: 'transparent', border: '1px dashed rgba(24,22,20,.3)', padding: '11px 14px', cursor: 'pointer' }}
            >
              CLEAR
            </button>
          )}
          {saved && <span style={{ fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--GRN)' }}>✓ SAVED</span>}
          {error && <span style={{ fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--RED)' }}>✗ {error}</span>}
        </div>
      </form>
    </div>
  )
}
