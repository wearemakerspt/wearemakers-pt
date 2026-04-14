'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { MarketsByMonth, MarketSummary } from '@/lib/queries/markets'

const INK = '#1A1A1A'
const RED = '#E8001C'
const WHITE = '#F4F1EC'
const PAPER = '#EDE9E2'
const STONE = '#6B6560'
const GREEN = '#1a5c30'
const B = '2px solid #0C0C0C'
const Bsm = '1px solid rgba(12,12,12,0.15)'
const BLACK = '#0C0C0C'

const FM = { fontFamily: "'Share Tech Mono',monospace" }
const FH = { fontFamily: "'Barlow Condensed',sans-serif" }

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  live:           { label: '● LIVE',    color: WHITE,             bg: GREEN },
  community_live: { label: '● LIVE',    color: WHITE,             bg: GREEN },
  scheduled:      { label: 'SCHEDULED', color: STONE,             bg: 'transparent' },
  cancelled:      { label: 'CANCELLED', color: WHITE,             bg: INK },
}

function MarketRow({ market }: { market: MarketSummary }) {
  const cfg = statusConfig[market.status] ?? statusConfig.scheduled
  const isLive = market.status === 'live' || market.status === 'community_live'
  const d = new Date(market.event_date + 'T12:00:00')
  const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
  const dayNum = d.getDate()

  return (
    <Link href={`/markets/${market.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 40px', height: '72px', borderBottom: Bsm, background: isLive ? 'rgba(26,92,48,.04)' : WHITE, transition: 'background .15s', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = PAPER}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isLive ? 'rgba(26,92,48,.04)' : WHITE}
      >
        {/* Date */}
        <div style={{ width: '100px', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <div style={{ ...FH, fontWeight: 900, fontSize: '32px', lineHeight: 1, letterSpacing: '-0.02em', color: INK }}>{dayNum}</div>
          <div style={{ ...FM, fontSize: '10px', letterSpacing: '0.1em', color: STONE }}>{dayName}</div>
        </div>

        {/* Market info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ ...FH, fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', color: INK }}>{market.space.name}</div>
          <div style={{ ...FM, fontSize: '10px', letterSpacing: '0.08em', color: STONE }}>
            {market.space.parish ? `${market.space.parish} · ` : ''}{market.starts_at.slice(0,5)}–{market.ends_at.slice(0,5)}
            {market.curator ? ` · ${market.curator.display_name}` : ''}
          </div>
        </div>

        {/* Time */}
        <div style={{ ...FM, fontSize: '10px', letterSpacing: '0.08em', color: INK, textAlign: 'right', flexShrink: 0 }}>
          {market.starts_at.slice(0,5)}–{market.ends_at.slice(0,5)}
        </div>

        {/* Status */}
        <div style={{ flexShrink: 0 }}>
          <span style={{ ...FM, fontSize: '10px', fontWeight: 700, background: cfg.bg, color: cfg.color, padding: '4px 10px', border: cfg.bg === 'transparent' ? `1px solid ${STONE}` : 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {cfg.label}
          </span>
        </div>

        {/* Live count */}
        {market.checkin_count > 0 && (
          <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '32px' }}>
            <div style={{ ...FH, fontWeight: 900, fontSize: '22px', color: GREEN, lineHeight: 1 }}>{market.checkin_count}</div>
            <div style={{ ...FM, fontSize: '10px', color: STONE }}>LIVE</div>
          </div>
        )}

        <div style={{ ...FM, fontSize: '14px', color: 'rgba(12,12,12,0.2)', flexShrink: 0, opacity: 0, transition: 'opacity .2s' }} className="mkt-row-arr">→</div>
      </div>
    </Link>
  )
}

function MonthBlock({ group }: { group: MarketsByMonth }) {
  const [open, setOpen] = useState(group.isCurrentMonth)

  return (
    <div style={{ borderBottom: B }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: '42px', background: group.isCurrentMonth ? INK : PAPER, border: 'none', cursor: 'pointer', borderBottom: open ? Bsm : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
          <div style={{ ...FM, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: group.isCurrentMonth ? WHITE : INK }}>
            {group.monthLabel}
          </div>
          <div style={{ ...FM, fontSize: '10px', letterSpacing: '0.12em', color: group.isCurrentMonth ? 'rgba(244,241,236,0.4)' : STONE }}>
            {group.markets.length} MARKET{group.markets.length !== 1 ? 'S' : ''}
          </div>
        </div>
        <div style={{ ...FM, fontSize: '12px', color: group.isCurrentMonth ? 'rgba(244,241,236,0.4)' : STONE, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>↓</div>
      </button>
      {open && group.markets.map(m => <MarketRow key={m.id} market={m} />)}
    </div>
  )
}

export default function MarketsCalendar({ groups, liveCount }: { groups: MarketsByMonth[]; liveCount: number }) {
  return (
    <div>
      {groups.length === 0 ? (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ ...FH, fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', color: 'rgba(12,12,12,0.12)', marginBottom: '12px' }}>NO MARKETS SCHEDULED</div>
          <div style={{ ...FM, fontSize: '10px', color: STONE, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Check back soon.</div>
        </div>
      ) : (
        groups.map(group => <MonthBlock key={group.monthKey} group={group} />)
      )}
    </div>
  )
}
