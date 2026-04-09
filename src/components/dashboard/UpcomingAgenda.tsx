'use client'

import { useTransition, useState } from 'react'
import { toggleAttendanceIntent } from '@/app/dashboard/maker/actions'
import { formatMarketDate, formatTime } from '@/lib/utils'
import type { UpcomingMarket } from '@/lib/queries/maker'

interface Props { markets: UpcomingMarket[] }

function getDaysInRange(startDate: string, endDate: string): string[] {
  const days: string[] = []
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  const cur = new Date(start)
  while (cur <= end) {
    days.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function formatShortDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
}

function formatDateRange(start: string, end: string | null): string {
  if (!end) return formatMarketDate(start)
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const sDay = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()
  const eDay = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
  return `${sDay} → ${eDay}`
}

export default function UpcomingAgenda({ markets }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [localAttending, setLocalAttending] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(markets.map(um => [um.market.id, um.is_attending]))
  )
  // For range markets: selected days per market
  const [selectedDays, setSelectedDays] = useState<Record<string, Set<string>>>({})
  const [expandedRangeId, setExpandedRangeId] = useState<string | null>(null)

  function handleToggle(marketId: string, currentlyAttending: boolean) {
    setLocalAttending(prev => ({ ...prev, [marketId]: !currentlyAttending }))
    setPendingId(marketId)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('market_id', marketId)
      fd.set('is_attending', String(currentlyAttending))
      const result = await toggleAttendanceIntent(fd)
      if (result?.error) setLocalAttending(prev => ({ ...prev, [marketId]: currentlyAttending }))
      setPendingId(null)
    })
  }

  function toggleDay(marketId: string, day: string) {
    setSelectedDays(prev => {
      const current = new Set(prev[marketId] ?? [])
      if (current.has(day)) current.delete(day)
      else current.add(day)
      return { ...prev, [marketId]: current }
    })
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const future = markets.filter(um => {
    const endDate = (um.market as any).event_date_end ?? um.market.event_date
    return endDate >= todayStr
  })

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  if (future.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: 'var(--P)' }}>
        <div style={{ ...T, color: 'rgba(24,22,20,.25)', lineHeight: 2 }}>
          NO MARKETS SCHEDULED IN THE NEXT 60 DAYS<br />
          The curator will announce new dates soon.
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--P)' }}>
      <div style={{ background: 'var(--P2)', padding: '8px 14px', borderBottom: '2px solid rgba(24,22,20,.15)' }}>
        <div style={{ ...T, color: 'rgba(24,22,20,.4)' }}>
          Declare intent for future markets. Curators can see who is planning to attend.
        </div>
      </div>

      {future.map((um, i) => {
        const isAttending = localAttending[um.market.id] ?? um.is_attending
        const thisIsPending = pendingId === um.market.id && isPending
        const eventDateEnd = (um.market as any).event_date_end as string | null
        const isRange = !!eventDateEnd
        const isExpanded = expandedRangeId === um.market.id
        const days = isRange ? getDaysInRange(um.market.event_date, eventDateEnd!) : []
        const mySelectedDays = selectedDays[um.market.id] ?? new Set<string>()

        const msUntil = new Date(um.market.event_date + 'T00:00:00').getTime() - Date.now()
        const daysUntil = Math.ceil(msUntil / 86400000)

        return (
          <div key={um.market.id} style={{ borderBottom: '2px solid var(--INK)', background: isAttending ? 'rgba(26,92,48,.04)' : 'var(--P)' }}>

            {/* Main row */}
            <div style={{ display: 'flex', gap: 0 }}>
              {/* Row number */}
              <div style={{ width: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '2px solid rgba(24,22,20,.15)', background: 'var(--P2)' }}>
                <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', color: 'rgba(24,22,20,.15)', lineHeight: 1 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Date */}
              <div style={{ flexShrink: 0, width: isRange ? '120px' : '88px', borderRight: '2px solid rgba(24,22,20,.15)', padding: '12px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--MONO)', fontWeight: 800, fontSize: isRange ? '12px' : '14px', color: 'var(--INK)', lineHeight: 1.3 }}>
                  {isRange ? formatDateRange(um.market.event_date, eventDateEnd) : formatMarketDate(um.market.event_date)}
                </div>
                <div style={{ ...T, color: 'rgba(24,22,20,.35)', marginTop: '3px', fontSize: '10px' }}>
                  {isRange ? `${days.length} DAYS` : daysUntil === 1 ? 'TOMORROW' : `${daysUntil}D`}
                </div>
              </div>

              {/* Market info */}
              <div style={{ flex: 1, minWidth: 0, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1 }}>
                    {um.market.space.name}
                  </div>
                  {isRange && (
                    <span style={{ ...T, fontSize: '9px', fontWeight: 700, color: 'var(--RED)', border: '1px solid var(--RED)', padding: '2px 6px' }}>
                      MULTI-DAY
                    </span>
                  )}
                </div>
                <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.35)' }}>
                  📍 {um.market.space.address ?? um.market.space.parish ?? 'Lisbon'} · {formatTime(um.market.starts_at)}–{formatTime(um.market.ends_at)}
                </div>
                {isRange && isAttending && mySelectedDays.size > 0 && (
                  <div style={{ ...T, fontSize: '9px', color: 'var(--GRN)', fontWeight: 700, marginTop: '4px' }}>
                    ✓ {mySelectedDays.size} DAY{mySelectedDays.size !== 1 ? 'S' : ''} SELECTED
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px' }}>
                {isRange && (
                  <button
                    onClick={() => setExpandedRangeId(isExpanded ? null : um.market.id)}
                    style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.5)', background: 'transparent', border: '1px dashed rgba(24,22,20,.3)', padding: '6px 10px', cursor: 'pointer' }}
                  >
                    {isExpanded ? 'HIDE' : 'DAYS'}
                  </button>
                )}
                <button
                  onClick={() => handleToggle(um.market.id, isAttending)}
                  disabled={thisIsPending}
                  style={{
                    ...T, fontWeight: 700, padding: '8px 12px', border: '2px solid', minWidth: '80px',
                    textAlign: 'center', cursor: 'pointer', lineHeight: 1.3,
                    background: isAttending ? 'var(--GRN)' : 'var(--P)',
                    borderColor: isAttending ? 'var(--GRN)' : 'var(--INK)',
                    color: isAttending ? '#fff' : 'var(--INK)',
                    boxShadow: isAttending ? '3px 3px 0 0 #0d2e18' : 'var(--SHD-SM)',
                    opacity: thisIsPending ? 0.5 : 1,
                    fontSize: '10px',
                  }}
                >
                  {thisIsPending ? '...' : isAttending ? '✓ GOING' : 'I WILL\nBE HERE'}
                </button>
              </div>
            </div>

            {/* Day picker for range markets */}
            {isRange && isExpanded && (
              <div style={{ borderTop: '1px dashed rgba(24,22,20,.15)', background: 'var(--P2)', padding: '12px 14px' }}>
                <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>
                  SELECT WHICH DAYS YOU'LL BE THERE
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {days.map(day => {
                    const isSelected = mySelectedDays.has(day)
                    const isPast = day < todayStr
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => !isPast && toggleDay(um.market.id, day)}
                        disabled={isPast}
                        style={{
                          ...T, fontSize: '9px', padding: '6px 10px',
                          border: `2px solid ${isSelected ? 'var(--GRN)' : 'rgba(24,22,20,.2)'}`,
                          background: isSelected ? 'var(--GRN)' : 'transparent',
                          color: isSelected ? '#fff' : isPast ? 'rgba(24,22,20,.2)' : 'rgba(24,22,20,.6)',
                          cursor: isPast ? 'not-allowed' : 'pointer',
                          opacity: isPast ? 0.4 : 1,
                        }}
                      >
                        {isSelected ? '✓ ' : ''}{formatShortDate(day)}
                      </button>
                    )
                  })}
                </div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.3)', marginTop: '10px' }}>
                  {mySelectedDays.size > 0
                    ? `${mySelectedDays.size} OF ${days.length} DAYS SELECTED`
                    : 'TAP DAYS TO MARK WHEN YOU WILL BE THERE'}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div style={{ background: 'var(--P2)', padding: '8px 14px', borderTop: '2px solid rgba(24,22,20,.15)' }}>
        <div style={{ ...T, color: 'rgba(24,22,20,.25)', fontSize: '10px' }}>
          {Object.values(localAttending).filter(Boolean).length} MARKETS CONFIRMED · {future.length} TOTAL UPCOMING
        </div>
      </div>
    </div>
  )
}
