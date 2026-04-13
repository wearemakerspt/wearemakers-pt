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
  return {
    title: `${curator.display_name} — WEAREMAKERS.PT`,
    description: curator.bio ?? `${curator.display_name} — market curator at Lisbon street markets.`,
    alternates: { canonical: `/curators/${slug}` },
  }
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  live:           { label: '● LIVE NOW',  color: '#1a5c30' },
  community_live: { label: '● LIVE NOW',  color: '#1a5c30' },
  scheduled:      { label: 'SCHEDULED',   color: 'rgba(24,22,20,.5)' },
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  }).toUpperCase()
}

function formatTime(t: string) {
  return t.slice(0, 5)
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
      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

        {/* ── Dark header ── */}
        <div style={{ background: '#181614', padding: '20px 16px 18px', borderBottom: '3px solid #181614' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '10px' }}>
            MARKET CURATOR · WEAREMAKERS.PT
            {liveMarkets.length > 0 && (
              <span style={{ marginLeft: '12px', background: '#1a5c30', color: '#fff', padding: '2px 8px', fontSize: '9px' }}>
                ● LIVE NOW
              </span>
            )}
          </div>

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {curator.avatar_url && (
              <div style={{ width: '72px', height: '72px', flexShrink: 0, border: '3px solid rgba(240,236,224,.15)', overflow: 'hidden' }}>
                <img src={curator.avatar_url} alt={curator.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(36px,10vw,68px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: '#f0ece0', marginBottom: '8px' }}>
                {curator.display_name}
              </h1>
              {curator.organisation_name && (
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {curator.organisation_url
                    ? <a href={curator.organisation_url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(240,236,224,.4)', textDecoration: 'none' }}>{curator.organisation_name} ↗</a>
                    : curator.organisation_name
                  }
                </div>
              )}
              {curator.instagram_handle && (
                <a href={`https://instagram.com/${curator.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '15px', color: '#c8291a', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {curator.instagram_handle}
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', opacity: 0.6 }}>↗</span>
                </a>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(240,236,224,.1)', paddingTop: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'UPCOMING MARKETS', value: upcomingMarkets.length, sub: 'SCHEDULED' },
              { label: 'FEATURED BRANDS', value: curator.featured_makers.length, sub: 'IN SPOTLIGHT' },
              { label: liveFeatured.length > 0 ? `${liveFeatured.length} LIVE` : 'OFFLINE', value: '', sub: liveFeatured.length > 0 ? 'BRANDS NOW' : 'TODAY' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: '24px', marginRight: '24px', borderRight: i < 2 ? '1px solid rgba(240,236,224,.1)' : 'none' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: '28px', color: i === 2 && liveFeatured.length > 0 ? '#c8291a' : '#f0ece0', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: 'rgba(240,236,224,.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bio ── */}
        {curator.bio && (
          <div style={{ padding: '20px 16px', borderBottom: '3px solid #181614' }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '17px', color: '#181614', lineHeight: 1.75, marginBottom: 0 }}>
              {curator.bio}
            </p>
          </div>
        )}

        {/* ── Live markets ── */}
        {liveMarkets.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', background: '#1a5c30', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#fff', display: 'inline-block' }} />
              ● OPEN RIGHT NOW
            </div>
            {liveMarkets.map((market, i) => (
              <MarketRow key={market.id} market={market} i={i} isLive />
            ))}
          </div>
        )}

        {/* ── Upcoming markets ── */}
        {upcomingMarkets.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              UPCOMING MARKETS
            </div>
            {upcomingMarkets.map((market, i) => (
              <MarketRow key={market.id} market={market} i={i} />
            ))}
          </div>
        )}

        {/* ── Featured brands ── */}
        {curator.featured_makers.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              SPOTLIGHT — FEATURED BRANDS · {curator.featured_makers.length}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 0 }}>
              {curator.featured_makers.map((maker) => {
                const href = `/brands/${maker.slug ?? maker.id}`
                const cardImage = maker.featured_photo_url ?? maker.avatar_url ?? null
                const category = maker.bio_i18n?._category?.split(',')[0]?.trim() ?? null
                return (
                  <Link key={maker.id} href={href} style={{ textDecoration: 'none', display: 'block', borderRight: '2px solid #181614', borderBottom: '2px solid #181614', background: maker.is_live ? 'rgba(26,92,48,.04)' : '#f0ece0', position: 'relative' as const, overflow: 'hidden' }}>
                    {maker.is_live && (
                      <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, background: '#1a5c30', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', padding: '3px 8px', zIndex: 2, textAlign: 'center' }}>
                        ● LIVE NOW
                      </div>
                    )}
                    <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#e6e0d0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
                      {cardImage
                        ? <img src={cardImage} alt={maker.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '32px', color: 'rgba(24,22,20,.15)' }}>{maker.display_name.slice(0, 2).toUpperCase()}</span>
                      }
                      {maker.is_verified && (
                        <div style={{ position: 'absolute' as const, top: maker.is_live ? '22px' : '6px', right: '6px', background: '#181614', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f0ece0', padding: '2px 5px' }}>
                          ✦ PRO
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '8px 10px 10px', borderTop: '2px solid #181614' }}>
                      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '17px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1, marginBottom: '3px' }}>{maker.display_name}</div>
                      {category && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)' }}>{category}</div>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {curator.markets.length === 0 && curator.featured_makers.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)' }}>
              No upcoming markets scheduled.
            </div>
          </div>
        )}

        {/* ── Back ── */}
        <div style={{ padding: '12px 16px', borderTop: '3px solid #181614' }}>
          <Link href="/markets" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← ALL MARKETS
          </Link>
        </div>

      </main>
    </>
  )
}

function MarketRow({ market, i, isLive = false }: { market: any; i: number; isLive?: boolean }) {
  const st = STATUS_LABEL[market.status] ?? { label: market.status.toUpperCase(), color: 'rgba(24,22,20,.4)' }
  return (
    <div style={{ padding: '12px 14px', borderBottom: '2px solid rgba(24,22,20,.1)', background: i % 2 === 0 ? '#f0ece0' : '#e6e0d0', display: 'flex', gap: '14px', alignItems: 'center' }}>
      <div style={{ flexShrink: 0, minWidth: '80px' }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: '13px', color: '#181614', lineHeight: 1.3 }}>
          {formatDate(market.event_date)}
        </div>
        {market.event_date_end && market.event_date_end !== market.event_date && (
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>
            → {formatDate(market.event_date_end)}
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1 }}>
          {market.title}
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: 'rgba(24,22,20,.4)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
          <span>{formatTime(market.starts_at)}–{formatTime(market.ends_at)}</span>
          {market.space_name && market.space_slug && (
            <Link href={`/spaces/${market.space_slug}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{ color: '#c8291a', textDecoration: 'none', fontWeight: 700 }}>
              {market.space_name} →
            </Link>
          )}
          {market.space_name && !market.space_slug && (
            <span>{market.space_name}</span>
          )}
        </div>
      </div>
      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isLive ? '#1a5c30' : st.color, flexShrink: 0 }}>
        {isLive ? '● LIVE NOW' : st.label}
      </div>
    </div>
  )
}
