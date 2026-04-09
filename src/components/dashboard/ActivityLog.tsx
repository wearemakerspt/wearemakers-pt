import type { ActivityEntry } from '@/lib/queries/curator'

interface Props { entries: ActivityEntry[] }

const TYPE_META: Record<ActivityEntry['type'], { icon: string; color: string }> = {
  checkin:       { icon: '→', color: 'var(--GRN)' },
  market_open:   { icon: '●', color: 'var(--RED)' },
  market_cancel: { icon: '✕', color: 'var(--RED)' },
  feature:       { icon: '★', color: 'var(--RED)' },
  system:        { icon: '·', color: 'rgba(24,22,20,.25)' },
}

function timeAgo(at: string): string {
  const mins = Math.round((Date.now() - new Date(at).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ActivityLog({ entries }: Props) {
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  return (
    <div style={{ background: 'var(--P)' }}>
      {entries.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ ...T, color: 'rgba(24,22,20,.25)', lineHeight: 2 }}>
            NO ACTIVITY YET<br />
            Events appear here as makers check in and markets open.
          </div>
        </div>
      ) : (
        entries.map((entry, i) => {
          const meta = TYPE_META[entry.type]
          return (
            <div key={entry.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '10px 14px', borderBottom: '1px dashed rgba(24,22,20,.12)',
              background: i === 0 ? 'rgba(200,41,26,.03)' : 'transparent',
            }}>
              <div style={{ width: '18px', flexShrink: 0, fontFamily: 'var(--MONO)', fontWeight: 700, fontSize: '14px', color: meta.color, lineHeight: 1.4, marginTop: '1px' }}>
                {meta.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', lineHeight: 1.4 }}>
                  {entry.label}
                </div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)', marginTop: '2px' }}>
                  {timeAgo(entry.at)}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
