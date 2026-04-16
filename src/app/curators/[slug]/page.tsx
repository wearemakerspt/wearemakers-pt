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

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  }).toUpperCase()
}

function formatDay(d: string) {
  return new Date(d + 'T12:00:00').getDate()
}

function formatWeekday(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
}

function formatMonth(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
}

export default async function CuratorPage({ params }: Props) {
  const { slug } = await params
  const [curator, user] = await Promise.all([getCuratorBySlug(slug), getCurrentUser()])
  if (!curator) notFound()

  const today = new Date().toISOString().split('T')[0]
  const liveMarkets = curator.markets.filter(m => ['live', 'community_live'].includes(m.status))
  const upcomingMarkets = curator.markets.filter(m => m.event_date >= today && !['live', 'community_live'].includes(m.status))
  const pastMarkets = curator.markets.filter(m => m.event_date < today).reverse()
  const liveFeatured = curator.featured_makers.filter(m => m.is_live)

  return (
    <>
      <SiteHeader user={user} liveCount={liveMarkets.length} />
      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* ── Dark header ── */}
        <div style={{ background: 'var(--INK)', padding: '20px 16px 18px', borderBottom: '3px solid var(--INK)', borderLeft: '4px solid var(--RED)' }}>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', fontWeight: 700, color: 'var(--RED)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            MARKET CURATOR · WEAREMAKERS.PT
            {liveMarkets.length > 0 && (
              <span style={{ background: 'var(--GRN)', color: '#fff', padding: '2px 8px', fontSize: '9px', letterSpacing: '0.1em' }}>
                ● LIVE NOW
              </span>
            )}
          </div>

          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', flexShrink: 0, border: '3px solid rgba(240,236,224,.15)', overflow: 'hidden', background: 'rgba(240,236,224,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {curator.avatar_url
                ? <img src={curator.avatar_url} alt={curator.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', color: 'var(--RED)', textTransform: 'uppercase' }}>{curator.display_name.slice(0, 2)}</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(36px,10vw,68px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: 'var(--P)', marginBottom: '8px' }}>
                {curator.display_name}
              </h1>
              {curator.organisation_name && (
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(240,236,224,.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {curator.organisation_url
                    ? <a href={curator.organisation_url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(240,236,224,.45)', textDecoration: 'none' }}>{curator.organisation_name} ↗</a>
                    : curator.organisation_name
                  }
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                {curator.instagram_handle && (
                  <a href={`https://instagram.com/${curator.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--RED)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    {curator.instagram_handle} <span style={{ fontFamily: 'var(--TAG)', fontSize: '10px', opacity: 0.6 }}>↗</span>
                  </a>
                )}
                {curator.shop_url && (
                  <a href={curator.shop_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--TAG)', fontSize: '10px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                    WEBSITE ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(240,236,224,.1)', paddingTop: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'UPCOMING', value: upcomingMarkets.length, sub: 'MARKETS' },
              { label: 'FEATURED', value: curator.featured_makers.length, sub: 'BRANDS' },
              { label: liveFeatured.length > 0 ? `${liveFeatured.length} LIVE` : liveMarkets.length > 0 ? 'OPEN' : 'OFFLINE', value: '', sub: liveMarkets.length > 0 ? 'RIGHT NOW' : 'TODAY' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: '24px', marginRight: '24px', borderRight: i < 2 ? '1px solid rgba(240,236,224,.1)' : 'none' }}>
                <div style={{ fontFamily: 'var(--MONO)', fontWeight: 800, fontSize: '28px', color: i === 2 && liveMarkets.length > 0 ? 'var(--RED)' : 'var(--P)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(240,236,224,.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bio ── */}
        {curator.bio && (
          <div style={{ padding: '20px 16px', borderBottom: '3px solid var(--INK)', background: 'var(--P)' }}>
            <p style={{ fontFamily: 'var(--MONO)', fontSize: '17px', color: 'var(--INK)', lineHeight: 1.75, marginBottom: 0 }}>
              {curator.bio}
            </p>
          </div>
        )}

        {/* ── Live markets ── */}
        {liveMarkets.length > 0 && (
          <section>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid var(--INK)', background: 'var(--GRN)', fontFamily: 'var(--TAG)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#fff', display: 'inline-block' }} />
              ● OPEN RIGHT NOW
            </div>
            {liveMarkets.map((market, i) => <MarketRow key={market.id} market={market} i={i} isLive />)}
          </section>
        )}

        {/* ── Upcoming markets ── */}
        {upcomingMarkets.length > 0 && (
          <section>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid var(--INK)', borderTop: '3px solid var(--INK)', fontFamily: 'var(--TAG)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--INK)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: 'var(--RED)', display: 'inline-block' }} />
              UPCOMING MARKETS
            </div>
            {upcomingMarkets.map((market, i) => <MarketRow key={market.id} market={market} i={i} />)}
          </section>
        )}

        {/* ── Featured brands ── */}
        {curator.featured_makers.length > 0 && (
          <section>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid var(--INK)', borderTop: '3px solid var(--INK)', fontFamily: 'var(--TAG)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--INK)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: 'var(--RED)', display: 'inline-block' }} />
              SPOTLIGHT — FEATURED BRANDS · {curator.featured_makers.length}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 0 }}>
              {curator.featured_makers.map((maker) => {
                const href = `/brands/${maker.slug ?? maker.id}`
                const cardImage = maker.featured_photo_url ?? maker.avatar_url ?? null
                const category = maker.bio_i18n?._category?.split(',')[0]?.trim() ?? null
                return (
                  <Link key={maker.id} href={href} style={{ textDecoration: 'none', display: 'block', borderRight: '2px solid var(--INK)', borderBottom: '2px solid var(--INK)', background: maker.is_live ? 'rgba(26,92,48,.04)' : 'var(--P)', position: 'relative', overflow: 'hidden' }}>
                    {maker.is_live && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--GRN)', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', padding: '3px 8px', zIndex: 2, textAlign: 'center' }}>
                        ● LIVE NOW
                      </div>
                    )}
                    <div style={{ aspectRatio: '1', overflow: 'hidden', background: 'var(--P2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {cardImage
                        ? <img src={cardImage} alt={maker.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '32px', color: 'rgba(24,22,20,.12)' }}>{maker.display_name.slice(0, 2).toUpperCase()}</span>
                      }
                      {maker.is_verified && (
                        <div style={{ position: 'absolute', top: maker.is_live ? '22px' : '6px', right: '6px', background: 'var(--INK)', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--P)', padding: '2px 5px' }}>
                          ★ PRO
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '8px 10px 10px', borderTop: '2px solid var(--INK)' }}>
                      <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '17px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>{maker.display_name}</div>
                      {category && <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)' }}>{category}</div>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Empty state ── */}
        {curator.markets.length === 0 && curator.featured_makers.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
              No upcoming markets scheduled.
            </div>
          </div>
        )}

        {/* ── Past markets ── */}
        {pastMarkets.length > 0 && (
          <section>
            <div style={{ padding: '10px 14px', borderTop: '3px solid var(--INK)', borderBottom: '2px solid rgba(24,22,20,.08)', fontFamily: 'var(--TAG)', fontSize: '10px', color: 'rgba(24,22,20,.3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              PAST MARKETS · {pastMarkets.length}
            </div>
            {pastMarkets.slice(0, 6).map((market, i) => (
              <div key={market.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid rgba(24,22,20,.06)', background: 'var(--P)' }}>
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', color: 'rgba(24,22,20,.3)', letterSpacing: '0.08em', flexShrink: 0 }}>
                  {formatDate(market.event_date)}
                </div>
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', color: 'rgba(24,22,20,.4)', textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>
                  {market.title}{market.space_name ? ` · ${market.space_name}` : ''}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ── Back ── */}
        <div style={{ padding: '16px', borderTop: '3px solid var(--INK)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/markets" style={{ fontFamily: 'var(--TAG)', fontSize: '11px', fontWeight: 700, color: 'var(--RED)', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← ALL MARKETS
          </Link>
        </div>

      </main>
    </>
  )
}

function MarketRow({ market, i, isLive = false }: { market: any; i: number; isLive?: boolean }) {
  return (
    <Link href={`/markets/${market.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'stretch', borderBottom: '2px solid var(--INK)', background: i % 2 === 0 ? 'var(--P)' : 'var(--P2)', minHeight: '72px' }}>
      {/* Date */}
      <div style={{ width: '72px', flexShrink: 0, background: isLive ? 'var(--GRN)' : 'var(--INK)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', gap: '1px' }}>
        <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {new Date(market.event_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()}
        </div>
        <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', color: isLive ? '#fff' : 'var(--RED)', lineHeight: 1 }}>
          {new Date(market.event_date + 'T12:00:00').getDate()}
        </div>
        <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {new Date(market.event_date + 'T12:00:00').toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(18px,4vw,24px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {market.title}
        </div>
        <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.45)', lineHeight: 1.4 }}>
          {market.starts_at.slice(0,5)}–{market.ends_at.slice(0,5)}
          {market.space_name ? ` · ${market.space_name}` : ''}
        </div>
        {market.space_address && (
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(24,22,20,.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
            {market.space_address}
          </div>
        )}
      </div>

      {/* Arrow */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', color: 'rgba(24,22,20,.2)', fontFamily: 'var(--TAG)', fontSize: '14px' }}>
        →
      </div>
    </Link>
  )
}
