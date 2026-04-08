'use client'

import { useState, useTransition, useRef } from 'react'
import { createMarket } from '@/app/dashboard/curator/actions'
import type { Space } from '@/types/database'

interface Props {
  spaces: Space[]
}

export default function CreateMarketForm({ spaces }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // Default date = next Saturday
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
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        formRef.current?.reset()
        setTimeout(() => {
          setSuccess(false)
          setOpen(false)
        }, 1500)
      }
    })
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="font-tag font-bold text-xs tracking-widest uppercase text-parchment bg-stamp border-[3px] border-stamp px-5 py-3 stamp-noise hover:bg-ink hover:border-ink transition-colors"
        style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}
      >
        + ADD NEW MARKET
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/85 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="bg-parchment w-full max-w-lg max-h-[90dvh] overflow-y-auto"
            style={{ border: '3px solid #1a1a1a', boxShadow: '8px 8px 0 0 #1a1a1a' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between bg-ink px-5 py-4 border-b-[3px] border-ink">
              <div>
                <p className="font-tag text-xs tracking-[0.22em] uppercase text-stamp">
                  NEW MARKET INSTANCE
                </p>
                <h2 className="font-display font-black text-3xl uppercase tracking-tight leading-none text-parchment mt-1">
                  CREATE MARKET
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="font-tag text-xs tracking-widest uppercase text-parchment/40 border border-parchment/20 px-3 py-2 hover:text-parchment hover:border-parchment/50 transition-colors"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Form body */}
            <form ref={formRef} action={handleSubmit} className="p-5 space-y-4">
              {/* Space */}
              <div>
                <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
                  Space / Location *
                </label>
                <select
                  name="space_id"
                  required
                  className="w-full bg-parchment border-[3px] border-ink px-3 py-3 font-mono text-base text-ink focus:outline-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace", boxShadow: '3px 3px 0 0 #1a1a1a' }}
                >
                  <option value="">— Select a space —</option>
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {s.parish ? ` · ${s.parish}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom title (optional) */}
              <div>
                <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
                  Market Title{' '}
                  <span className="text-ink/25">(leave blank to use space name)</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Mercado D. Luís Especial"
                  className="w-full bg-transparent border-b-[2px] border-dashed border-ink px-0 py-2 font-mono text-base text-ink placeholder:text-ink/25 focus:outline-none focus:border-solid transition-all"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>

              {/* Date */}
              <div>
                <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="event_date"
                  required
                  defaultValue={nextSaturday}
                  className="w-full bg-transparent border-b-[2px] border-dashed border-ink px-0 py-2 font-mono text-base text-ink focus:outline-none focus:border-solid transition-all"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>

              {/* Time range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="starts_at"
                    defaultValue="09:00"
                    className="w-full bg-transparent border-b-[2px] border-dashed border-ink px-0 py-2 font-mono text-base text-ink focus:outline-none focus:border-solid transition-all"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                <div>
                  <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="ends_at"
                    defaultValue="19:00"
                    className="w-full bg-transparent border-b-[2px] border-dashed border-ink px-0 py-2 font-mono text-base text-ink focus:outline-none focus:border-solid transition-all"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
                  Notes <span className="text-ink/25">(optional)</span>
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Anything makers or visitors should know..."
                  className="w-full bg-transparent border-[2px] border-dashed border-ink px-3 py-2 font-mono text-base text-ink placeholder:text-ink/25 resize-none focus:outline-none focus:border-solid transition-all"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="border-l-[3px] border-stamp pl-3">
                  <p className="font-tag text-xs tracking-wide uppercase text-stamp font-bold">
                    ✗ {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending || success}
                  className="flex-1 font-tag font-bold text-xs tracking-widest uppercase text-parchment bg-ink border-[3px] border-ink py-4 hover:bg-stamp hover:border-stamp transition-colors disabled:opacity-50"
                  style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}
                >
                  {success
                    ? '✓ MARKET CREATED'
                    : isPending
                    ? 'CREATING...'
                    : 'CREATE MARKET →'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-tag font-bold text-xs tracking-widest uppercase text-ink bg-parchment border-[3px] border-ink px-5 py-4 hover:bg-parchment-2 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
