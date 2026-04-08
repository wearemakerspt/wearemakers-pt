import { formatMarketDate, formatTime } from '@/lib/utils'
import type { AttendedMarket } from '@/lib/queries/maker'

interface Props {
  attendance: AttendedMarket[]
}

/**
 * Pure Server Component — no client JS needed. Read-only log.
 */
export default function RecentAttendance({ attendance }: Props) {
  if (attendance.length === 0) {
    return (
      <div style={{ border: '3px solid #1a1a1a' }}>
        <div className="flex items-center justify-between bg-ink px-4 py-3">
          <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
            §5 — ATTENDANCE LOG
          </span>
          <span className="font-tag text-xs text-parchment/30">FP-005</span>
        </div>
        <div className="bg-parchment p-5 text-center">
          <p className="font-tag text-xs tracking-widest uppercase text-ink/25 leading-loose">
            NO ATTENDANCE RECORDED YET
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
          §5 — ATTENDANCE LOG
        </span>
        <span className="font-tag text-xs text-parchment/30 tracking-[0.06em]">FP-005</span>
      </div>

      <div className="bg-parchment divide-y-[2px] divide-ink/10">
        {attendance.map((record) => {
          const checkedOut = Boolean(record.checked_out_at)
          const isToday =
            record.market.event_date === new Date().toISOString().split('T')[0]

          // Duration calculation
          let duration = ''
          if (record.checked_out_at) {
            const mins = Math.round(
              (new Date(record.checked_out_at).getTime() -
                new Date(record.checked_in_at).getTime()) /
                60000
            )
            if (mins < 60) duration = `${mins}m`
            else duration = `${Math.floor(mins / 60)}h ${mins % 60}m`
          }

          return (
            <div
              key={record.attendance_id}
              className="flex items-center gap-4 px-4 py-3"
            >
              {/* Verified tick */}
              <div className="w-6 flex-shrink-0 text-center">
                {record.is_verified ? (
                  <span className="font-tag text-sm text-grove font-bold" title="Verified by curator">✓</span>
                ) : (
                  <span className="font-tag text-sm text-ink/15">·</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-black text-lg uppercase tracking-tight leading-none text-ink">
                    {record.market.space.name}
                  </p>
                  {isToday && (
                    <span className="font-tag text-xs tracking-widest uppercase text-stamp border border-stamp px-2 py-0.5">
                      TODAY
                    </span>
                  )}
                </div>
                <p className="font-tag text-xs tracking-wide uppercase text-ink/35 mt-0.5">
                  {formatMarketDate(record.market.event_date)}
                  {record.stall_label && record.stall_label !== 'INTENT' && (
                    <> · STALL {record.stall_label}</>
                  )}
                  {duration && <> · {duration}</>}
                </p>
              </div>

              {/* Status */}
              <div className="flex-shrink-0 font-tag text-xs tracking-widest uppercase">
                {checkedOut ? (
                  <span className="text-ink/30">
                    {formatTime(record.market.starts_at)}–
                    {formatTime(record.market.ends_at)}
                  </span>
                ) : (
                  <span className="text-stamp font-bold">● ACTIVE</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
