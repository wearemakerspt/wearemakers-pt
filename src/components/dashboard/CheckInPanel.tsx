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
      const fd = new FormData(); fd.set('market_id', marketId); fd.set('stall_label', stallInput)
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

  const checkedInIds = new Set(activeCheckins.map(c => c.market.id))
  const availableToday = todayMarkets.filter(um => !checkedInIds.has(um.market.id))

  const tagStyle = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  return (
    <div style={{ background: 'var(--P)' }}>
      {activeCheckins.length > 0 && (
        <div style={{ padding: '14px', borderBottom: '2px solid rgba(24,22,20,.15)' }}>
          <div style={{ ...tagStyle, fontWeight: 700, color: 'var(--GRN)', marginBottom: '10px' }}>● CURRENTLY CHECKED IN</div>
          {activeCheckins.map(c => (
            <div key={c.attendance_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '2px solid var(--GRN)', background: 'rgba(26,92,48,.05)', padding: '10px 12px', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>{c.market.space.name}</div>
                <div style={{ ...tagStyle, color: 'rgba(24,22,20,.4)' }}>{formatTime(c.market.starts_at)}–{formatTime(c.market.ends_at)}{c.stall_label && c.stall_label !== 'INTENT' ? ` · STALL ${c.stall_label}` : ''}</div>
              </div>
              <button onClick={() => handleCheckOut(c.attendance_id)} disabled={isPending} style={{ ...tagStyle, fontWeight: 700, color: 'var(--INK)', background: 'var(--P)', border: '2px solid var(--INK)', padding: '7px 12px', cursor: 'pointer', boxShadow: 'var(--SHD-SM)' }}>CHECK OUT</button>
            </div>
          ))}
        </div>
      )}

      {availableToday.length > 0 ? (
        <div style={{ padding: '14px' }}>
          <div style={{ ...tagStyle, fontWeight: 700, color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>TODAY&apos;S MARKETS — TAP TO CHECK IN</div>
          {availableToday.map(um => {
            const isExpanded = checkingInTo === um.market.id
            const isLive = um.market.status === 'live' || um.market.status === 'community_live'
            return (
              <div key={um.market.id} style={{ border: '2px solid var(--INK)', marginBottom: '8px' }}>
                <button onClick={() => setCheckingInTo(isExpanded ? null : um.market.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1 }}>{um.market.space.name}</div>
                    <div style={{ ...tagStyle, color: 'rgba(24,22,20,.4)', marginTop: '3px' }}>📍 {um.market.space.address ?? um.market.space.parish ?? 'Lisbon'} · {formatTime(um.market.starts_at)}–{formatTime(um.market.ends_at)}</div>
                  </div>
                  <div style={{ ...tagStyle, fontWeight: 700, padding: '4px 8px', border: `1px solid ${isLive ? 'var(--RED)' : 'rgba(24,22,20,.3)'}`, color: isLive ? 'var(--RED)' : 'rgba(24,22,20,.4)' }}>
                    {isLive ? '● LIVE' : 'SCHED'}
                  </div>
                </button>
                {isExpanded && (
                  <div style={{ borderTop: '2px solid var(--INK)', background: 'var(--P2)', padding: '10px 12px' }}>
                    <label style={{ ...tagStyle, color: 'rgba(24,22,20,.45)', display: 'block', marginBottom: '8px' }}>Stall Reference (optional)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" value={stallInput} onChange={e => setStallInput(e.target.value)} placeholder="e.g. A-1, Unit 7"
                        style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '2px dashed var(--INK)', padding: '8px 0', fontFamily: 'var(--MONO)', fontSize: '16px', color: 'var(--INK)', outline: 'none' }} />
                      <button onClick={() => handleCheckIn(um.market.id)} disabled={isPending}
                        style={{ ...tagStyle, fontWeight: 700, color: 'var(--P)', background: 'var(--RED)', border: '2px solid var(--RED)', padding: '8px 14px', cursor: 'pointer', boxShadow: 'var(--SHD-SM)' }}>
                        {isPending ? 'CHECKING IN...' : 'CHECK IN →'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : activeCheckins.length === 0 && (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ ...tagStyle, color: 'rgba(24,22,20,.25)', lineHeight: 2 }}>NO MARKETS SCHEDULED TODAY<br />Use the agenda below to declare intent</div>
        </div>
      )}

      {error && <div style={{ padding: '10px 14px', borderLeft: '3px solid var(--RED)', ...tagStyle, fontWeight: 700, color: 'var(--RED)' }}>✗ {error}</div>}
    </div>
  )
}
