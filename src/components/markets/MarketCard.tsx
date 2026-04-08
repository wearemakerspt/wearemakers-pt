import Link from 'next/link'
import type { MarketSummary } from '@/lib/queries/markets'

interface Props {
  market: MarketSummary
  dim?: boolean
}

const STATUS_COLOUR: Record<string, string> = {
  live:           '#1a5c30',
  community_live: '#1a5c30',
  scheduled:      '#d0c8b4',
  cancelled:      '#181614',
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

function marketSlug(m: MarketSummary) {
  return `${m.id}`
}

export default function MarketCard({ market: m, dim = false }: Props) {
  const isLive = m.status === 'live' || m.status === 'community_live'

  return (
    <Link
      href={`/markets/${marketSlug(m)}`}
      className="flex transition-colors hover:bg-parchment-2"
      style={{
        borderBottom: '3px solid #181614',
        opacity: dim ? 0.55 : 1,
        minHeight: '88px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {/* Left image column */}
      <div
        style={{
          width: '80px',
          flexShrink: 0,
          background: '#181614',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '8px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {m.makers.length > 0 && (
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '8px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 'auto', paddingTop: '4px' }}>
            {m.space.name.toUpperCase().slice(0, 8)}
          </div>
        )}
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', color: 'rgba(240,236,224,.9)', lineHeight: 1 }}>
          {m.checkin_count}
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '8px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {isLive ? 'LIVE' : 'SCHED'}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '10px 14px', minWidth: 0 }}>
        {/* Status + live count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.45)' }}>
            {m.space.name} · {m.space.parish ?? ''}
          </div>
          {isLive && (
            <span className="badge-live">
              {m.checkin_count} LIVE
            </span>
          )}
        </div>

        {/* Title */}
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '26px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.95, color: '#181614', marginBottom: '4px' }}>
          {m.title}
        </div>

        {/* Time + space */}
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: 'rgba(24,22,20,.45)', marginBottom: '8px' }}>
          Today {formatTime(m.starts_at)}–{formatTime(m.ends_at)}
          {m.space.address ? ` · ${m.space.address}` : ''}
        </div>

        {/* Maker avatar cluster */}
        {m.checkin_count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
            {Array.from({ length: Math.min(m.checkin_count, 3) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '28px', height: '28px',
                  background: isLive ? '#1a5c30' : '#e6e0d0',
                  border: '2px solid #181614',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
                  fontSize: '10px', color: isLive ? '#fff' : '#181614',
                  marginRight: '-6px', position: 'relative', flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
            ))}
            {m.checkin_count > 3 && (
              <div style={{ marginLeft: '10px', fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: '#c8291a', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                +{m.checkin_count - 3} MORE
              </div>
            )}
            <span style={{ marginLeft: '10px', fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: '#c8291a', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
              ALL {m.checkin_count} →
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
