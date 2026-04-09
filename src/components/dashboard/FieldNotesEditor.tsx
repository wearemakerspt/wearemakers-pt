'use client'

import { useState, useTransition } from 'react'
import { saveFieldNotes, savePrivateNotes, toggleOffer } from '@/app/dashboard/maker/actions'

interface Props {
  initialOffer: string | null
  initialPrivateNotes?: string | null
  initialOfferActive?: boolean
}

export default function FieldNotesEditor({ initialOffer, initialPrivateNotes, initialOfferActive = true }: Props) {
  // Public offer
  const [offer, setOffer] = useState(initialOffer ?? '')
  const [offerActive, setOfferActive] = useState(initialOfferActive)
  const [offerSaved, setOfferSaved] = useState(false)
  const [offerError, setOfferError] = useState<string | null>(null)
  const [offerPending, startOfferTransition] = useTransition()

  // Private notes
  const [notes, setNotes] = useState(initialPrivateNotes ?? '')
  const [notesSaved, setNotesSaved] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [notesPending, startNotesTransition] = useTransition()

  // Toggle pending
  const [togglePending, startToggleTransition] = useTransition()

  const charLimit = 160
  const remaining = charLimit - offer.length
  const isOverLimit = remaining < 0

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const divider = { marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px dashed rgba(24,22,20,.15)' }

  async function handleOfferSave(formData: FormData) {
    setOfferError(null); setOfferSaved(false)
    startOfferTransition(async () => {
      const result = await saveFieldNotes(formData)
      if (result?.error) { setOfferError(result.error) }
      else { setOfferSaved(true); setTimeout(() => setOfferSaved(false), 3000) }
    })
  }

  async function handleNotesSave(formData: FormData) {
    setNotesError(null); setNotesSaved(false)
    startNotesTransition(async () => {
      const result = await savePrivateNotes(formData)
      if (result?.error) { setNotesError(result.error) }
      else { setNotesSaved(true); setTimeout(() => setNotesSaved(false), 3000) }
    })
  }

  function handleToggle() {
    const next = !offerActive
    setOfferActive(next)
    startToggleTransition(async () => {
      const fd = new FormData()
      fd.set('offer_active', String(next))
      await toggleOffer(fd)
    })
  }

  return (
    <div style={{ background: 'var(--P)', padding: '16px' }}>

      {/* ── PUBLIC OFFER ─────────────────────────────────── */}
      <div style={divider}>
        {/* Header row with toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div style={{ ...T, fontWeight: 700, color: 'var(--INK)', marginBottom: '2px' }}>
              TODAY&apos;S OFFER
            </div>
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)' }}>
              PUBLIC · Visitors see this on your card
            </div>
          </div>
          {/* On/off toggle */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={togglePending}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              ...T, fontSize: '10px', fontWeight: 700,
              color: offerActive ? 'var(--GRN)' : 'rgba(24,22,20,.3)',
              background: 'transparent', border: `2px solid ${offerActive ? 'var(--GRN)' : 'rgba(24,22,20,.2)'}`,
              padding: '5px 10px', cursor: 'pointer',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: offerActive ? 'var(--GRN)' : 'rgba(24,22,20,.2)', flexShrink: 0 }} />
            {offerActive ? 'ACTIVE' : 'INACTIVE'}
          </button>
        </div>

        <form action={handleOfferSave}>
          <textarea
            name="offer"
            value={offer}
            onChange={e => setOffer(e.target.value)}
            rows={3}
            placeholder="e.g. 10% off all pots today. Show this screen at the stall."
            maxLength={charLimit + 20}
            style={{
              width: '100%', background: offerActive ? 'transparent' : 'rgba(24,22,20,.03)',
              border: `2px ${isOverLimit ? 'solid' : 'dashed'} ${isOverLimit ? 'var(--RED)' : offerActive ? 'var(--INK)' : 'rgba(24,22,20,.2)'}`,
              padding: '10px 12px', fontFamily: 'var(--MONO)', fontSize: '16px',
              color: offerActive ? 'var(--INK)' : 'rgba(24,22,20,.35)',
              lineHeight: 1.6, resize: 'vertical', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', marginBottom: '10px' }}>
            <span style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>
              {offer.length > 0 ? `"${offer.slice(0, 35)}${offer.length > 35 ? '...' : ''}"` : '— no offer set —'}
            </span>
            <span style={{ ...T, fontSize: '10px', color: isOverLimit ? 'var(--RED)' : 'rgba(24,22,20,.3)', fontWeight: isOverLimit ? 700 : 400 }}>
              {remaining} chars
            </span>
          </div>

          {/* Live preview */}
          {offer && offerActive && (
            <div style={{ marginBottom: '12px', border: '2px dashed rgba(24,22,20,.2)', background: 'var(--P2)', padding: '10px 12px' }}>
              <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.35)', marginBottom: '4px' }}>LIVE FEED PREVIEW</div>
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '15px', color: 'var(--INK)', fontStyle: 'italic', lineHeight: 1.6 }}>✦ {offer}</div>
            </div>
          )}

          {!offerActive && offer && (
            <div style={{ marginBottom: '12px', ...T, fontSize: '10px', color: 'rgba(24,22,20,.35)', borderLeft: '3px solid rgba(24,22,20,.15)', paddingLeft: '8px' }}>
              OFFER SAVED BUT NOT VISIBLE — toggle active to show visitors
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button type="submit" disabled={offerPending || isOverLimit}
              style={{ ...T, fontWeight: 700, color: 'var(--P)', background: 'var(--INK)', border: '3px solid var(--INK)', padding: '10px 16px', cursor: 'pointer', boxShadow: 'var(--SHD-SM)', opacity: offerPending || isOverLimit ? 0.5 : 1 }}>
              {offerPending ? 'SAVING...' : 'SAVE OFFER →'}
            </button>
            {offer && (
              <button type="button" onClick={() => setOffer('')}
                style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', background: 'transparent', border: '1px dashed rgba(24,22,20,.3)', padding: '10px 12px', cursor: 'pointer' }}>
                CLEAR
              </button>
            )}
            {offerSaved && <span style={{ ...T, fontWeight: 700, color: 'var(--GRN)' }}>✓ SAVED</span>}
            {offerError && <span style={{ ...T, fontWeight: 700, color: 'var(--RED)' }}>✗ {offerError}</span>}
          </div>
        </form>
      </div>

      {/* ── PRIVATE FIELD NOTES ──────────────────────────── */}
      <div>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ ...T, fontWeight: 700, color: 'var(--INK)', marginBottom: '2px' }}>
            FIELD NOTES
          </div>
          <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)' }}>
            PRIVATE · Only you can see this — never shown publicly
          </div>
        </div>

        <form action={handleNotesSave}>
          <textarea
            name="private_notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="What worked today? Which products sold? Visitor feedback. Ideas for next time."
            style={{
              width: '100%', background: 'var(--P2)',
              border: '1px dashed rgba(24,22,20,.25)',
              padding: '10px 12px', fontFamily: 'var(--MONO)', fontSize: '15px',
              color: 'var(--INK)', lineHeight: 1.7, resize: 'vertical', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            <button type="submit" disabled={notesPending}
              style={{ ...T, fontWeight: 700, color: 'var(--INK)', background: 'var(--P2)', border: '2px solid var(--INK)', padding: '10px 16px', cursor: 'pointer', boxShadow: 'var(--SHD-SM)', opacity: notesPending ? 0.5 : 1 }}>
              {notesPending ? 'SAVING...' : 'SAVE NOTES →'}
            </button>
            {notes && (
              <button type="button" onClick={() => setNotes('')}
                style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', background: 'transparent', border: '1px dashed rgba(24,22,20,.3)', padding: '10px 12px', cursor: 'pointer' }}>
                CLEAR
              </button>
            )}
            {notesSaved && <span style={{ ...T, fontWeight: 700, color: 'var(--GRN)' }}>✓ SAVED</span>}
            {notesError && <span style={{ ...T, fontWeight: 700, color: 'var(--RED)' }}>✗ {notesError}</span>}
          </div>
        </form>

        <div style={{ marginTop: '10px', ...T, fontSize: '10px', color: 'rgba(24,22,20,.25)', lineHeight: 1.8 }}>
          🔒 PRIVATE — What sold, visitor feedback, ideas for next time.
        </div>
      </div>

    </div>
  )
}
