'use client'

import { useTransition, useState } from 'react'
import { toggleAttendanceIntent } from '@/app/dashboard/maker/actions'
import { formatMarketDate, formatTime } from '@/lib/utils'
import type { UpcomingMarket } from '@/lib/queries/maker'

interface Props { markets: UpcomingMarket[] }

export default function UpcomingAgenda({ markets }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [localAttending, setLocalAttending] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(markets.map(um => [um.market.id, um.is_attending]))
  )

  function handleToggle(marketId: string, currentlyAttending: boolean) {
    setLocalAttending(prev => ({ ...prev, [marketId]: !currentlyAttending }))
    setPendingId(marketId)
    startTransition(async () => {
      const fd = new FormData(); fd.set('market_id', marketId); fd.set('is_attending', String(currentlyAttending))
      const result = await toggleAttendanceIntent(fd)
      if (result?.error) setLocalAttending(prev => ({ ...prev, [marketId]: currentlyAttending }))
      setPendingId(null)
    })
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const future = markets.filter(um => um.market.event_date > todayStr)
  const tagStyle = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  if (future.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', background: 'var(--P)' }}>
        <div style={{ ...tagStyle, color: 'rgba(24,22,20,.25)', lineHeight: 2 }}>NO MARKETS SCHEDULED IN THE NEXT 60 DAYS<br />The curator will announce new dates soon.</div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--P)' }}>
      <div style={{ background: 'var(--P2)', padding: '8px 14px', borderBottom: '2px solid rgba(24,22,20,.15)' }}>
        <div style={{ ...tagStyle, color: 'rgba(24,22,20,.4)' }}>Declare intent for future markets. Curators can see who is planning to attend.</div>
      </div>

      {future.map((um, i) => {
        const isAttending = localAttending[um.market.id] ?? um.is_attending
        const thisIsPending = pendingId === um.market.id && isPending
        const msUntil = new Date(um.market.event_date + 'T00:00:00').getTime() - Date.now()
        const daysUntil = Math.ceil(msUntil / 86400000)

        return (
          <div key={um.market.id} style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--INK)', background: isAttending ? 'rgba(26,92,48,.04)' : 'var(--P)' }}>
            {/* Row number */}
            <div style={{ width: '40px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '2px solid rgba(24,22,20,.15)', background: 'var(--P2)' }}>
              <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', color: 'rgba(24,22,20,.15)', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
            </div>
            {/* Date */}
            <div style={{ flexShrink: 0, width: '88px', borderRight: '2px solid rgba(24,22,20,.15)', padding: '12px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--MONO)', fontWeight: 800, fontSize: '14px', color: 'var(--INK)', lineHeight: 1.2 }}>{formatMarketDate(um.market.event_date)}</div>
              <div style={{ ...tagStyle, color: 'rgba(24,22,20,.35)', marginTop: '3px', fontSize: '10px' }}>{daysUntil === 1 ? 'TOMORROW' : `${daysUntil}D`}</div>
            </div>
            {/* Market info */}
            <div style={{ flex: 1, minWidth: 0, padding: '12px 14px' }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>{um.market.space.name}</div>
              <div style={{ ...tagStyle, color: 'rgba(24,22,20,.35)', fontSize: '10px' }}>📍 {um.market.space.address ?? um.market.space.parish ?? 'Lisbon'} · {formatTime(um.market.starts_at)}–{formatTime(um.market.ends_at)}</div>
            </div>
            {/* Attend toggle */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <button onClick={() => handleToggle(um.market.id, isAttending)} disabled={thisIsPending}
                style={{ ...tagStyle, fontWeight: 700, padding: '8px 12px', border: '2px solid', minWidth: '80px', textAlign: 'center', cursor: 'pointer', lineHeight: 1.3,
                  background: isAttending ? 'var(--GRN)' : 'var(--P)',
                  borderColor: isAttending ? 'var(--GRN)' : 'var(--INK)',
                  color: isAttending ? '#fff' : 'var(--INK)',
                  boxShadow: isAttending ? '3px 3px 0 0 #0d2e18' : 'var(--SHD-SM)',
                  opacity: thisIsPending ? 0.5 : 1,
                }}>
                {thisIsPending ? '...' : isAttending ? '✓ GOING' : 'I WILL\nBE HERE'}
              </button>
            </div>
          </div>
        )
      })}

      <div style={{ background: 'var(--P2)', padding: '8px 14px', borderTop: '2px solid rgba(24,22,20,.15)' }}>
        <div style={{ ...tagStyle, color: 'rgba(24,22,20,.25)', fontSize: '10px' }}>
          {Object.values(localAttending).filter(Boolean).length} MARKETS CONFIRMED · {future.length} TOTAL UPCOMING
        </div>
      </div>
    </div>
  )
}
