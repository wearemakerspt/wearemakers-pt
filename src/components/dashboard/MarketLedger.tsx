'use client'

import { useState, useTransition } from 'react'
import { setMarketStatus, deleteMarket, verifyAttendance } from '@/app/dashboard/curator/actions'
import { formatMarketDate, formatTime, getStatusMeta } from '@/lib/utils'
import type { CuratorMarket } from '@/lib/queries/curator'
import type { MarketStatus } from '@/types/database'

interface Props {
  markets: CuratorMarket[]
}

export default function MarketLedger({ markets: initialMarkets }: Props) {
  const [markets, setMarkets] = useState(initialMarkets)
  const [isPending, startTransition] = useTransition()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function optimisticSetStatus(marketId: string, status: MarketStatus) {
    setMarkets((prev) =>
      prev.map((m) => (m.id === marketId ? { ...m, status } : m))
    )
  }

  function handleStatusChange(marketId: string, newStatus: MarketStatus) {
    const prev = markets.find((m) => m.id === marketId)?.status ?? 'scheduled'
    optimisticSetStatus(marketId, newStatus)
    setPendingId(marketId)
    setError(null)

    startTransition(async () => {
      const result = await setMarketStatus(marketId, newStatus)
      if (result?.error) {
        optimisticSetStatus(marketId, prev) // revert
        setError(result.error)
      }
      setPendingId(null)
    })
  }

  function handleDelete(marketId: string) {
    if (!confirm('Delete this market? This cannot be undone.')) return
    setMarkets((prev) => prev.filter((m) => m.id !== marketId))
    startTransition(async () => {
      const result = await deleteMarket(marketId)
      if (result?.error) {
        setError(result.error)
        // Reload would be needed to restore — Server Component will re-render on next visit
      }
    })
  }

  function handleVerify(attendanceId: string, marketId: string, makerName: string) {
    setMarkets((prev) =>
      prev.map((m) => {
        if (m.id !== marketId) return m
        return {
          ...m,
          attending_makers: m.attending_makers.map((mk) =>
            mk.attendance_id === attendanceId ? { ...mk } : mk
          ),
        }
      })
    )
    startTransition(async () => {
      await verifyAttendance(attendanceId)
    })
  }

  if (markets.length === 0) {
    return (
      <div className="bg-parchment p-8 text-center border-t-[2px] border-ink/10">
        <p className="font-tag text-xs tracking-widest uppercase text-ink/25 leading-loose">
          NO MARKETS SCHEDULED IN THE NEXT 60 DAYS
          <br />
          Use &ldquo;+ ADD NEW MARKET&rdquo; above to create one.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Error banner */}
      {error && (
        <div className="bg-stamp/10 border-l-[3px] border-stamp px-4 py-3">
          <p className="font-tag text-xs tracking-wide uppercase text-stamp font-bold">
            ✗ {error}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-ink">
              {['#', 'DATE', 'SPACE', 'TIME', 'STATUS', 'CHECKINS', 'ACTIONS'].map(
                (h) => (
                  <th
                    key={h}
                    className="font-tag text-xs tracking-[0.14em] uppercase text-parchment/50 text-left px-3 py-3 border-r border-parchment/8 last:border-r-0 whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y-[2px] divide-ink">
            {markets.map((market, i) => {
              const statusMeta = getStatusMeta(market.status)
              const isLive =
                market.status === 'live' || market.status === 'community_live'
              const isCancelled = market.status === 'cancelled'
              const isExpanded = expandedId === market.id
              const thisIsPending = pendingId === market.id && isPending
              const today = new Date().toISOString().split('T')[0]
              const isToday = market.event_date === today

              return (
                <>
                  {/* Main row */}
                  <tr
                    key={market.id}
                    className={`transition-colors cursor-pointer ${
                      isCancelled
                        ? 'bg-stamp/8'
                        : isLive
                        ? 'bg-grove/5'
                        : isToday
                        ? 'bg-ink/4'
                        : 'bg-parchment'
                    } hover:bg-parchment-2`}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : market.id)
                    }
                  >
                    {/* # */}
                    <td className="px-3 py-3 border-r border-ink/8">
                      <span className="font-display font-black text-xl text-ink/15 leading-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3 border-r border-ink/8 whitespace-nowrap">
                      <p className="font-mono font-bold text-sm text-ink leading-none">
                        {formatMarketDate(market.event_date)}
                      </p>
                      {isToday && (
                        <span className="font-tag text-xs tracking-widest uppercase text-stamp font-bold">
                          TODAY
                        </span>
                      )}
                    </td>

                    {/* Space */}
                    <td className="px-3 py-3 border-r border-ink/8 min-w-[160px]">
                      <p className="font-display font-black text-lg uppercase tracking-tight leading-none text-ink">
                        {market.space.name}
                      </p>
                      <p className="font-tag text-xs tracking-wide uppercase text-ink/35 mt-0.5">
                        {market.space.parish ?? market.space.address ?? ''}
                      </p>
                    </td>

                    {/* Time */}
                    <td className="px-3 py-3 border-r border-ink/8 whitespace-nowrap">
                      <span className="font-mono font-bold text-sm text-ink/60">
                        {formatTime(market.starts_at)}–{formatTime(market.ends_at)}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-3 py-3 border-r border-ink/8">
                      <span
                        className={`font-tag font-bold text-xs tracking-widest uppercase px-2 py-1 border ${statusMeta.colorClass}`}
                        style={{ borderColor: 'currentColor' }}
                      >
                        {thisIsPending ? '...' : statusMeta.label}
                      </span>
                    </td>

                    {/* Checkins */}
                    <td className="px-3 py-3 border-r border-ink/8 text-center">
                      <span
                        className={`font-display font-black text-2xl leading-none ${
                          market.checkin_count > 0 ? 'text-grove' : 'text-ink/20'
                        }`}
                      >
                        {String(market.checkin_count).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {/* Go Live / Stop */}
                        {!isCancelled && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                market.id,
                                isLive ? 'scheduled' : 'live'
                              )
                            }
                            disabled={thisIsPending}
                            className={`font-tag font-bold text-xs tracking-widest uppercase px-3 py-2 border-[2px] transition-colors whitespace-nowrap ${
                              isLive
                                ? 'bg-grove border-grove text-parchment hover:bg-stamp hover:border-stamp'
                                : 'bg-parchment border-ink text-ink hover:bg-ink hover:text-parchment'
                            } disabled:opacity-40`}
                            style={{ boxShadow: '2px 2px 0 0 #1a1a1a' }}
                          >
                            {isLive ? '■ STOP' : '● GO LIVE'}
                          </button>
                        )}

                        {/* Cancel / Restore */}
                        <button
                          onClick={() =>
                            handleStatusChange(
                              market.id,
                              isCancelled ? 'scheduled' : 'cancelled'
                            )
                          }
                          disabled={thisIsPending}
                          className={`font-tag font-bold text-xs tracking-widest uppercase px-3 py-2 border-[2px] transition-colors whitespace-nowrap ${
                            isCancelled
                              ? 'bg-parchment border-ink text-ink hover:bg-ink hover:text-parchment'
                              : 'bg-parchment border-ink/30 text-ink/40 hover:border-stamp hover:text-stamp'
                          } disabled:opacity-40`}
                          style={{ boxShadow: isCancelled ? '2px 2px 0 0 #1a1a1a' : 'none' }}
                        >
                          {isCancelled ? '↺ RESTORE' : '☂ CANCEL'}
                        </button>

                        {/* Delete (scheduled only) */}
                        {market.status === 'scheduled' && (
                          <button
                            onClick={() => handleDelete(market.id)}
                            disabled={isPending}
                            className="font-tag text-xs tracking-widest uppercase text-ink/25 px-2 py-2 border-[2px] border-transparent hover:border-stamp hover:text-stamp transition-colors disabled:opacity-40"
                            title="Delete market"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded maker row */}
                  {isExpanded && (
                    <tr key={`${market.id}-expanded`}>
                      <td
                        colSpan={7}
                        className="bg-parchment-2 px-3 py-3 border-t border-dashed border-ink/20"
                      >
                        {market.attending_makers.length === 0 ? (
                          <p className="font-tag text-xs tracking-widest uppercase text-ink/25">
                            No makers checked in yet.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="font-tag font-bold text-xs tracking-[0.18em] uppercase text-ink/40 mb-2">
                              MAKERS CHECKED IN NOW
                            </p>
                            {market.attending_makers.map((mk) => (
                              <div
                                key={mk.id}
                                className="flex items-center gap-3 bg-parchment border-[2px] border-ink/10 px-3 py-2"
                              >
                                <div className="w-8 h-8 bg-ink flex items-center justify-center flex-shrink-0">
                                  <span className="font-display font-black text-sm text-stamp">
                                    {mk.display_name.slice(0, 2).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-display font-black text-lg uppercase tracking-tight leading-none text-ink">
                                    {mk.display_name}
                                    {mk.is_verified && (
                                      <span className="ml-2 font-tag font-normal text-xs text-ink/40">
                                        ✦ PRO
                                      </span>
                                    )}
                                  </p>
                                  {mk.stall_label && (
                                    <p className="font-tag text-xs tracking-wide uppercase text-ink/35">
                                      Stall {mk.stall_label}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() =>
                                    handleVerify(
                                      mk.attendance_id,
                                      market.id,
                                      mk.display_name
                                    )
                                  }
                                  className="font-tag font-bold text-xs tracking-widest uppercase text-grove border-[2px] border-grove px-3 py-1.5 hover:bg-grove hover:text-parchment transition-colors"
                                  style={{ boxShadow: '2px 2px 0 0 #0d2e18' }}
                                >
                                  ✓ VERIFY
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
