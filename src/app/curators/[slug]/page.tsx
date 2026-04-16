import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCuratorBySlug } from '@/lib/queries/curators'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const dynamic = 'force-dynamic'
interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const curator = await getCuratorBySlug(slug)
  if (!curator) return { title: 'Curator Not Found' }
  return { title: `${curator.display_name} — WEAREMAKERS.PT`, description: curator.bio ?? `${curator.display_name} — market curator.`, alternates: { canonical: `/curators/${slug}` } }
}

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560', GREEN = '#1a5c30'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

function formatDate(d: string) { return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase() }
function formatTime(t: string) { return t.slice(0, 5) }

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  live: { label: '● LIVE NOW', color: GREEN }, community_live: { label: '● LIVE NOW', color: GREEN },
  scheduled: { label: 'SCHEDULED', color: STONE },
}

export default async function CuratorPage({ params }: Props) {
  const { slug } = await params
  const [curator, user] = await Promise.all([getCuratorBySlug(slug), getCurrentUser()])
  if (!curator) notFound()

  const today = new Date().toISOString().split('T')[0]
  const liveMarkets = curator.markets.filter(m => ['live', 'community_live'].includes(m.status))
  const upcomingMarkets = curator.markets.filter(m => m.event_date >= today && !['live', 'community_live'].includes(m.status))
  const liveFeatured = curator.featured_makers.filter(m => m.is_live)

  return (
    <>
      <SiteHeader user={user} liveCount={liveMarkets.length} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        {/* Dark header */}
        <div style={{ background: INK, padding: '52px 52px 40px', borderBottom: B }}>
          <div style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '12px' }}>
            MARKET CURATOR · WEAREMAKERS.PT
            {liveMarkets.length > 0 && <span style={{ marginLeft: '12px', background: GREEN, color: WHITE, padding: '2px 10px', fontSize: '10px' }}>● LIVE NOW</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {curator.avatar_url && (
              <div style={{ width: '80px', height: '80px', flexShrink: 0, border: '2px solid rgba(244,241,236,0.2)', overflow: 'hidden' }}>
                <img src={curator.avatar_url} alt={curator.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(36px,8vw,68px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: WHITE, marginBottom: '10px' }}>
                {curator.display_name}
              </h1>
              {curator.organisation_name && (
                <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {curator.organisation_url ? <a href={curator.organisation_url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(244,241,236,0.4)', textDecoration: 'none' }}>{curator.organisation_name} ↗</a> : curator.organisation_name}
                </div>
              )}
              {curator.instagram_handle && (
                <a href={`https://instagram.com/${curator.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', color: RED, textDecoration: 'none' }}>
                  {curator.instagram_handle} ↗
                </a>
              )}
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, borderTop: `1px solid rgba(244,241,236,0.1)`, paddingTop: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'UPCOMING', value: upcomingMarkets.length, sub: 'MARKETS' },
              { label: 'FEATURED', value: curator.featured_makers.length, sub: 'BRANDS' },
              { label: liveFeatured.length > 0 ? `${liveFeatured.length} LIVE` : 'OFFLINE', value: '', sub: 'TODAY' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: '28px', marginRight: '28px', borderRight: i < 2 ? `1px solid rgba(244,241,236,0.1)` : 'none' }}>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '32px', color: i === 2 && liveFeatured.length > 0 ? RED : WHITE, lineHeight: 1 }}>{s.value || s.label}</div>
                <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '4px' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        {curator.bio && (
          <div style={{ padding: '32px 52px', borderBottom: B }}>
            <p style={{ fontFamily: FB, fontSize: '15px', color: STONE, lineHeight: 1.75, maxWidth: '640px', margin: 0 }}>{curator.bio}</p>
          </div>
        )}

        {/* Live markets */}
        {liveMarkets.length > 0 && (
          <div>
            <div style={{ padding: '0 52px', height: '46px', display: 'flex', alignItems: 'center', gap: '10px', background: GREEN, borderBottom: B }}>
              <span style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: WHITE }}>● OPEN RIGHT NOW</span>
            </div>
            {liveMarkets.map((market, i) => <MarketRow key={market.id} market={market} i={i} isLive />)}
          </div>
        )}

        {/* Upcoming markets */}
        {upcomingMarkets.length > 0 && (
          <div>
            <div className="section-rule"><span className="section-rule-title">UPCOMING MARKETS</span></div>
            {upcomingMarkets.map((market, i) => <MarketRow key={market.id} market={market} i={i} />)}
          </div>
        )}

        {/* Featured brands */}
        {curator.featured_makers.length > 0 && (
          <div>
            <div className="section-rule">
              <span className="section-rule-title">SPOTLIGHT — FEATURED BRANDS</span>
              <span className="section-rule-link">{curator.featured_makers.length} BRANDS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: B }} className="curator-makers">
              {curator.featured_makers.map((maker) => {
                const href = `/brands/${maker.slug ?? maker.id}`
                const cardImage = maker.featured_photo_url ?? maker.avatar_url ?? null
                const category = maker.bio_i18n?._category?.split(',')[0]?.trim() ?? null
                return (
                  <Link key={maker.id} href={href} style={{ textDecoration: 'none', display: 'block', borderRight: Bsm, borderBottom: Bsm, background: maker.is_live ? 'rgba(232,0,28,.02)' : WHITE, position: 'relative', overflow: 'hidden', transition: 'background .15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = PAPER}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = maker.is_live ? 'rgba(232,0,28,.02)' : WHITE}
                  >
                    {maker.is_live && <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, background: GREEN, fontFamily: FM, fontWeight: 700, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: WHITE, padding: '4px 8px', zIndex: 2, textAlign: 'center' }}>● LIVE NOW</div>}
                    <div style={{ aspectRatio: '1', overflow: 'hidden', background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
                      {cardImage ? <img src={cardImage} alt={maker.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: FH, fontWeight: 900, fontSize: '32px', color: 'rgba(12,12,12,0.12)' }}>{maker.display_name.slice(0, 2).toUpperCase()}</span>}
                      {maker.is_verified && <div style={{ position: 'absolute' as const, top: maker.is_live ? '26px' : '6px', right: '6px', background: INK, fontFamily: FM, fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: WHITE, padding: '2px 6px' }}>✦ PRO</div>}
                    </div>
                    <div style={{ padding: '10px 12px 14px', borderTop: Bsm }}>
                      <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.03em', color: INK, lineHeight: 1, marginBottom: '3px' }}>{maker.display_name}</div>
                      {category && <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: STONE }}>{category}</div>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {curator.markets.length === 0 && curator.featured_makers.length === 0 && (
          <div style={{ padding: '64px 52px', textAlign: 'center' }}>
            <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: STONE }}>No upcoming markets scheduled.</div>
          </div>
        )}

        <div style={{ padding: '24px 52px', borderTop: B }}>
          <Link href="/markets" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>← ALL MARKETS</Link>
        </div>
      </main>
      <style>{`
        @media (max-width: 860px) {
          .curator-makers { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </>
  )
}

function MarketRow({ market, i, isLive = false }: { market: any; i: number; isLive?: boolean }) {
  const st = STATUS_LABEL[market.status] ?? { label: market.status.toUpperCase(), color: STONE }
  return (
    <div style={{ padding: '0 52px', display: 'flex', gap: '20px', alignItems: 'center', height: '72px', borderBottom: Bsm, background: i % 2 === 0 ? WHITE : PAPER, transition: 'background .15s' }}>
      <div style={{ flexShrink: 0, minWidth: '80px' }}>
        <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '13px', color: INK, lineHeight: 1.3 }}>{formatDate(market.event_date)}</div>
        {market.event_date_end && market.event_date_end !== market.event_date && <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, marginTop: '2px' }}>→ {formatDate(market.event_date_end)}</div>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1 }}>{market.title}</div>
        <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, marginTop: '3px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
          <span>{formatTime(market.starts_at)}–{formatTime(market.ends_at)}</span>
          {market.space_name && market.space_slug && <Link href={`/spaces/${market.space_slug}`} style={{ color: RED, textDecoration: 'none', fontWeight: 700 }}>{market.space_name} →</Link>}
        </div>
      </div>
      <div style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isLive ? GREEN : st.color, flexShrink: 0 }}>
        {isLive ? '● LIVE NOW' : st.label}
      </div>
    </div>
  )
}
