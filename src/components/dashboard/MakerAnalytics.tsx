import type { MarketAnalytics, AnalyticsSummary } from '@/lib/queries/analytics'

interface Props {
  byMarket: MarketAnalytics[]
  summary: AnalyticsSummary
}

function fmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function formatDate(d: string): string {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  }).toUpperCase()
}

export default function MakerAnalytics({ byMarket, summary }: Props) {
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const hasData = summary.total_views > 0 || summary.total_saves > 0 || byMarket.length > 0

  return (
    <div style={{ padding: '0' }}>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '3px solid var(--INK)' }}>
        {[
          { label: 'PROFILE VIEWS', value: fmt(summary.total_views), sub: 'LAST 90 DAYS' },
          { label: 'CIRCUIT SAVES', value: fmt(summary.total_saves), sub: 'ALL TIME' },
          { label: 'INSTAGRAM TAPS', value: fmt(summary.total_instagram_taps), sub: 'LAST 90 DAYS' },
          { label: 'OFFER OPENS', value: fmt(summary.total_offer_redeems), sub: 'LAST 90 DAYS' },
        ].map((s, i, arr) => (
          <div key={i} style={{
            padding: '14px 12px',
            borderRight: i < arr.length - 1 ? '2px solid rgba(24,22,20,.1)' : 'none',
            background: i === 0 ? 'var(--P2)' : 'var(--P)',
          }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(24px,5vw,36px)', color: 'var(--INK)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.5)', marginTop: '4px' }}>
              {s.label}
            </div>
            <div style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.3)', marginTop: '2px' }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Best performer */}
      {summary.best_market && hasData && (
        <div style={{ padding: '10px 14px', borderBottom: '2px solid rgba(24,22,20,.08)', background: 'var(--P2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)' }}>BEST MARKET</span>
          <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--RED)', letterSpacing: '-0.01em' }}>
            {summary.best_market}
          </span>
          <span style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.3)', marginLeft: 'auto' }}>BY VIEWS + SAVES</span>
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: 'rgba(24,22,20,.1)', marginBottom: '8px' }}>
            NO DATA YET
          </div>
          <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
            Analytics start tracking once visitors view your brand profile.<br />
            Check in to your next market to start collecting data.
          </div>
        </div>
      )}

      {/* Per-market table */}
      {byMarket.length > 0 && (
        <div>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 60px', gap: 0, padding: '8px 14px', borderBottom: '2px solid var(--INK)', background: 'var(--INK)' }}>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.4)' }}>MARKET</div>
            {['VIEWS', 'SAVES', 'IG TAPS', 'OFFERS'].map(h => (
              <div key={h} style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.4)', textAlign: 'right' as const }}>{h}</div>
            ))}
          </div>

          {byMarket.map((m, i) => {
            const total = m.views + m.saves + m.instagram_taps + m.offer_redeems
            const maxTotal = Math.max(...byMarket.map(b => b.views + b.saves + b.instagram_taps + b.offer_redeems), 1)
            const barWidth = Math.round((total / maxTotal) * 100)

            return (
              <div key={m.market_id} style={{
                borderBottom: '1px solid rgba(24,22,20,.08)',
                background: i % 2 === 0 ? 'var(--P)' : 'var(--P2)',
                position: 'relative' as const,
              }}>
                {/* Performance bar background */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: `${barWidth}%`,
                  background: 'rgba(200,41,26,.04)',
                  pointerEvents: 'none',
                }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 60px', gap: 0, padding: '10px 14px', position: 'relative' as const }}>
                  {/* Market info */}
                  <div>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>
                      {m.market_title}
                    </div>
                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.38)' }}>
                      {m.space_name}{m.event_date ? ` · ${formatDate(m.event_date)}` : ''}
                    </div>
                  </div>

                  {/* Stats */}
                  {[m.views, m.saves, m.instagram_taps, m.offer_redeems].map((val, j) => (
                    <div key={j} style={{
                      fontFamily: 'var(--MONO)', fontWeight: 800,
                      fontSize: '18px', color: val > 0 ? 'var(--INK)' : 'rgba(24,22,20,.2)',
                      textAlign: 'right' as const, lineHeight: 1,
                      paddingTop: '2px',
                    }}>
                      {fmt(val)}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Footer note */}
          <div style={{ padding: '10px 14px', borderTop: '2px solid rgba(24,22,20,.06)' }}>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.3)' }}>
              SHOWING LAST 90 DAYS · {byMarket.length} MARKET{byMarket.length !== 1 ? 'S' : ''} ATTENDED
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
