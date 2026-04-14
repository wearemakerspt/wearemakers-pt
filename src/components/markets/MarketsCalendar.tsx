'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { MarketsByMonth, MarketSummary } from '@/lib/queries/markets'

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560', GREEN = '#1a5c30'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = { fontFamily: "'Share Tech Mono',monospace" }
const FH = { fontFamily: "'Barlow Condensed',sans-serif" }

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  live:           { label: '● LIVE',    color: WHITE, bg: GREEN },
  community_live: { label: '● LIVE',    color: WHITE, bg: GREEN },
  scheduled:      { label: 'SCHEDULED', color: STONE, bg: 'transparent' },
  cancelled:      { label: 'CANCELLED', color: WHITE, bg: INK },
}

function MarketRow({ market, even }: { market: MarketSummary; even: boolean }) {
  const cfg = statusConfig[market.status] ?? statusConfig.scheduled
  const isLive = market.status === 'live' || market.status === 'community_live'
  const d = new Date(market.event_date + 'T12:00:00')
  const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
  const dayNum = d.getDate()

  return (
    <Link href={`/markets/${market.id}`} style={{ textDecoration: 'none', display: 'block' }} className="mkt-cal-row">
      <div style={{
        display: 'flex', alignItems: 'center', gap: '24px',
        padding: '0 40px', height: '72px', borderBottom: Bsm,
        background: isLive ? 'rgba(26,92,48,.04)' : (even ? WHITE : PAPER),
        transition: 'background .15s', cursor: 'pointer',
      }}>
        {/* Date */}
        <div style={{ width: '100px', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <div style={{ ...FH, fontWeight: 900, fontSize: '32px', lineHeight: 1, letterSpacing: '-0.02em', color: INK }}>{dayNum}</div>
          <div style={{ ...FM, fontSize: '10px', letterSpacing: '0.1em', color: STONE, textTransform: 'uppercase' }}>{dayName}</div>
        </div>

        {/* Market title + space */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ ...FH, fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', color: INK }}>
            {market.title}
          </div>
          <div style={{ ...FM, fontSize: '10px', letterSpacing: '0.08em', color: STONE, textTransform: 'uppercase' }}>
            {market.space.name}{market.space.parish ? ` · ${market.space.parish}` : ''} · {market.starts_at.slice(0,5)}–{market.ends_at.slice(0,5)}
          </div>
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
            <div style={{ ...FM, fontSize: '10px', color: STONE, textTransform: 'uppercase' }}>LIVE</div>
          </div>
        )}

        <div style={{ ...FM, fontSize: '14px', color: 'rgba(12,12,12,0.2)', flexShrink: 0 }}>→</div>
      </div>
    </Link>
  )
}

function MonthBlock({ group }: { group: MarketsByMonth }) {
  const [open, setOpen] = useState(group.isCurrentMonth)

  return (
    <div style={{ borderBottom: B }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: '42px', background: group.isCurrentMonth ? INK : PAPER, border: 'none', cursor: 'pointer', borderBottom: open ? Bsm : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
          <div style={{ ...FM, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: group.isCurrentMonth ? WHITE : INK }}>
            {group.monthLabel}
          </div>
          <div style={{ ...FM, fontSize: '10px', letterSpacing: '0.12em', color: group.isCurrentMonth ? 'rgba(244,241,236,0.4)' : STONE, textTransform: 'uppercase' }}>
            {group.markets.length} MARKET{group.markets.length !== 1 ? 'S' : ''}
          </div>
        </div>
        <div style={{ ...FM, fontSize: '12px', color: group.isCurrentMonth ? 'rgba(244,241,236,0.4)' : STONE, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>↓</div>
      </button>
      {open && group.markets.map((m, i) => <MarketRow key={m.id} market={m} even={i % 2 === 0} />)}
    </div>
  )
}

export default function MarketsCalendar({ groups, liveCount }: { groups: MarketsByMonth[]; liveCount: number }) {
  return (
    <div>
      <style>{`.mkt-cal-row:hover > div { background: #d8d2c4 !important; }`}</style>
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
