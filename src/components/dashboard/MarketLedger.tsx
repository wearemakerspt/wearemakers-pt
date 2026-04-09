'use client'

import { useState, useTransition } from 'react'
import { setMarketStatus, deleteMarket, verifyAttendance } from '@/app/dashboard/curator/actions'
import { formatMarketDate, formatTime, getStatusMeta } from '@/lib/utils'
import type { CuratorMarket } from '@/lib/queries/curator'
import type { MarketStatus } from '@/types/database'

interface Props { markets: CuratorMarket[] }

export default function MarketLedger({ markets: initialMarkets }: Props) {
  const [markets, setMarkets] = useState(initialMarkets)
  const [isPending, startTransition] = useTransition()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function optimisticSetStatus(marketId: string, status: MarketStatus) {
    setMarkets(prev => prev.map(m => m.id === marketId ? { ...m, status } : m))
  }

  function handleStatusChange(marketId: string, newStatus: MarketStatus) {
    const prev = markets.find(m => m.id === marketId)?.status ?? 'scheduled'
    optimisticSetStatus(marketId, newStatus)
    setPendingId(marketId)
    setError(null)
    startTransition(async () => {
      const result = await setMarketStatus(marketId, newStatus)
      if (result?.error) { optimisticSetStatus(marketId, prev); setError(result.error) }
      setPendingId(null)
    })
  }

  function handleDelete(marketId: string) {
    if (!confirm('Delete this market? This cannot be undone.')) return
    setMarkets(prev => prev.filter(m => m.id !== marketId))
    startTransition(async () => {
      const result = await deleteMarket(marketId)
      if (result?.error) { setError(result.error) }
    })
  }

  function handleVerify(attendanceId: string, marketId: string) {
    startTransition(async () => {
      await verifyAttendance(attendanceId)
      setMarkets(prev => prev.map(m => m.id === marketId ? {
        ...m,
        attending_makers: m.attending_makers.map(a =>
          a.attendance_id === attendanceId ? { ...a, is_verified: true } : a
        )
      } : m))
    })
  }

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const statusColors: Record<string, string> = {
    live: 'var(--RED)', community_live: 'var(--GRN)', scheduled: 'rgba(24,22,20,.4)',
    shadow: 'rgba(24,22,20,.2)', cancelled: 'var(--INK)',
  }

  if (markets.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', background: 'var(--P)' }}>
        <div style={{ ...T, color: 'rgba(24,22,20,.25)', lineHeight: 2 }}>
          NO MARKETS SCHEDULED<br />Use "+ ADD NEW MARKET" above to create one.
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ background: 'var(--P)' }}>
      {error && (
        <div style={{ background: 'rgba(200,41,26,.08)', borderLeft: '3px solid var(--RED)', padding: '10px 14px', ...T, fontWeight: 700, color: 'var(--RED)' }}>
          ✗ {error}
        </div>
      )}

      {markets.map((market, i) => {
        const isLive = market.status === 'live' || market.status === 'community_live'
        const isCancelled = market.status === 'cancelled'
        const isExpanded = expandedId === market.id
        const isToday = market.event_date === today
        const thisIsPending = pendingId === market.id && isPending

        return (
          <div key={market.id} style={{ borderBottom: '2px solid var(--INK)', opacity: isCancelled ? 0.5 : 1 }}>
            {/* Main row */}
            <div
              onClick={() => setExpandedId(isExpanded ? null : market.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0', cursor: 'pointer',
                background: isLive ? 'rgba(200,41,26,.04)' : isToday ? 'rgba(24,22,20,.02)' : 'transparent',
                padding: '0',
              }}
            >
              {/* Status stripe */}
              <div style={{ width: '4px', alignSelf: 'stretch', background: statusColors[market.status] ?? 'transparent', flexShrink: 0 }} />

              {/* Row number */}
              <div style={{ width: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', borderRight: '1px solid rgba(24,22,20,.1)' }}>
                <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', color: 'rgba(24,22,20,.15)', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
              </div>

              {/* Date */}
              <div style={{ width: '80px', flexShrink: 0, padding: '12px 10px', borderRight: '1px solid rgba(24,22,20,.1)' }}>
                <div style={{ fontFamily: 'var(--MONO)', fontWeight: 800, fontSize: '13px', color: 'var(--INK)', lineHeight: 1.2 }}>
                  {formatMarketDate(market.event_date)}
                  {(market as any).event_date_end && (
                    <span style={{ display: 'block', fontWeight: 400, fontSize: '11px', color: 'rgba(24,22,20,.5)', marginTop: '1px' }}>
                      → {formatMarketDate((market as any).event_date_end)}
                    </span>
                  )}
                </div>
                {isToday && <div style={{ ...T, fontSize: '8px', color: 'var(--RED)', fontWeight: 700, marginTop: '2px' }}>TODAY</div>}
              </div>

              {/* Space + title */}
              <div style={{ flex: 1, minWidth: 0, padding: '12px 12px' }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {market.space.name}
                </div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>
                  {formatTime(market.starts_at)}–{formatTime(market.ends_at)}
                  {(market as any).event_date_end && ' · MULTI-DAY'}
                  {market.attending_makers.length > 0 && ` · ${market.attending_makers.length} LIVE`}
                </div>
              </div>

              {/* Status badge */}
              <div style={{ flexShrink: 0, padding: '12px 8px' }}>
                <span style={{ ...T, fontSize: '9px', fontWeight: 700, color: statusColors[market.status], border: `1px solid ${statusColors[market.status]}`, padding: '3px 7px' }}>
                  {market.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Expand arrow */}
              <div style={{ width: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(24,22,20,.3)', fontSize: '12px' }}>
                {isExpanded ? '▲' : '▼'}
              </div>
            </div>

            {/* Expanded panel */}
            {isExpanded && (
              <div style={{ borderTop: '2px solid rgba(24,22,20,.1)', background: 'var(--P2)', padding: '14px' }}>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {market.status !== 'live' && market.status !== 'cancelled' && (
                    <button onClick={() => handleStatusChange(market.id, 'live')} disabled={thisIsPending}
                      style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--P)', background: 'var(--RED)', border: '2px solid var(--RED)', padding: '8px 14px', cursor: 'pointer', boxShadow: 'var(--SHD-SM)', opacity: thisIsPending ? 0.5 : 1 }}>
                      ● OPEN MARKET
                    </button>
                  )}
                  {(market.status === 'live' || market.status === 'community_live') && (
                    <button onClick={() => handleStatusChange(market.id, 'scheduled')} disabled={thisIsPending}
                      style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--INK)', background: 'var(--P)', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer', boxShadow: 'var(--SHD-SM)', opacity: thisIsPending ? 0.5 : 1 }}>
                      ○ CLOSE MARKET
                    </button>
                  )}
                  {market.status !== 'cancelled' && (
                    <button onClick={() => handleStatusChange(market.id, 'cancelled')} disabled={thisIsPending}
                      style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'rgba(24,22,20,.5)', background: 'transparent', border: '2px solid rgba(24,22,20,.2)', padding: '8px 14px', cursor: 'pointer', opacity: thisIsPending ? 0.5 : 1 }}>
                      ✕ CANCEL
                    </button>
                  )}
                  <button onClick={() => handleDelete(market.id)} disabled={thisIsPending}
                    style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', background: 'transparent', border: '1px dashed rgba(24,22,20,.2)', padding: '8px 12px', cursor: 'pointer', marginLeft: 'auto' }}>
                    DELETE
                  </button>
                </div>

                {/* Checked-in makers */}
                {market.attending_makers.length > 0 ? (
                  <div>
                    <div style={{ ...T, fontWeight: 700, color: 'var(--GRN)', fontSize: '10px', marginBottom: '8px' }}>
                      ● {market.attending_makers.length} MAKER{market.attending_makers.length !== 1 ? 'S' : ''} CHECKED IN
                    </div>
                    {market.attending_makers.map(maker => (
                      <div key={maker.attendance_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', border: '1px solid rgba(24,22,20,.15)', background: 'var(--P)', marginBottom: '6px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>
                            {maker.display_name}
                          </div>
                          {maker.stall_label && maker.stall_label !== 'INTENT' && (
                            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>STALL {maker.stall_label}</div>
                          )}
                        </div>
                        {maker.is_verified ? (
                          <span style={{ ...T, fontSize: '9px', fontWeight: 700, color: 'var(--GRN)' }}>✓ VERIFIED</span>
                        ) : (
                          <button onClick={() => handleVerify(maker.attendance_id, market.id)}
                            style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.5)', background: 'transparent', border: '1px dashed rgba(24,22,20,.3)', padding: '4px 8px', cursor: 'pointer' }}>
                            VERIFY
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>
                    No makers checked in yet. Open the market first.
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
