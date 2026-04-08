import type { ActivityEntry } from '@/lib/queries/curator'

interface Props {
  entries: ActivityEntry[]
}

const TYPE_META: Record<ActivityEntry['type'], { icon: string; color: string }> = {
  checkin: { icon: '→', color: 'text-ink/50' },
  market_open: { icon: '●', color: 'text-grove' },
  market_cancel: { icon: '✕', color: 'text-stamp' },
  feature: { icon: '★', color: 'text-stamp' },
  system: { icon: '·', color: 'text-ink/25' },
}

/**
 * Pure Server Component — zero client JS.
 */
export default function ActivityLog({ entries }: Props) {
  return (
    <div style={{ border: '3px solid #1a1a1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between bg-ink px-4 py-3 border-b-[3px] border-ink">
        <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
          §3 — ACTIVITY LOG
        </span>
        <span className="font-tag text-xs text-parchment/30">FP-CUR-003</span>
      </div>

      <div className="bg-parchment divide-y-[1px] divide-ink/8">
        {entries.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="font-tag text-xs tracking-widest uppercase text-ink/25">
              NO ACTIVITY YET
            </p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const meta = TYPE_META[entry.type]
            const time = new Date(entry.at).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })
            const date = new Date(entry.at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
            }).toUpperCase()
            const isToday =
              new Date(entry.at).toDateString() === new Date().toDateString()

            return (
              <div
                key={entry.id}
                className={`flex items-start gap-3 px-4 py-3 ${
                  i === 0 ? 'bg-ink/4' : ''
                }`}
              >
                {/* Icon */}
                <span
                  className={`font-tag font-bold text-sm flex-shrink-0 w-4 text-center ${meta.color}`}
                >
                  {meta.icon}
                </span>

                {/* Message */}
                <p
                  className={`flex-1 font-mono text-sm leading-relaxed ${
                    i === 0 ? 'text-ink' : 'text-ink/45'
                  }`}
                >
                  {entry.label}
                </p>

                {/* Timestamp */}
                <span className="font-tag text-xs tracking-wide uppercase text-ink/25 flex-shrink-0 text-right">
                  {isToday ? time : date}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
