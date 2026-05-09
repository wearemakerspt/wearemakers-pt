import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/queries/auth'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ spaceId: string }> }

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase()
}

function fmtShort(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short'
  }).toUpperCase()
}

export default async function SpaceImpactReport({ params }: Props) {
  const { spaceId } = await params
  const user = await getCurrentUser()
  if (!user || user.profile?.role !== 'admin') redirect('/')

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const supabase = await createClient()

  // Fetch space
  const { data: space } = await supabase
    .from('spaces')
    .select('id, name, slug, address, parish, city, description')
    .eq('id', spaceId)
    .single()

  if (!space) notFound()

  // Date range: last 90 days
  const now = new Date()
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400_000)
  const from = ninetyDaysAgo.toISOString().split('T')[0]
  const to = now.toISOString().split('T')[0]

  // Markets at this space
  const { data: markets } = await serviceClient
    .from('markets')
    .select(`
      id, title, event_date, status, starts_at, ends_at,
      curator:profiles!markets_curator_id_fkey(display_name)
    `)
    .eq('space_id', spaceId)
    .gte('event_date', from)
    .lte('event_date', to)
    .not('status', 'eq', 'shadow')
    .order('event_date', { ascending: false })

  const marketIds = (markets ?? []).map((m: any) => m.id)

  // Attendance at these markets
  let attendance: any[] = []
  let makerCounts: Record<string, { name: string; count: number }> = {}
  let totalCheckins = 0
  let categoryMap: Record<string, number> = {}

  if (marketIds.length > 0) {
    const { data: att } = await serviceClient
      .from('attendance')
      .select(`
        maker_id, checked_in_at,
        market_id,
        maker:profiles!attendance_maker_id_fkey(display_name, bio_i18n)
      `)
      .in('market_id', marketIds)

    attendance = att ?? []
    totalCheckins = attendance.length

    attendance.forEach((a: any) => {
      const name = a.maker?.display_name ?? 'Unknown'
      const cat = a.maker?.bio_i18n?._category?.split(',')[0]?.trim() ?? null
      if (!makerCounts[a.maker_id]) makerCounts[a.maker_id] = { name, count: 0 }
      makerCounts[a.maker_id].count++
      if (cat) categoryMap[cat] = (categoryMap[cat] ?? 0) + 1
    })
  }

  const topMakers = Object.values(makerCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const totalMarkets = (markets ?? []).filter((m: any) => m.status !== 'cancelled').length
  const cancelledMarkets = (markets ?? []).filter((m: any) => m.status === 'cancelled').length
  const uniqueMakers = Object.keys(makerCounts).length
  const categoryBreakdown = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])
  const totalWithCat = Object.values(categoryMap).reduce((a, b) => a + b, 0)

  const generatedDate = now.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase()

  const INK = '#1A1A1A'
  const RED = '#C8291A'
  const PAPER = '#F4F1EC'
  const STONE = '#6B6560'
  const GREEN = '#1a5c30'

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: ${PAPER}; font-family: 'Helvetica Neue', Arial, sans-serif; }
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
        .page { max-width: 800px; margin: 0 auto; background: ${PAPER}; }
        .tag { font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; }
        .mono { font-family: 'Courier New', monospace; }
        .condensed { font-family: 'Arial Narrow', 'Helvetica Neue Condensed', Arial, sans-serif; font-weight: 900; text-transform: uppercase; }
      `}</style>

      {/* Print button — hidden when printing */}
      <div className="no-print" style={{ background: INK, padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: PAPER, fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          SPACE IMPACT REPORT — {space.name.toUpperCase()}
        </span>
        <button
          onClick={() => window.print()}
          style={{ background: RED, color: PAPER, border: 'none', padding: '10px 20px', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          ↓ DOWNLOAD PDF (PRINT)
        </button>
      </div>

      <div className="page">

        {/* Header */}
        <div style={{ background: INK, padding: '32px 40px 28px', borderBottom: `4px solid ${RED}` }}>
          <div className="tag mono" style={{ color: RED, marginBottom: '8px' }}>
            WEAREMAKERS.PT · SPACE IMPACT REPORT · GENERATED {generatedDate}
          </div>
          <div className="condensed" style={{ fontSize: '42px', color: PAPER, lineHeight: 0.9, marginBottom: '8px' }}>
            {space.name.toUpperCase()}
          </div>
          <div className="tag mono" style={{ color: 'rgba(244,241,236,0.45)', marginTop: '8px' }}>
            {[space.address, space.parish, space.city].filter(Boolean).join(' · ').toUpperCase()}
          </div>
          <div className="tag mono" style={{ color: 'rgba(244,241,236,0.3)', marginTop: '4px' }}>
            PERIOD: {fmt(from)} → {fmt(to)} (90 DAYS)
          </div>
        </div>

        {/* Key stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `2px solid ${INK}` }}>
          {[
            { value: totalMarkets, label: 'MARKETS HELD', sub: 'EXCL. CANCELLED', color: INK },
            { value: totalCheckins, label: 'TOTAL CHECK-INS', sub: 'MAKER ATTENDANCES', color: totalCheckins > 0 ? RED : INK },
            { value: uniqueMakers, label: 'UNIQUE MAKERS', sub: 'APPEARED AT SPACE', color: INK },
            { value: cancelledMarkets, label: 'CANCELLATIONS', sub: 'IN PERIOD', color: cancelledMarkets > 0 ? STONE : INK },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px 16px', borderRight: i < 3 ? `1px solid rgba(12,12,12,0.15)` : 'none' }}>
              <div className="condensed" style={{ fontSize: '40px', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div className="tag mono" style={{ color: INK, fontSize: '8px', marginTop: '4px' }}>{s.label}</div>
              <div className="tag mono" style={{ color: STONE, fontSize: '7px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        {categoryBreakdown.length > 0 && (
          <div style={{ padding: '20px 40px', borderBottom: `2px solid ${INK}` }}>
            <div className="tag mono" style={{ color: STONE, fontSize: '8px', marginBottom: '12px' }}>MAKER CATEGORY BREAKDOWN</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {categoryBreakdown.map(([cat, count]) => {
                const pct = totalWithCat > 0 ? Math.round((count / totalWithCat) * 100) : 0
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="tag mono" style={{ width: '120px', fontSize: '8px', fontWeight: 700, color: INK, flexShrink: 0 }}>{cat.toUpperCase()}</div>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(12,12,12,0.1)', position: 'relative' as const }}>
                      <div style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: `${pct}%`, background: INK }} />
                    </div>
                    <div className="tag mono" style={{ fontSize: '8px', color: INK, width: '30px', textAlign: 'right' as const }}>{pct}%</div>
                    <div className="tag mono" style={{ fontSize: '8px', color: STONE, width: '20px', textAlign: 'right' as const }}>{count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `2px solid ${INK}` }}>

          {/* Markets list */}
          <div style={{ borderRight: `2px solid ${INK}`, padding: '20px 24px' }}>
            <div className="tag mono" style={{ color: STONE, fontSize: '8px', marginBottom: '12px' }}>MARKETS IN PERIOD</div>
            {(markets ?? []).length === 0 ? (
              <div className="tag mono" style={{ color: STONE, fontSize: '8px' }}>NO MARKETS IN PERIOD</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(markets ?? []).map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid rgba(12,12,12,0.08)' }}>
                    <div className="tag mono" style={{ fontSize: '8px', color: STONE, width: '50px', flexShrink: 0 }}>{fmtShort(m.event_date)}</div>
                    <div className="tag mono" style={{ fontSize: '8px', fontWeight: 700, color: INK, flex: 1 }}>{m.title.toUpperCase().replace(` · ${space.name.toUpperCase()}`, '')}</div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: m.status === 'cancelled' ? STONE : m.status === 'live' || m.status === 'community_live' ? RED : GREEN }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top makers */}
          <div style={{ padding: '20px 24px' }}>
            <div className="tag mono" style={{ color: STONE, fontSize: '8px', marginBottom: '12px' }}>TOP MAKERS BY APPEARANCES</div>
            {topMakers.length === 0 ? (
              <div className="tag mono" style={{ color: STONE, fontSize: '8px' }}>NO CHECK-IN DATA YET</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {topMakers.map((maker, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid rgba(12,12,12,0.08)' }}>
                    <div className="condensed" style={{ fontSize: '14px', color: 'rgba(12,12,12,0.2)', width: '16px', flexShrink: 0 }}>{i + 1}</div>
                    <div className="tag mono" style={{ fontSize: '8px', fontWeight: 700, color: INK, flex: 1 }}>{maker.name.toUpperCase()}</div>
                    <div className="condensed" style={{ fontSize: '16px', color: RED, flexShrink: 0 }}>{maker.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 40px', borderTop: `1px solid rgba(12,12,12,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="tag mono" style={{ color: STONE, fontSize: '7px' }}>
            WEAREMAKERS.PT · LISBON STREET MARKETS
          </div>
          <div className="tag mono" style={{ color: STONE, fontSize: '7px' }}>
            REPORT GENERATED {generatedDate}
          </div>
          <div className="tag mono" style={{ color: STONE, fontSize: '7px' }}>
            wearemakers.pt
          </div>
        </div>

      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        // Auto-trigger print if ?print=1 in URL
        if (window.location.search.includes('print=1')) {
          window.addEventListener('load', () => setTimeout(() => window.print(), 500));
        }
      `}} />
    </>
  )
}
