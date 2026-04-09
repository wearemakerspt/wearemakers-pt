import { formatMarketDate, formatTime } from '@/lib/utils'
import type { AttendedMarket } from '@/lib/queries/maker'

interface Props { attendance: AttendedMarket[] }

export default function RecentAttendance({ attendance }: Props) {
  const tagStyle = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  if (attendance.length === 0) {
    return (
      <div style={{ padding: '24px', background: 'var(--P)' }}>
        <div style={{ ...tagStyle, color: 'rgba(24,22,20,.25)', marginBottom: '8px' }}>NO ATTENDANCE RECORDED YET</div>
        <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.35)', lineHeight: 1.6 }}>
          Your first market appearance will be recorded here automatically when you check in.
        </div>
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            '→ Go to §1 above and select a market',
            '→ Tap START TRANSMISSION to go live',
            '→ Your session will appear here after check-out',
          ].map((tip, i) => (
            <div key={i} style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(24,22,20,.3)', display: 'flex', gap: '6px' }}>
              <span style={{ color: 'var(--RED)' }}>{tip.slice(0, 1)}</span>
              <span>{tip.slice(2)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--P)' }}>
      {attendance.map(record => {
        const checkedOut = Boolean(record.checked_out_at)
        const isToday = record.market.event_date === new Date().toISOString().split('T')[0]
        let duration = ''
        if (record.checked_out_at) {
          const mins = Math.round((new Date(record.checked_out_at).getTime() - new Date(record.checked_in_at).getTime()) / 60000)
          duration = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
        }

        return (
          <div key={record.attendance_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderBottom: '2px solid rgba(24,22,20,.1)' }}>
            <div style={{ width: '20px', flexShrink: 0, textAlign: 'center', fontFamily: 'var(--TAG)', fontSize: '14px', color: record.is_verified ? 'var(--GRN)' : 'rgba(24,22,20,.15)', fontWeight: 700 }}>
              {record.is_verified ? '✓' : '·'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1 }}>
                  {record.market.space.name}
                </div>
                {isToday && <span style={{ ...tagStyle, fontSize: '10px', color: 'var(--RED)', border: '1px solid var(--RED)', padding: '2px 6px' }}>TODAY</span>}
              </div>
              <div style={{ ...tagStyle, color: 'rgba(24,22,20,.35)', fontSize: '10px' }}>
                {formatMarketDate(record.market.event_date)}
                {record.stall_label && record.stall_label !== 'INTENT' ? ` · STALL ${record.stall_label}` : ''}
                {duration ? ` · ${duration}` : ''}
              </div>
            </div>
            <div style={{ flexShrink: 0, ...tagStyle, fontSize: '10px' }}>
              {checkedOut
                ? <span style={{ color: 'rgba(24,22,20,.3)' }}>{formatTime(record.market.starts_at)}–{formatTime(record.market.ends_at)}</span>
                : <span style={{ color: 'var(--RED)', fontWeight: 700 }}>● ACTIVE</span>
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}
