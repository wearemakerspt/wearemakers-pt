import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getSpaceBySlug } from '@/lib/queries/spaces'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const dynamic = 'force-dynamic'
interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const space = await getSpaceBySlug(slug)
  if (!space) return { title: 'Space Not Found' }
  return {
    title: `${space.name} — WEAREMAKERS.PT`,
    description: space.description ?? `${space.name} — Lisbon street market space.`,
    alternates: { canonical: `/spaces/${slug}` },
  }
}

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560', GREEN = '#1a5c30'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

const GEM_ICONS: Record<string, string> = { coffee: '☕', food: '🍽', drinks: '🍷', studio: '◆', shop: '◈' }

export default async function SpacePage({ params }: Props) {
  const { slug } = await params
  const [space, user] = await Promise.all([getSpaceBySlug(slug), getCurrentUser()])
  if (!space) notFound()

  const today = new Date().toISOString().split('T')[0]
  const liveMarkets = (space.markets ?? []).filter((m: any) => ['live', 'community_live'].includes(m.status))
  const upcomingMarkets = (space.markets ?? []).filter((m: any) => m.event_date >= today && !['live', 'community_live'].includes(m.status))
  const liveMakers = (space.markets ?? []).filter((m: any) => ['live', 'community_live'].includes(m.status)).flatMap((m: any) => m.makers ?? [])

  return (
    <>
      <SiteHeader user={user} liveCount={liveMarkets.length} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        <style>{`
          .space-maker-row:hover { background: ${PAPER} !important; }
          .space-market-row:hover { background: ${PAPER} !important; }
          @media (max-width: 860px) {
            .space-hero { padding: 40px 24px 32px !important; }
            .section-rule { padding: 0 16px !important; }
            .space-maker-row { padding: 12px 16px !important; }
            .space-market-row { padding: 0 16px !important; }
          }
        `}</style>

        {/* Dark header */}
        <div style={{ background: INK, padding: '52px 52px 40px', borderBottom: B }} className="space-hero">
          <div style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '10px' }}>
            MARKET SPACE · {(space.parish ?? '').toUpperCase()}
            {liveMarkets.length > 0 && <span style={{ marginLeft: '12px', background: GREEN, color: WHITE, padding: '2px 10px', fontSize: '10px' }}>● LIVE NOW</span>}
          </div>
          <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(52px,8vw,96px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: WHITE, marginBottom: '20px' }}>
            {space.name}
          </h1>
          {space.address && (
            <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '28px' }}>
              {space.address}
            </div>
          )}
          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, borderTop: `1px solid rgba(244,241,236,0.1)`, paddingTop: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'UPCOMING', value: upcomingMarkets.length, sub: 'MARKETS' },
              { label: 'LIVE NOW', value: liveMakers.length, sub: 'MAKERS', highlight: liveMakers.length > 0 },
              { label: 'GEMS NEARBY', value: (space.gems ?? []).length, sub: 'PLACES' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: '28px', marginRight: '28px', borderRight: i < 2 ? `1px solid rgba(244,241,236,0.1)` : 'none' }}>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '36px', color: s.highlight ? RED : WHITE, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {space.description && (
          <div style={{ padding: '32px 52px', borderBottom: B }}>
            <p style={{ fontFamily: FB, fontSize: '15px', color: STONE, lineHeight: 1.75, maxWidth: '640px', margin: 0 }}>{space.description}</p>
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: 'flex', borderBottom: B }}>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((space.address ?? space.name) + ', Lisbon')}`} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, fontFamily: FM, fontWeight: 700, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '14px 20px', borderRight: B, background: liveMarkets.length > 0 ? RED : WHITE, color: liveMarkets.length > 0 ? WHITE : INK, textDecoration: 'none', textAlign: 'center', display: 'block', transition: 'background .15s' }}>
            DIRECTIONS →
          </a>
          <Link href="/gems" style={{ flex: 1, fontFamily: FM, fontWeight: 700, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '14px 20px', background: WHITE, color: INK, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
            HIDDEN GEMS →
          </Link>
        </div>

        {/* Live makers */}
        {liveMakers.length > 0 && (
          <div>
            <div style={{ background: GREEN, padding: '0 52px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: B }}>
              <span style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: WHITE }}>● LIVE NOW</span>
              <span style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{liveMakers.length} MAKERS</span>
            </div>
            {liveMakers.map((maker: any, i: number) => (
              <Link key={maker.maker_id ?? maker.id} href={`/brands/${maker.maker_slug ?? maker.slug ?? maker.id}`} className="space-maker-row"
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '16px', alignItems: 'center', padding: '14px 52px', borderBottom: Bsm, background: WHITE, transition: 'background .15s' }}>
                <div style={{ width: '44px', height: '44px', flexShrink: 0, background: INK, border: B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontWeight: 900, fontSize: '16px', color: RED, overflow: 'hidden', position: 'relative' }}>
                  {maker.avatar_url ? <img src={maker.avatar_url} alt={maker.maker_name ?? maker.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : (maker.maker_name ?? maker.display_name).slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1 }}>{maker.maker_name ?? maker.display_name}</div>
                  {maker.stall_label && <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' }}>Stall {maker.stall_label}</div>}
                </div>
                {maker.is_verified && <span style={{ fontFamily: FM, fontSize: '10px', color: INK, border: `1px solid ${INK}`, padding: '2px 6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>✦ PRO</span>}
              </Link>
            ))}
          </div>
        )}

        {/* Upcoming markets */}
        {upcomingMarkets.length > 0 && (
          <div>
            <div className="section-rule" style={{ padding: '0 52px' }}>
              <span className="section-rule-title">UPCOMING MARKETS</span>
              <Link href="/markets" className="section-rule-link">ALL MARKETS →</Link>
            </div>
            {upcomingMarkets.map((market: any, i: number) => (
              <Link key={market.id} href={`/markets/${market.id}`} className="space-market-row"
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '20px', padding: '0 52px', height: '72px', borderBottom: Bsm, background: i % 2 === 0 ? WHITE : PAPER, transition: 'background .15s' }}>
                <div style={{ flexShrink: 0, width: '80px' }}>
                  <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '28px', color: INK, lineHeight: 1 }}>
                    {new Date(market.event_date + 'T12:00:00').getDate()}
                  </div>
                  <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {new Date(market.event_date + 'T12:00:00').toLocaleDateString('en-GB', { month: 'short', weekday: 'short' }).toUpperCase()}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1 }}>{market.title}</div>
                  <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, marginTop: '3px', letterSpacing: '0.06em' }}>{market.starts_at?.slice(0,5)}–{market.ends_at?.slice(0,5)}</div>
                </div>
                <div style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: STONE, letterSpacing: '0.1em', textTransform: 'uppercase', border: `1px solid ${STONE}`, padding: '4px 10px' }}>SCHEDULED</div>
                <div style={{ fontFamily: FM, fontSize: '14px', color: 'rgba(12,12,12,0.2)' }}>→</div>
              </Link>
            ))}
          </div>
        )}

        {/* Gems nearby */}
        {(space.gems ?? []).length > 0 && (
          <div>
            <div className="section-rule" style={{ padding: '0 52px' }}>
              <span className="section-rule-title">HIDDEN GEMS NEARBY</span>
              <Link href="/gems" className="section-rule-link">{space.gems.length} PLACES →</Link>
            </div>
            {space.gems.map((g: any) => (
              <div key={g.id} style={{ display: 'flex', gap: 0, borderBottom: Bsm, background: WHITE, minHeight: '72px' }}>
                <div style={{ width: '56px', flexShrink: 0, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', borderRight: B, minHeight: '72px' }}>
                  {GEM_ICONS[g.category] ?? '◈'}
                </div>
                <div style={{ padding: '14px 20px', flex: 1 }}>
                  <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, marginBottom: '4px' }}>{g.name}</div>
                  {g.description && <div style={{ fontFamily: FB, fontSize: '13px', color: STONE, lineHeight: 1.5, fontStyle: 'italic' }}>{g.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back */}
        <div style={{ padding: '24px 52px', borderTop: B }}>
          <Link href="/spaces" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>← ALL SPACES</Link>
        </div>
      </main>
    </>
  )
}
