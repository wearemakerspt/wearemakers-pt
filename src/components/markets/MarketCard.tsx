import Link from 'next/link'
import type { MarketSummary } from '@/lib/queries/markets'

interface Props {
  market: MarketSummary
  dim?: boolean
}

const INK = '#1A1A1A'
const RED = '#E8001C'
const WHITE = '#F4F1EC'
const PAPER = '#EDE9E2'
const STONE = '#6B6560'
const GREEN = '#1a5c30'
const B = '2px solid #0C0C0C'
const Bsm = '1px solid rgba(12,12,12,0.15)'

function formatTime(t: string) { return t.slice(0, 5) }

export default function MarketCard({ market: m, dim = false }: Props) {
  const isLive = m.status === 'live' || m.status === 'community_live'

  return (
    <Link
      href={`/markets/${m.id}`}
      style={{ display: 'flex', borderBottom: B, opacity: dim ? 0.5 : 1, minHeight: '88px', textDecoration: 'none', color: 'inherit', background: WHITE, transition: 'background .15s' }}
      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = PAPER}
      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = WHITE}
    >
      {/* Left counter */}
      <div style={{ width: '72px', flexShrink: 0, background: INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', borderRight: B }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', color: isLive ? RED : 'rgba(244,241,236,0.5)', lineHeight: 1 }}>
          {isLive ? m.checkin_count : new Date(m.event_date + 'T12:00:00').getDate()}
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.4)', marginTop: '2px' }}>
          {isLive ? 'LIVE' : new Date(m.event_date + 'T12:00:00').toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: STONE }}>
            {m.space.name} · {m.space.parish ?? ''}
          </div>
          {isLive && <span className="badge-live">{m.checkin_count} LIVE</span>}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '26px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.95, color: INK, marginBottom: '4px' }}>
          {m.title}
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: STONE, marginBottom: '6px', letterSpacing: '0.06em' }}>
          {formatTime(m.starts_at)}–{formatTime(m.ends_at)}{m.space.address ? ` · ${m.space.address}` : ''}
        </div>
        {m.checkin_count > 0 && isLive && (
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: RED, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {m.checkin_count} MAKERS →
          </div>
        )}
      </div>
    </Link>
  )
}
