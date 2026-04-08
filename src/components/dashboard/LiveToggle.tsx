'use client'

import { useState, useTransition } from 'react'
import { setLiveStatus } from '@/app/dashboard/maker/actions'

interface Props {
  initialIsActive: boolean
  displayName: string
}

export default function LiveToggle({ initialIsActive, displayName }: Props) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    const next = !isActive
    // Optimistic update — flip immediately, revert on error
    setIsActive(next)
    setError(null)

    startTransition(async () => {
      const result = await setLiveStatus(next)
      if (result?.error) {
        setIsActive(!next) // revert
        setError(result.error)
      }
    })
  }

  return (
    <div className="border-3 border-ink" style={{ border: '3px solid #1a1a1a' }}>
      {/* Section header */}
      <div className="flex items-center justify-between bg-ink px-4 py-3 border-b-[3px] border-ink">
        <div className="flex items-center gap-3">
          <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
            §1 — TRANSMISSION STATUS
          </span>
        </div>
        <span className="font-tag text-xs text-parchment/30 tracking-[0.06em]">FP-001</span>
      </div>

      {/* Status body */}
      <div className="bg-parchment p-5">
        {/* Current status display */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-dashed border-ink">
          <div
            className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
              isActive ? 'bg-stamp' : 'bg-ink/20'
            } ${isActive ? 'animate-pulse-dot' : ''}`}
            style={{ borderRadius: '50%' }}
          />
          <div>
            <p
              className={`font-display font-black text-3xl uppercase tracking-tight leading-none transition-colors ${
                isActive ? 'text-stamp' : 'text-ink/30'
              }`}
            >
              {isActive ? '● BROADCASTING LIVE' : '○ OFFLINE'}
            </p>
            <p className="font-tag text-xs tracking-widest uppercase text-ink/35 mt-1">
              {isActive
                ? `${displayName.toUpperCase()} VISIBLE ON PUBLIC MAP`
                : 'NOT VISIBLE TO VISITORS'}
            </p>
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`
            w-full px-5 py-5 border-[3px] font-display font-black text-2xl
            uppercase tracking-tight leading-none transition-all
            disabled:opacity-60 disabled:cursor-not-allowed
            ${
              isActive
                ? 'bg-stamp border-stamp text-parchment stamp-noise hover:bg-ink hover:border-ink'
                : 'bg-parchment border-ink text-ink hover:bg-ink hover:text-parchment'
            }
          `}
          style={{
            boxShadow: isPending ? '1px 1px 0 0 #1a1a1a' : '8px 8px 0 0 #1a1a1a',
            transform: isPending ? 'translate(7px,7px)' : undefined,
          }}
        >
          <span className="block">
            {isPending
              ? 'UPDATING...'
              : isActive
              ? '[ STOP TRANSMISSION ]'
              : '[ START TRANSMISSION ]'}
          </span>
          <span className="block font-tag font-normal text-xs tracking-[0.16em] mt-2 opacity-55">
            {isActive
              ? 'Tap to go offline — remove from live map'
              : 'Tap to broadcast your stall to the live map'}
          </span>
        </button>

        {/* Error message */}
        {error && (
          <div className="mt-3 border-l-[3px] border-stamp pl-3">
            <p className="font-tag text-xs tracking-wide uppercase text-stamp font-bold">
              {error}
            </p>
          </div>
        )}

        {/* GPS log simulation — shown when live */}
        {isActive && (
          <div
            className="mt-4 border border-dashed border-ink bg-parchment-2 p-3 font-mono text-xs text-ink/60 leading-loose"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="block text-grove font-bold">&gt; COORDINATES MATCHED ✓</span>
            <span className="block">&gt; SPACE REGISTRY: PRAÇA D. LUÍS I — 38m</span>
            <span className="block text-grove font-bold">&gt; STALL REGISTERED — BROADCASTING</span>
            <span className="block opacity-40">&gt; SESSION ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  )
}
