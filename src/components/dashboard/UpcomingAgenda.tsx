'use client'

import { useTransition, useState } from 'react'
import { toggleAttendanceIntent } from '@/app/dashboard/maker/actions'
import { formatTime } from '@/lib/utils'
import type { UpcomingMarket } from '@/lib/queries/maker'

interface Props { markets: UpcomingMarket[] }

function formatShortDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  }).toUpperCase()
}

function formatMonthHeader(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric'
  }).toUpperCase()
}

function formatDateRange(start: string, end: string | null): string {
  if (!end) return formatShortDate(start)
  const s = new Date(start + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()
  const e = new Date(end + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()
  return `${s} → ${e}`
}

function getDaysInRange(start: string, end: string): string[] {
  const days: string[] = []
  const cur = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  while (cur <= endDate) {
    days.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7) // "2026-05"
}

function isThisMonthOrSoon(dateStr: string, todayStr: string): boolean {
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date(todayStr + 'T00:00:00')
  // This month + next 14 days
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() + 14)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const boundary = monthEnd > cutoff ? monthEnd : cutoff
  return target <= boundary
}

export default function UpcomingAgenda({ markets }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [localAttending, setLocalAttending] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(markets.map(um => [um.market.id, um.is_attending]))
  )
  const [selectedDays, setSelectedDays] = useState<Record<string, Set<string>>>({})
  const [expandedRangeId, setExpandedRangeId] = useState<string | null>(null)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())

  const todayStr = new Date().toISOString().split('T')[0]

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

  function toggleMonth(monthKey: string) {
    setExpandedMonths(prev => {
      const next = new Set(prev)
      if (next.has(monthKey)) next.delete(monthKey)
      else next.add(monthKey)
      return next
    })
  }

  // Filter to future markets only
  const future = markets.filter(um => {
    const endDate = (um.market as any).event_date_end ?? um.market.event_date
    return endDate >= todayStr
  })

  // Split into near-term and future months
  const nearTerm = future.filter(um => isThisMonthOrSoon(um.market.event_date, todayStr))
  const laterMarkets = future.filter(um => !isThisMonthOrSoon(um.market.event_date, todayStr))

  // Group later markets by month
  const byMonth: Record<string, UpcomingMarket[]> = {}
  laterMarkets.forEach(um => {
    const key = getMonthKey(um.market.event_date)
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(um)
  })
  const monthKeys = Object.keys(byMonth).sort()

  const totalConfirmed = Object.values(localAttending).filter(Boolean).length
  const nearTermConfirmed = nearTerm.filter(um => localAttending[um.market.id]).length

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  if (future.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: 'var(--P)' }}>
        <div style={{ ...T, color: 'rgba(24,22,20,.25)', lineHeight: 2 }}>
          NO MARKETS SCHEDULED YET<br />
          The curator will announce dates soon.
        </div>
      </div>
    )
  }

  // Render a single market row — used for both near-term and future months
  function MarketRow({ um, compact = false }: { um: UpcomingMarket; compact?: boolean }) {
    const isAttending = localAttending[um.market.id] ?? um.is_attending
    const thisIsPending = pendingId === um.market.id && isPending
    const eventDateEnd = (um.market as any).event_date_end as string | null
    const isRange = !!eventDateEnd
    const isExpanded = expandedRangeId === um.market.id
    const days = isRange ? getDaysInRange(um.market.event_date, eventDateEnd!) : []
    const mySelectedDays = selectedDays[um.market.id] ?? new Set<string>()
    const msUntil = new Date(um.market.event_date + 'T00:00:00').getTime() - Date.now()
    const daysUntil = Math.ceil(msUntil / 86400000)
    const isToday = um.market.event_date === todayStr

    return (
      <div style={{ borderBottom: '2px solid var(--INK)', background: isAttending ? 'rgba(26,92,48,.04)' : 'var(--P)' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Date */}
          <div style={{
            flexShrink: 0, width: compact ? '90px' : (isRange ? '110px' : '88px'),
            borderRight: '2px solid rgba(24,22,20,.15)',
            padding: compact ? '8px 8px' : '12px 10px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <div style={{ fontFamily: 'var(--MONO)', fontWeight: 800, fontSize: compact ? '11px' : '13px', color: isToday ? 'var(--RED)' : 'var(--INK)', lineHeight: 1.3 }}>
              {isRange ? formatDateRange(um.market.event_date, eventDateEnd) : formatShortDate(um.market.event_date)}
            </div>
            <div style={{ ...T, color: isToday ? 'var(--RED)' : 'rgba(24,22,20,.35)', marginTop: '2px', fontSize: '9px', fontWeight: isToday ? 700 : 400 }}>
              {isToday ? 'TODAY' : isRange ? `${days.length}D` : daysUntil === 1 ? 'TOMORROW' : `${daysUntil}D`}
            </div>
          </div>

          {/* Market info */}
          <div style={{ flex: 1, minWidth: 0, padding: compact ? '8px 10px' : '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: compact ? '16px' : '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1 }}>
                {um.market.space.name}
              </div>
              {isRange && !compact && (
                <span style={{ ...T, fontSize: '9px', fontWeight: 700, color: 'var(--RED)', border: '1px solid var(--RED)', padding: '2px 5px' }}>
                  MULTI-DAY
                </span>
              )}
            </div>
            {!compact && (
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)' }}>
                📍 {um.market.space.address ?? um.market.space.parish ?? 'Lisbon'} · {formatTime(um.market.starts_at)}–{formatTime(um.market.ends_at)}
              </div>
            )}
            {isAttending && mySelectedDays.size > 0 && (
              <div style={{ ...T, fontSize: '9px', color: 'var(--GRN)', fontWeight: 700, marginTop: '2px' }}>
                ✓ {mySelectedDays.size} DAY{mySelectedDays.size !== 1 ? 'S' : ''} SELECTED
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', padding: '0 10px' }}>
            {isRange && (
              <button onClick={() => setExpandedRangeId(isExpanded ? null : um.market.id)}
                style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.5)', background: 'transparent', border: '1px dashed rgba(24,22,20,.3)', padding: '5px 8px', cursor: 'pointer' }}>
                {isExpanded ? 'HIDE' : 'DAYS'}
              </button>
            )}
            <button
              onClick={() => handleToggle(um.market.id, isAttending)}
              disabled={thisIsPending}
              style={{
                ...T, fontWeight: 700, padding: compact ? '6px 8px' : '8px 10px',
                border: '2px solid', minWidth: compact ? '60px' : '76px',
                textAlign: 'center', cursor: 'pointer', lineHeight: 1.2, fontSize: '9px',
                background: isAttending ? 'var(--GRN)' : 'var(--P)',
                borderColor: isAttending ? 'var(--GRN)' : 'var(--INK)',
                color: isAttending ? '#fff' : 'var(--INK)',
                boxShadow: isAttending ? '2px 2px 0 0 #0d2e18' : 'var(--SHD-SM)',
                opacity: thisIsPending ? 0.5 : 1,
              }}
            >
              {thisIsPending ? '...' : isAttending ? '✓ GOING' : 'I WILL\nBE HERE'}
            </button>
          </div>
        </div>

        {/* Day picker for range markets */}
        {isRange && isExpanded && (
          <div style={{ borderTop: '1px dashed rgba(24,22,20,.15)', background: 'var(--P2)', padding: '10px 14px' }}>
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>
              SELECT WHICH DAYS YOU'LL BE THERE
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {days.map(day => {
                const isSelected = mySelectedDays.has(day)
                const isPast = day < todayStr
                return (
                  <button key={day} type="button" onClick={() => !isPast && toggleDay(um.market.id, day)} disabled={isPast}
                    style={{
                      ...T, fontSize: '9px', padding: '5px 8px',
                      border: `2px solid ${isSelected ? 'var(--GRN)' : 'rgba(24,22,20,.2)'}`,
                      background: isSelected ? 'var(--GRN)' : 'transparent',
                      color: isSelected ? '#fff' : isPast ? 'rgba(24,22,20,.2)' : 'rgba(24,22,20,.6)',
                      cursor: isPast ? 'not-allowed' : 'pointer', opacity: isPast ? 0.4 : 1,
                    }}>
                    {isSelected ? '✓ ' : ''}{formatShortDate(day)}
                  </button>
                )
              })}
            </div>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.3)', marginTop: '8px' }}>
              {mySelectedDays.size > 0 ? `${mySelectedDays.size} OF ${days.length} DAYS SELECTED` : 'TAP DAYS TO MARK WHEN YOU WILL BE THERE'}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--P)' }}>

      {/* Instruction strip */}
      <div style={{ background: 'var(--P2)', padding: '8px 14px', borderBottom: '2px solid rgba(24,22,20,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)' }}>
          Declare intent — curators see who is planning to attend.
        </div>
        <div style={{ ...T, fontSize: '10px', fontWeight: 700, color: totalConfirmed > 0 ? 'var(--GRN)' : 'rgba(24,22,20,.25)' }}>
          {totalConfirmed} CONFIRMED
        </div>
      </div>

      {/* ── NEAR TERM — this month + next 14 days ── */}
      {nearTerm.length > 0 && (
        <>
          <div style={{ background: 'var(--INK)', padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'rgba(240,236,224,.6)' }}>
              THIS MONTH
            </div>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.3)' }}>
              {nearTermConfirmed}/{nearTerm.length} CONFIRMED
            </div>
          </div>
          {nearTerm.map(um => <MarketRow key={um.market.id} um={um} />)}
        </>
      )}

      {/* ── FUTURE MONTHS — grouped, collapsed ── */}
      {monthKeys.map(monthKey => {
        const monthMarkets = byMonth[monthKey]
        const isExpanded = expandedMonths.has(monthKey)
        const confirmedInMonth = monthMarkets.filter(um => localAttending[um.market.id]).length

        return (
          <div key={monthKey}>
            {/* Month header — clickable */}
            <button
              onClick={() => toggleMonth(monthKey)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'var(--P2)',
                border: 'none', borderTop: '2px solid rgba(24,22,20,.15)',
                borderBottom: isExpanded ? '2px solid rgba(24,22,20,.15)' : 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ ...T, fontWeight: 700, fontSize: '11px', color: 'var(--INK)' }}>
                  {formatMonthHeader(monthKey + '-01')}
                </div>
                <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)' }}>
                  {monthMarkets.length} MARKET{monthMarkets.length !== 1 ? 'S' : ''}
                </div>
                {confirmedInMonth > 0 && (
                  <div style={{ ...T, fontSize: '9px', fontWeight: 700, color: 'var(--GRN)' }}>
                    ✓ {confirmedInMonth} GOING
                  </div>
                )}
              </div>
              <div style={{ ...T, fontSize: '12px', color: 'rgba(24,22,20,.4)' }}>
                {isExpanded ? '▲' : '▼'}
              </div>
            </button>

            {/* Expanded month markets — compact rows */}
            {isExpanded && monthMarkets.map(um => (
              <MarketRow key={um.market.id} um={um} compact />
            ))}
          </div>
        )
      })}

      {/* Footer */}
      <div style={{ background: 'var(--P2)', padding: '8px 14px', borderTop: '2px solid rgba(24,22,20,.15)' }}>
        <div style={{ ...T, color: 'rgba(24,22,20,.25)', fontSize: '10px' }}>
          {totalConfirmed} MARKETS CONFIRMED · {future.length} TOTAL · {monthKeys.length > 0 ? `${monthKeys.length} FUTURE MONTH${monthKeys.length !== 1 ? 'S' : ''} COLLAPSED` : 'ALL SHOWN'}
        </div>
      </div>
    </div>
  )
}
