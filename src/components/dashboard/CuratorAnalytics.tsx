'use client'
import Link from 'next/link'

interface Market {
  id: string
  title: string
  event_date: string
  status: string
  checkin_count: number
  attending_makers: {
    id: string
    display_name: string
    slug: string | null
    category: string | null
  }[]
  space: { name: string }
}

interface Props {
  markets: Market[]
  curatorId: string
}

const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
const MONO = { fontFamily: 'var(--MONO)', fontSize: '13px' }
const LOGO = { fontFamily: 'var(--LOGO)', fontWeight: 900 as const }

function StatBox({ value, label, sub, highlight }: { value: string | number; label: string; sub?: string; highlight?: boolean }) {
  return (
    <div style={{ padding: '12px 16px', borderRight: '1px solid rgba(24,22,20,.1)', flex: 1, minWidth: '100px' }}>
      <div style={{ ...LOGO, fontSize: '32px', lineHeight: 1, color: highlight ? 'var(--RED)' : 'var(--INK)', marginBottom: '4px' }}>
        {typeof value === 'number' ? String(value).padStart(2, '0') : value}
      </div>
      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', lineHeight: 1.5 }}>
        {label}
        {sub && <><br /><span style={{ opacity: 0.6 }}>{sub}</span></>}
      </div>
    </div>
  )
}

export default function CuratorAnalytics({ markets, curatorId }: Props) {
  const totalCheckins = markets.reduce((sum, m) => sum + m.checkin_count, 0)
  const totalMarkets = markets.length
  const avgCheckins = totalMarkets > 0 ? (totalCheckins / totalMarkets).toFixed(1) : '0'

  // Top markets by checkins
  const topMarkets = [...markets]
    .filter(m => m.checkin_count > 0)
    .sort((a, b) => b.checkin_count - a.checkin_count)
    .slice(0, 5)

  // Category breakdown
  const categoryCounts: Record<string, number> = {}
  let totalWithCategory = 0
  markets.forEach(m => {
    m.attending_makers.forEach(maker => {
      if (maker.category) {
        categoryCounts[maker.category] = (categoryCounts[maker.category] ?? 0) + 1
        totalWithCategory++
      }
    })
  })
  const categoryBreakdown = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])

  // Maker frequency — how many times each maker appeared
  const makerCounts: Record<string, { name: string; slug: string | null; count: number }> = {}
  markets.forEach(m => {
    m.attending_makers.forEach(maker => {
      if (!makerCounts[maker.id]) {
        makerCounts[maker.id] = { name: maker.display_name, slug: maker.slug, count: 0 }
      }
      makerCounts[maker.id].count++
    })
  })
  const topMakers = Object.values(makerCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Market status breakdown
  const statusBreakdown = markets.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusColors: Record<string, string> = {
    live: 'var(--RED)',
    community_live: 'var(--GRN)',
    scheduled: 'rgba(24,22,20,.5)',
    shadow: 'rgba(24,22,20,.2)',
    cancelled: 'var(--INK)',
  }

  function formatDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short'
    }).toUpperCase()
  }

  return (
    <div style={{ background: 'var(--P)' }}>

      {/* Top stats */}
      <div style={{ display: 'flex', borderBottom: '2px solid rgba(24,22,20,.1)', flexWrap: 'wrap' }}>
        <StatBox value={totalMarkets} label="TOTAL MARKETS" sub="NEXT 60 DAYS" />
        <StatBox value={totalCheckins} label="TOTAL CHECK-INS" sub="ALL MARKETS" highlight={totalCheckins > 0} />
        <StatBox value={avgCheckins} label="AVG CHECK-INS" sub="PER MARKET" />
        <StatBox value={topMakers.length} label="UNIQUE MAKERS" sub="APPEARED" />
      </div>

      {/* Market status breakdown */}
      <div style={{ padding: '14px 16px', borderBottom: '2px solid rgba(24,22,20,.1)' }}>
        <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>STATUS BREAKDOWN</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(statusBreakdown).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', border: '1px solid rgba(24,22,20,.1)', background: 'var(--P2)' }}>
              <div style={{ width: '8px', height: '8px', background: statusColors[status] ?? 'var(--INK)', flexShrink: 0 }} />
              <span style={{ ...T, fontSize: '9px', color: 'var(--INK)' }}>{status.replace('_', ' ').toUpperCase()}</span>
              <span style={{ ...LOGO, fontSize: '14px', color: 'var(--INK)' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div style={{ padding: '14px 16px', borderBottom: '2px solid rgba(24,22,20,.1)' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>
            MAKER CATEGORY BREAKDOWN — {totalWithCategory} CHECK-INS WITH CATEGORY DATA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categoryBreakdown.map(([cat, count]) => {
              const pct = totalWithCategory > 0 ? Math.round((count / totalWithCategory) * 100) : 0
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ ...T, fontSize: '9px', fontWeight: 700, color: 'var(--INK)', width: '140px', flexShrink: 0 }}>
                    {cat.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(24,22,20,.08)', position: 'relative' as const, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'var(--INK)', transition: 'width .3s' }} />
                  </div>
                  <div style={{ ...T, fontSize: '9px', color: 'var(--INK)', width: '36px', textAlign: 'right' as const, flexShrink: 0 }}>
                    {pct}%
                  </div>
                  <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', width: '24px', textAlign: 'right' as const, flexShrink: 0 }}>
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid rgba(24,22,20,.1)' }}>

        {/* Top markets by check-ins */}
        <div style={{ borderRight: '2px solid rgba(24,22,20,.1)', padding: '14px 16px' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>TOP MARKETS BY CHECK-INS</div>
          {topMarkets.length === 0 ? (
            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.25)' }}>NO CHECK-INS YET</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {topMarkets.map((m, i) => (
                <Link key={m.id} href={`/markets/${m.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.08)' }}>
                  <div style={{ ...LOGO, fontSize: '18px', color: 'rgba(24,22,20,.2)', width: '20px', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...T, fontSize: '9px', fontWeight: 700, color: 'var(--INK)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.space.name}</div>
                    <div style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.4)' }}>{formatDate(m.event_date)}</div>
                  </div>
                  <div style={{ ...LOGO, fontSize: '20px', color: 'var(--RED)', flexShrink: 0 }}>{m.checkin_count}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Top makers by appearances */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>TOP MAKERS BY APPEARANCES</div>
          {topMakers.length === 0 ? (
            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.25)' }}>NO DATA YET</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {topMakers.map((maker, i) => (
                <Link key={maker.slug ?? i} href={`/brands/${maker.slug ?? ''}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.08)' }}>
                  <div style={{ ...LOGO, fontSize: '18px', color: 'rgba(24,22,20,.2)', width: '20px', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...T, fontSize: '9px', fontWeight: 700, color: 'var(--INK)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{maker.name}</div>
                  </div>
                  <div style={{ ...LOGO, fontSize: '20px', color: 'var(--INK)', flexShrink: 0 }}>{maker.count}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Full market table */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>ALL MARKETS — CHECK-IN BREAKDOWN</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '300px', overflowY: 'auto' }}>
          {markets.length === 0 ? (
            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.25)' }}>NO MARKETS YET</div>
          ) : (
            markets.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 10px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.08)' }}>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', width: '60px', flexShrink: 0 }}>{formatDate(m.event_date)}</div>
                <div style={{ flex: 1, ...T, fontSize: '9px', fontWeight: 700, color: 'var(--INK)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.space.name}</div>
                <div style={{ width: '8px', height: '8px', background: statusColors[m.status] ?? 'var(--INK)', flexShrink: 0 }} />
                <div style={{ ...LOGO, fontSize: '16px', color: m.checkin_count > 0 ? 'var(--RED)' : 'rgba(24,22,20,.2)', flexShrink: 0, minWidth: '24px', textAlign: 'right' as const }}>
                  {m.checkin_count}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
