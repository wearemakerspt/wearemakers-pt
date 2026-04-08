import Link from 'next/link'
import type { MarketSummary } from '@/lib/queries/markets'

interface Props {
  market: MarketSummary
  dim?: boolean
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

export default function MarketCard({ market: m, dim = false }: Props) {
  const isLive = m.status === 'live' || m.status === 'community_live'

  return (
    <Link
      href={`/markets/${m.id}`}
      style={{ display: 'flex', borderBottom: '3px solid #181614', opacity: dim ? 0.55 : 1, minHeight: '88px', textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{ width: '80px', flexShrink: 0, background: '#181614', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '8px' }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', color: 'rgba(240,236,224,.9)', lineHeight: 1 }}>
          {m.checkin_count}
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '8px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {isLive ? 'LIVE' : 'SCHED'}
        </div>
      </div>
      <div style={{ flex: 1, padding: '10px 14px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.45)' }}>
            {m.space.name} · {m.space.parish ?? ''}
          </div>
          {isLive && <span className="badge-live">{m.checkin_count} LIVE</span>}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '26px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.95, color: '#181614', marginBottom: '4px' }}>
          {m.title}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: 'rgba(24,22,20,.45)', marginBottom: '8px' }}>
          {formatTime(m.starts_at)}–{formatTime(m.ends_at)}
          {m.space.address ? ` · ${m.space.address}` : ''}
        </div>
        {m.checkin_count > 0 && (
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: '#c8291a', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {m.checkin_count} MAKERS →
          </div>
        )}
      </div>
    </Link>
  )
}