'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { MarketsByMonth, MarketSummary } from '@/lib/queries/markets'

const INK = '#181614'
const PAPER = '#f0ece0'
const PAPER2 = '#e8e0d0'
const RED = '#c8291a'
const GRN = '#1a5c30'

const T = {
  fontFamily: "'Share Tech Mono',monospace",
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  live:           { label: '● LIVE',      color: '#fff',    bg: GRN },
  community_live: { label: '● LIVE',      color: '#fff',    bg: GRN },
  scheduled:      { label: 'SCHEDULED',   color: INK,       bg: 'transparent' },
  cancelled:      { label: 'CANCELLED',   color: '#fff',    bg: INK },
}

function MarketRow({ market }: { market: MarketSummary }) {
  const cfg = statusConfig[market.status] ?? statusConfig.scheduled
  const isLive = market.status === 'live' || market.status === 'community_live'
  const dayName = new Date(market.event_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
  const dayNum = new Date(market.event_date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric' }).toUpperCase()

  return (
    <Link href={`/markets/${market.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: `2px solid ${INK}`,
        background: isLive ? 'rgba(26,92,48,.05)' : PAPER,
        borderLeft: isLive ? `4px solid ${GRN}` : `4px solid transparent`,
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = PAPER2}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isLive ? 'rgba(26,92,48,.05)' : PAPER}
      >
        {/* Date block */}
        <div style={{ flexShrink: 0, width: '40px', textAlign: 'center', borderRight: `2px solid rgba(24,22,20,.1)`, paddingRight: '12px' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(24,22,20,.4)', textTransform: 'uppercase' }}>{dayName}</div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '24px', color: INK, lineHeight: 1 }}>{dayNum}</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', color: INK, lineHeight: 1, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {market.space.name}
          </div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)' }}>
            {market.space.parish ? `${market.space.parish} · ` : ''}{market.starts_at.slice(0,5)}–{market.ends_at.slice(0,5)}
            {market.curator ? ` · ${market.curator.display_name}` : ''}
          </div>
        </div>

        {/* Check-in count */}
        {market.checkin_count > 0 && (
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '22px', color: GRN, lineHeight: 1 }}>{market.checkin_count}</div>
            <div style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.35)' }}>LIVE</div>
          </div>
        )}

        {/* Status badge */}
        <div style={{ flexShrink: 0 }}>
          <span style={{ ...T, fontSize: '8px', fontWeight: 700, background: cfg.bg, color: cfg.color, padding: '3px 8px', border: cfg.bg === 'transparent' ? `1px solid rgba(24,22,20,.3)` : 'none' }}>
            {cfg.label}
          </span>
        </div>

        <div style={{ ...T, fontSize: '12px', color: 'rgba(24,22,20,.2)', flexShrink: 0 }}>→</div>
      </div>
    </Link>
  )
}

function MonthBlock({ group }: { group: MarketsByMonth }) {
  const [open, setOpen] = useState(group.isCurrentMonth)

  return (
    <div style={{ borderBottom: `3px solid ${INK}` }}>
      {/* Month header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: group.isCurrentMonth ? INK : PAPER2,
          border: 'none',
          cursor: 'pointer',
          borderBottom: open ? `2px solid ${INK}` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, color: group.isCurrentMonth ? PAPER : INK }}>
            {group.monthLabel}
          </div>
          <div style={{ ...T, fontSize: '9px', color: group.isCurrentMonth ? 'rgba(240,236,224,.4)' : 'rgba(24,22,20,.4)' }}>
            {group.markets.length} MARKET{group.markets.length !== 1 ? 'S' : ''}
          </div>
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '14px', color: group.isCurrentMonth ? 'rgba(240,236,224,.4)' : 'rgba(24,22,20,.3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ↓
        </div>
      </button>

      {/* Market rows */}
      {open && (
        <div>
          {group.markets.map(m => <MarketRow key={m.id} market={m} />)}
        </div>
      )}
    </div>
  )
}

export default function MarketsCalendar({ groups, liveCount }: { groups: MarketsByMonth[]; liveCount: number }) {
  return (
    <div>
      {groups.length === 0 ? (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', color: 'rgba(24,22,20,.12)', marginBottom: '12px' }}>
            NO MARKETS SCHEDULED
          </div>
          <div style={{ ...T, color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
            Check back soon.
          </div>
        </div>
      ) : (
        groups.map(group => <MonthBlock key={group.monthKey} group={group} />)
      )}
    </div>
  )
}
