'use client'

import { useTransition, useState } from 'react'
import { toggleAttendanceIntent } from '@/app/dashboard/maker/actions'
import { formatMarketDate, formatTime, getStatusMeta } from '@/lib/utils'
import type { UpcomingMarket } from '@/lib/queries/maker'

interface Props {
  markets: UpcomingMarket[]
}

export default function UpcomingAgenda({ markets }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  // Optimistic state: map market_id → is_attending
  const [localAttending, setLocalAttending] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(markets.map((um) => [um.market.id, um.is_attending]))
  )

  function handleToggle(marketId: string, currentlyAttending: boolean) {
    // Optimistic update
    setLocalAttending((prev) => ({ ...prev, [marketId]: !currentlyAttending }))
    setPendingId(marketId)

    startTransition(async () => {
      const fd = new FormData()
      fd.set('market_id', marketId)
      fd.set('is_attending', String(currentlyAttending))
      const result = await toggleAttendanceIntent(fd)
      if (result?.error) {
        // Revert on error
        setLocalAttending((prev) => ({ ...prev, [marketId]: currentlyAttending }))
      }
      setPendingId(null)
    })
  }

  // Separate today from future
  const todayStr = new Date().toISOString().split('T')[0]
  const future = markets.filter((um) => um.market.event_date > todayStr)

  if (future.length === 0) {
    return (
      <div style={{ border: '3px solid #1a1a1a' }}>
        <div className="flex items-center justify-between bg-ink px-4 py-3 border-b-[3px] border-ink">
          <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
            §4 — UPCOMING AGENDA
          </span>
          <span className="font-tag text-xs text-parchment/30 tracking-[0.06em]">FP-004</span>
        </div>
        <div className="bg-parchment p-5 text-center">
          <p className="font-tag text-xs tracking-widest uppercase text-ink/25 leading-loose">
            NO MARKETS SCHEDULED IN THE NEXT 60 DAYS
            <br />
            The curator will announce new dates soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ border: '3px solid #1a1a1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between bg-ink px-4 py-3 border-b-[3px] border-ink">
        <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
          §4 — UPCOMING AGENDA
        </span>
        <span className="font-tag text-xs text-parchment/30 tracking-[0.06em]">FP-004</span>
      </div>

      {/* Instruction strip */}
      <div className="bg-parchment-2 px-4 py-3 border-b-[2px] border-ink/15">
        <p className="font-tag text-xs tracking-wide uppercase text-ink/40">
          Declare intent for future markets. Curators can see who is planning to attend.
        </p>
      </div>

      {/* Market rows */}
      <div className="bg-parchment divide-y-[2px] divide-ink">
        {future.map((um, i) => {
          const isAttending = localAttending[um.market.id] ?? um.is_attending
          const thisIsPending = pendingId === um.market.id && isPending
          const statusMeta = getStatusMeta(um.market.status)

          // Days until
          const msUntil =
            new Date(um.market.event_date + 'T00:00:00').getTime() -
            Date.now()
          const daysUntil = Math.ceil(msUntil / 86400_000)

          return (
            <div
              key={um.market.id}
              className={`flex gap-0 transition-colors ${
                isAttending ? 'bg-grove/[0.04]' : 'bg-parchment'
              }`}
            >
              {/* Row number */}
              <div className="w-10 flex-shrink-0 flex items-center justify-center border-r-[2px] border-ink/15 bg-parchment-2">
                <span className="font-display font-black text-2xl text-ink/15 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Date block */}
              <div className="flex-shrink-0 w-24 border-r-[2px] border-ink/15 px-3 py-4 flex flex-col justify-center">
                <p className="font-mono font-bold text-base text-ink leading-none">
                  {formatMarketDate(um.market.event_date)}
                </p>
                <p className="font-tag text-xs tracking-wide uppercase text-ink/35 mt-1">
                  {daysUntil === 1 ? 'TOMORROW' : `${daysUntil}D`}
                </p>
              </div>

              {/* Market info */}
              <div className="flex-1 min-w-0 px-4 py-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-display font-black text-xl uppercase tracking-tight leading-none text-ink">
                    {um.market.space.name}
                  </h3>
                  <span
                    className={`font-tag text-xs tracking-widest uppercase px-2 py-0.5 ${statusMeta.colorClass}`}
                    style={{ border: '1px solid currentColor' }}
                  >
                    {statusMeta.label}
                  </span>
                </div>
                <p className="font-tag text-xs tracking-wide uppercase text-ink/35">
                  📍 {um.market.space.address ?? um.market.space.parish ?? 'Lisbon'}
                  {' · '}
                  {formatTime(um.market.starts_at)}–{formatTime(um.market.ends_at)}
                </p>
              </div>

              {/* Attend toggle */}
              <div className="flex-shrink-0 flex items-center pr-4">
                <button
                  onClick={() => handleToggle(um.market.id, isAttending)}
                  disabled={thisIsPending}
                  className={`
                    font-tag font-bold text-xs tracking-widest uppercase
                    px-3 py-2 border-[2px] transition-all text-center leading-tight
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      isAttending
                        ? 'bg-grove border-grove text-parchment'
                        : 'bg-parchment border-ink text-ink hover:bg-ink hover:text-parchment'
                    }
                  `}
                  style={{
                    boxShadow: isAttending
                      ? '3px 3px 0 0 #0d2e18'
                      : '3px 3px 0 0 #1a1a1a',
                    minWidth: '80px',
                  }}
                >
                  {thisIsPending ? (
                    '...'
                  ) : isAttending ? (
                    <>
                      ✓ GOING
                    </>
                  ) : (
                    <>
                      I WILL
                      <br />
                      BE HERE
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer count */}
      <div className="bg-parchment-2 px-4 py-2 border-t-[2px] border-ink/15">
        <p className="font-tag text-xs tracking-widest uppercase text-ink/25">
          {Object.values(localAttending).filter(Boolean).length} MARKETS CONFIRMED
          {' · '}
          {future.length} TOTAL UPCOMING
        </p>
      </div>
    </div>
  )
}
