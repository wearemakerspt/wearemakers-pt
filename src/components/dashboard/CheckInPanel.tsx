'use client'

import { useState, useTransition } from 'react'
import { checkInToMarket, checkOutOfMarket } from '@/app/dashboard/maker/actions'
import { formatTime } from '@/lib/utils'
import type { AttendedMarket, UpcomingMarket } from '@/lib/queries/maker'

interface Props {
  activeCheckins: AttendedMarket[]
  todayMarkets: UpcomingMarket[]
}

export default function CheckInPanel({ activeCheckins, todayMarkets }: Props) {
  const [isPending, startTransition] = useTransition()
  const [checkingInTo, setCheckingInTo] = useState<string | null>(null)
  const [stallInput, setStallInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleCheckIn(marketId: string) {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('market_id', marketId)
      fd.set('stall_label', stallInput)
      const result = await checkInToMarket(fd)
      if (result?.error) setError(result.error)
      else setCheckingInTo(null)
    })
  }

  function handleCheckOut(attendanceId: string) {
    setError(null)
    startTransition(async () => {
      const result = await checkOutOfMarket(attendanceId)
      if (result?.error) setError(result.error)
    })
  }

  // Markets available to check in to (not already checked in)
  const checkedInMarketIds = new Set(activeCheckins.map((c) => c.market.id))
  const availableToday = todayMarkets.filter(
    (um) => !checkedInMarketIds.has(um.market.id)
  )

  return (
    <div style={{ border: '3px solid #1a1a1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between bg-ink px-4 py-3 border-b-[3px] border-ink">
        <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
          §3 — MARKET CHECK-IN
        </span>
        <span className="font-tag text-xs text-parchment/30 tracking-[0.06em]">FP-003</span>
      </div>

      <div className="bg-parchment divide-y-[2px] divide-ink/15">
        {/* Active check-ins */}
        {activeCheckins.length > 0 && (
          <div className="p-5">
            <p className="font-tag font-bold text-xs tracking-[0.2em] uppercase text-grove mb-3">
              ● CURRENTLY CHECKED IN
            </p>
            <div className="space-y-3">
              {activeCheckins.map((checkin) => (
                <div
                  key={checkin.attendance_id}
                  className="flex items-center gap-4 border-[2px] border-grove bg-grove/5 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-black text-xl uppercase tracking-tight leading-none text-ink mb-1">
                      {checkin.market.space.name}
                    </p>
                    <p className="font-tag text-xs tracking-wide uppercase text-ink/40">
                      {formatTime(checkin.market.starts_at)}–
                      {formatTime(checkin.market.ends_at)}
                      {checkin.stall_label &&
                        checkin.stall_label !== 'INTENT' && (
                          <> · STALL {checkin.stall_label}</>
                        )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCheckOut(checkin.attendance_id)}
                    disabled={isPending}
                    className="font-tag font-bold text-xs tracking-widest uppercase text-ink border-[2px] border-ink px-3 py-2 hover:bg-ink hover:text-parchment transition-colors disabled:opacity-50"
                    style={{ boxShadow: '2px 2px 0 0 #1a1a1a' }}
                  >
                    CHECK OUT
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available markets to check in */}
        {availableToday.length > 0 ? (
          <div className="p-5">
            <p className="font-tag font-bold text-xs tracking-[0.2em] uppercase text-ink/40 mb-3">
              TODAY&apos;S MARKETS — TAP TO CHECK IN
            </p>
            <div className="space-y-3">
              {availableToday.map((um) => {
                const isExpanded = checkingInTo === um.market.id
                return (
                  <div key={um.market.id} style={{ border: '2px solid #1a1a1a' }}>
                    {/* Market row */}
                    <button
                      onClick={() =>
                        setCheckingInTo(isExpanded ? null : um.market.id)
                      }
                      className="w-full flex items-center gap-3 p-3 hover:bg-parchment-2 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-black text-xl uppercase tracking-tight leading-none text-ink">
                          {um.market.space.name}
                        </p>
                        <p className="font-tag text-xs tracking-wide uppercase text-ink/40 mt-0.5">
                          📍 {um.market.space.address ?? um.market.space.parish ?? 'Lisbon'}
                          {' · '}
                          {formatTime(um.market.starts_at)}–
                          {formatTime(um.market.ends_at)}
                        </p>
                      </div>
                      <div
                        className={`font-tag text-xs tracking-widest uppercase px-3 py-1.5 border-[2px] ${
                          um.market.status === 'live' ||
                          um.market.status === 'community_live'
                            ? 'border-stamp text-stamp bg-stamp/5'
                            : 'border-ink/30 text-ink/40'
                        }`}
                      >
                        {um.market.status === 'live'
                          ? '● LIVE'
                          : um.market.status === 'community_live'
                          ? '● COMM'
                          : 'SCHED'}
                      </div>
                    </button>

                    {/* Expanded check-in form */}
                    {isExpanded && (
                      <div className="border-t-[2px] border-ink bg-parchment-2 p-3">
                        <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
                          Stall Reference (optional)
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={stallInput}
                            onChange={(e) => setStallInput(e.target.value)}
                            placeholder="e.g. A-1, Unit 7"
                            className="flex-1 bg-transparent border-b-[2px] border-dashed border-ink px-0 py-2 font-mono text-base text-ink placeholder:text-ink/25 focus:outline-none focus:border-solid transition-all"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          />
                          <button
                            onClick={() => handleCheckIn(um.market.id)}
                            disabled={isPending}
                            className="font-tag font-bold text-xs tracking-widest uppercase text-parchment bg-stamp border-[2px] border-stamp px-4 py-2 hover:bg-ink hover:border-ink transition-colors disabled:opacity-50 stamp-noise"
                            style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}
                          >
                            {isPending ? 'CHECKING IN...' : 'CHECK IN →'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          activeCheckins.length === 0 && (
            <div className="p-5 text-center">
              <p className="font-tag text-xs tracking-widest uppercase text-ink/25 leading-loose">
                NO MARKETS SCHEDULED TODAY
                <br />
                Use the agenda below to declare intent
              </p>
            </div>
          )
        )}

        {error && (
          <div className="px-5 py-3 border-l-[3px] border-stamp">
            <p className="font-tag text-xs tracking-wide uppercase text-stamp font-bold">
              ✗ {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
