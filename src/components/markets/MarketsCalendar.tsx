'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface MarketSummary {
  id: string
  title: string
  status: string
  event_date: string
  starts_at: string
  ends_at: string
  checkin_count: number
  space: {
    id: string
    name: string
    address: string | null
    parish: string | null
    lat: number
    lng: number
  }
  curator: {
    id: string
    display_name: string
    slug: string | null
  } | null
}

interface MarketsByMonth {
  monthKey: string
  monthLabel: string
  isCurrentMonth: boolean
  markets: MarketSummary[]
}

interface Props {
  marketsByMonth: MarketsByMonth[]
  liveMarketIds: string[]
}

type Filter = 'all' | 'live' | 'upcoming'

const T = { fontFamily: "'Share Tech Mono',monospace", letterSpacing: '0.14em', textTransform: 'uppercase' as const }

function formatWeekday(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
}

function formatDay(d: string) {
  return new Date(d + 'T12:00:00').getDate()
}

function formatMonth(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
}

export default function MarketsCalendar({ marketsByMonth, liveMarketIds }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const liveSet = useMemo(() => new Set(liveMarketIds), [liveMarketIds])

  const filteredByMonth = useMemo(() => {
    if (filter === 'all') return marketsByMonth

    return marketsByMonth.map(month => ({
      ...month,
      markets: month.markets.filter(m => {
        if (filter === 'live') return m.status === 'live' || m.status === 'community_live'
        if (filter === 'upcoming') return m.status === 'scheduled'
        return true
      }),
    })).filter(month => month.markets.length > 0)
  }, [marketsByMonth, filter])

  const liveCount = useMemo(() =>
    marketsByMonth.flatMap(m => m.markets).filter(m => m.status === 'live' || m.status === 'community_live').length,
    [marketsByMonth]
  )

  const tabs: { key: Filter; label: string; count?: number }[] = [
    { key: 'all', label: 'ALL MARKETS' },
    { key: 'live', label: '● LIVE NOW', count: liveCount },
    { key: 'upcoming', label: 'UPCOMING' },
  ]

  return (
    <div>
      {/* ── Filter tabs ── */}
      <div style={{
        display: 'flex',
        borderBottom: '3px solid var(--INK)',
        background: 'var(--P2)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {tabs.map(tab => {
          const active = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                ...T,
                fontSize: '11px',
                fontWeight: 700,
                padding: '12px 18px',
                background: active ? 'var(--INK)' : 'transparent',
                color: active ? 'var(--P)' : tab.key === 'live' && liveCount > 0 ? 'var(--GRN)' : 'rgba(24,22,20,.5)',
                border: 'none',
                borderRight: '2px solid rgba(24,22,20,.1)',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{
                  background: active ? 'var(--RED)' : 'var(--GRN)',
                  color: '#fff',
                  fontSize: '9px',
                  padding: '1px 5px',
                  fontFamily: "'Share Tech Mono',monospace",
                  letterSpacing: '0.06em',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
        <div style={{ marginLeft: 'auto', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
          <Link href="/spaces" style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', textDecoration: 'none', padding: '12px 14px', whiteSpace: 'nowrap' }}>
            ALL SPACES →
          </Link>
        </div>
      </div>

      {/* ── Empty live state ── */}
      {filter === 'live' && liveCount === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center', borderBottom: '3px solid var(--INK)' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '8px' }}>
            NO LIVE MARKETS RIGHT NOW
          </div>
          <div style={{ ...T, fontSize: '11px', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
            Check the calendar below for upcoming dates.
          </div>
        </div>
      )}

      {/* ── Month groups ── */}
      {filteredByMonth.map(month => (
        <div key={month.monthKey}>
          {/* Month header */}
          <div style={{
            background: 'var(--INK)',
            padding: '10px 14px',
            borderBottom: '2px solid rgba(240,236,224,.06)',
            borderTop: month.isCurrentMonth ? 'none' : '3px solid var(--INK)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--P)', lineHeight: 1 }}>
              {month.monthLabel}
            </div>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.25)' }}>
              {month.markets.length} MARKET{month.markets.length !== 1 ? 'S' : ''}
            </div>
          </div>

          {/* Market rows */}
          {month.markets.map((m, i) => {
            const isLive = m.status === 'live' || m.status === 'community_live'
            const isCancelled = m.status === 'cancelled'

            return (
              <Link
                key={m.id}
                href={`/markets/${m.id}`}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'stretch',
                  borderBottom: '2px solid var(--INK)',
                  background: isLive ? 'rgba(26,92,48,.04)' : i % 2 === 0 ? 'var(--P)' : 'var(--P2)',
                  minHeight: '72px',
                  position: 'relative',
                  borderLeft: isLive ? '4px solid var(--GRN)' : '4px solid transparent',
                }}
              >
                {/* Date block */}
                <div style={{
                  width: '72px',
                  flexShrink: 0,
                  background: isLive ? 'var(--GRN)' : 'var(--INK)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px',
                  gap: '1px',
                }}>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: isLive ? '#fff' : 'rgba(240,236,224,.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {formatWeekday(m.event_date)}
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '28px', color: isLive ? '#fff' : 'var(--RED)', lineHeight: 1 }}>
                    {formatDay(m.event_date)}
                  </div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: isLive ? 'rgba(255,255,255,.6)' : 'rgba(240,236,224,.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {formatMonth(m.event_date)}
                  </div>
                </div>

                {/* Market info */}
                <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    {isLive && (
                      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--GRN)', color: '#fff', padding: '2px 6px' }}>
                        ● LIVE NOW
                      </span>
                    )}
                    {isCancelled && (
                      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--RED)', color: '#fff', padding: '2px 6px' }}>
                        CANCELLED
                      </span>
                    )}
                  </div>

                  {/* Market title */}
                  <div style={{
                    fontFamily: "'Barlow Condensed',sans-serif",
                    fontWeight: 900,
                    fontSize: 'clamp(18px,4vw,24px)',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    color: isCancelled ? 'rgba(24,22,20,.35)' : 'var(--INK)',
                    lineHeight: 1,
                    marginBottom: '3px',
                    textDecoration: isCancelled ? 'line-through' : 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {m.title}
                  </div>

                  {/* Space + time */}
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.45)', lineHeight: 1.4 }}>
                    {m.space.name}
                    {m.space.parish ? ` · ${m.space.parish}` : ''}
                    {' · '}{m.starts_at.slice(0,5)}–{m.ends_at.slice(0,5)}
                  </div>

                  {/* Curator name — KEY ADDITION */}
                  {m.curator?.display_name && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--RED)', marginTop: '3px', fontWeight: 700 }}>
                      ↳ {m.curator.display_name}
                      {m.curator.slug && (
                        <span style={{ fontWeight: 400, color: 'rgba(24,22,20,.35)' }}> · curators/{m.curator.slug}</span>
                      )}
                    </div>
                  )}

                  {/* Live maker count */}
                  {isLive && m.checkin_count > 0 && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--GRN)', marginTop: '3px', fontWeight: 700 }}>
                      {m.checkin_count} MAKERS CHECKED IN
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', color: 'rgba(24,22,20,.2)', fontFamily: "'Share Tech Mono',monospace", fontSize: '16px' }}>
                  →
                </div>
              </Link>
            )
          })}
        </div>
      ))}

      {/* ── Empty all ── */}
      {filteredByMonth.length === 0 && filter !== 'live' && (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '8px' }}>
            NO MARKETS FOUND
          </div>
        </div>
      )}
    </div>
  )
}
