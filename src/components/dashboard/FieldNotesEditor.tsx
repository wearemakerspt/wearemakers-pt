'use client'

import { useState, useTransition, useRef } from 'react'
import { saveFieldNotes } from '@/app/dashboard/maker/actions'

interface Props {
  initialOffer: string | null
}

export default function FieldNotesEditor({ initialOffer }: Props) {
  const [value, setValue] = useState(initialOffer ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const charLimit = 160
  const remaining = charLimit - value.length
  const isOverLimit = remaining < 0

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSaved(false)

    startTransition(async () => {
      const result = await saveFieldNotes(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  return (
    <div style={{ border: '3px solid #1a1a1a' }}>
      {/* Section header */}
      <div className="flex items-center justify-between bg-ink px-4 py-3 border-b-[3px] border-ink">
        <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
          §2 — FIELD NOTES / DAILY OFFER
        </span>
        <span className="font-tag text-xs text-parchment/30 tracking-[0.06em]">FP-002</span>
      </div>

      <div className="bg-parchment p-5">
        <p className="font-tag text-xs tracking-wide uppercase text-ink/40 leading-relaxed mb-4 border-l-[3px] border-stamp pl-3">
          This text appears on your public card and Courtesy screen.
          Visitors see it in the live feed.
        </p>

        <form ref={formRef} action={handleSubmit}>
          {/* Textarea */}
          <div className="mb-4">
            <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
              TODAY&apos;S OFFER / FIELD NOTE
            </label>
            <textarea
              name="offer"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              placeholder="e.g. 10% off all pots today. Show this screen at the stall."
              maxLength={charLimit + 20}
              className={`
                w-full bg-transparent border-[2px] border-dashed border-ink px-3 py-3
                font-mono text-base text-ink leading-relaxed resize-none
                placeholder:text-ink/25 placeholder:italic
                focus:outline-none focus:border-solid focus:border-[2px] transition-all
                ${isOverLimit ? 'border-stamp' : ''}
              `}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
            {/* Character counter */}
            <div className="flex justify-between mt-1">
              <span className="font-tag text-xs text-ink/30 tracking-wide">
                {value.length > 0 ? `"${value.slice(0, 40)}${value.length > 40 ? '...' : ''}"` : '— no offer set —'}
              </span>
              <span
                className={`font-tag text-xs tracking-wide ${
                  isOverLimit ? 'text-stamp font-bold' : 'text-ink/30'
                }`}
              >
                {remaining} chars
              </span>
            </div>
          </div>

          {/* Live preview */}
          {value && (
            <div className="mb-5 border-[2px] border-dashed border-ink bg-parchment-2 p-3">
              <p className="font-tag text-xs tracking-widest uppercase text-ink/35 mb-1">
                LIVE FEED PREVIEW
              </p>
              <p className="font-mono text-sm text-ink italic leading-relaxed">
                ✦ {value}
              </p>
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={isPending || isOverLimit}
              className="font-tag font-bold text-xs tracking-widest uppercase text-parchment bg-ink border-[3px] border-ink px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stamp hover:border-stamp transition-colors"
              style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}
            >
              {isPending ? 'SAVING...' : 'SAVE NOTES →'}
            </button>

            {value && (
              <button
                type="button"
                onClick={() => setValue('')}
                className="font-tag text-xs tracking-widest uppercase text-ink/40 border border-dashed border-ink/30 px-4 py-3 hover:text-ink hover:border-ink transition-colors"
              >
                CLEAR
              </button>
            )}

            {/* Save confirmation */}
            {saved && (
              <span className="font-tag font-bold text-xs tracking-widest uppercase text-grove">
                ✓ SAVED
              </span>
            )}

            {error && (
              <span className="font-tag text-xs tracking-widest uppercase text-stamp font-bold">
                ✗ {error}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
