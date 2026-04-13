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
    description: space.description ?? `${space.name} — Lisbon street market space. Independent makers, artisans and creative brands.`,
    alternates: { canonical: `/spaces/${slug}` },
  }
}

const GEM_ICONS: Record<string, string> = {
  coffee: '☕', food: '🍽', drinks: '🍷', studio: '◆', shop: '◈'
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  live:           { label: '● LIVE NOW',   color: '#1a5c30' },
  community_live: { label: '● LIVE NOW',   color: '#1a5c30' },
  scheduled:      { label: 'SCHEDULED',    color: 'rgba(24,22,20,.5)' },
  cancelled:      { label: 'CANCELLED',    color: '#c8291a' },
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  }).toUpperCase()
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

export default async function SpacePage({ params }: Props) {
  const { slug } = await params
  const [space, user] = await Promise.all([getSpaceBySlug(slug), getCurrentUser()])
  if (!space) notFound()

  const today = new Date().toISOString().split('T')[0]
  const upcomingMarkets = space.markets.filter(m =>
    m.event_date >= today && m.status !== 'cancelled'
  )
  const pastMarkets = space.markets.filter(m =>
    m.event_date < today
  ).reverse()
  const liveMarkets = space.markets.filter(m =>
    ['live', 'community_live'].includes(m.status)
  )
  const liveMakers = space.makers.filter(m => m.is_live)

  const googleMapsUrl = space.lat && space.lng
    ? `https://www.google.com/maps/search/?api=1&query=${space.lat},${space.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(space.name + ', Lisbon')}`

  return (
    <>
      <SiteHeader user={user} liveCount={liveMarkets.length} />
      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

        {/* ── Dark header ── */}
        <div style={{ background: '#181614', padding: '20px 16px 18px', borderBottom: '3px solid #181614' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '10px' }}>
            MARKET SPACE · WEAREMAKERS.PT
            {liveMarkets.length > 0 && (
              <span style={{ marginLeft: '12px', background: '#1a5c30', color: '#fff', padding: '2px 8px', fontSize: '9px' }}>
                ● LIVE NOW
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(40px,12vw,80px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: '#f0ece0', marginBottom: '10px' }}>
            {space.name}
          </h1>

          {/* Address + parish */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
            {space.address && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', color: 'rgba(240,236,224,.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {space.address}
              </div>
            )}
            {space.parish && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(240,236,224,.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {space.parish}{space.city ? ` · ${space.city}` : ''}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(240,236,224,.1)', paddingTop: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'MAKERS', value: space.makers.length, sub: 'LAST 90 DAYS' },
              { label: 'UPCOMING', value: upcomingMarkets.length, sub: 'MARKETS' },
              { label: 'GEMS', value: space.gems.length, sub: 'NEARBY' },
              { label: liveMakers.length > 0 ? `${liveMakers.length} LIVE` : 'OFFLINE', value: '', sub: liveMakers.length > 0 ? 'RIGHT NOW' : 'TODAY' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: '24px', marginRight: '24px', borderRight: i < 3 ? '1px solid rgba(240,236,224,.1)' : 'none' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: '28px', color: i === 3 && liveMakers.length > 0 ? '#c8291a' : '#f0ece0', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', color: 'rgba(240,236,224,.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Description ── */}
        {space.description && (
          <div style={{ padding: '20px 16px', borderBottom: '3px solid #181614' }}>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '17px', color: '#181614', lineHeight: 1.75, marginBottom: 0 }}>
              {space.description}
            </p>
          </div>
        )}

        {/* ── Live now at this space ── */}
        {liveMakers.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', background: '#1a5c30', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#fff', display: 'inline-block' }} />
              ● LIVE HERE RIGHT NOW — {liveMakers.length} BRAND{liveMakers.length !== 1 ? 'S' : ''}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 0 }}>
              {liveMakers.map((maker, i) => (
                <MakerCard key={maker.id} maker={maker} i={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Upcoming markets ── */}
        {upcomingMarkets.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              UPCOMING MARKETS
            </div>
            {upcomingMarkets.map((market, i) => {
              const st = STATUS_LABEL[market.status] ?? { label: market.status.toUpperCase(), color: 'rgba(24,22,20,.4)' }
              return (
                <div key={market.id} style={{ padding: '12px 14px', borderBottom: '2px solid rgba(24,22,20,.1)', background: i % 2 === 0 ? '#f0ece0' : '#e6e0d0', display: 'flex', gap: '14px', alignItems: 'center' }}>
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
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: 'rgba(24,22,20,.4)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {formatTime(market.starts_at)}–{formatTime(market.ends_at)}
                      {market.curator_name && ` · ${market.curator_name.toUpperCase()}`}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: st.color, flexShrink: 0 }}>
                    {st.label}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Makers at this space (last 90 days) ── */}
        {space.makers.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              MAKERS AT THIS SPACE · {space.makers.length} BRANDS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 0 }}>
              {space.makers.map((maker, i) => (
                <MakerCard key={maker.id} maker={maker} i={i} />
              ))}
            </div>
          </div>
        )}

        {/* ── Hidden Gems nearby ── */}
        {space.gems.length > 0 && (
          <div>
            <div style={{ padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              HIDDEN GEMS NEARBY
            </div>
            {space.gems.map((gem) => (
              <div key={gem.id} style={{ borderBottom: '2px solid rgba(24,22,20,.1)', display: 'flex', gap: 0, minHeight: '60px' }}>
                <div style={{ width: '52px', flexShrink: 0, background: '#181614', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', borderRight: '2px solid #181614' }}>
                  {GEM_ICONS[gem.category] ?? '◈'}
                </div>
                <div style={{ padding: '10px 12px', flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', marginBottom: '2px' }}>
                    {gem.name}
                  </div>
                  {gem.description && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(24,22,20,.5)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      {gem.description}
                    </div>
                  )}
                  {gem.address && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: 'rgba(24,22,20,.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                      {gem.address}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Map + directions ── */}
        <div style={{ padding: '16px', borderTop: '3px solid #181614', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#181614', color: '#f0ece0', border: '3px solid #181614', padding: '12px 20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            📍 DIRECTIONS →
          </a>
          {space.address && (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(24,22,20,.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {space.address}
            </div>
          )}
        </div>

        {/* ── Past markets (collapsed) ── */}
        {pastMarkets.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '2px solid rgba(24,22,20,.08)' }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: 'rgba(24,22,20,.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
              RECENT HISTORY · {pastMarkets.length} PAST MARKETS
            </div>
            {pastMarkets.slice(0, 4).map((market) => (
              <div key={market.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed rgba(24,22,20,.1)' }}>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: 'rgba(24,22,20,.3)', letterSpacing: '0.08em', flexShrink: 0 }}>
                  {formatDate(market.event_date)}
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: 'rgba(24,22,20,.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {market.title}
                </div>
              </div>
            ))}
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

function MakerCard({ maker, i }: { maker: any; i: number }) {
  const href = `/brands/${maker.slug ?? maker.id}`
  const cardImage = maker.featured_photo_url ?? maker.avatar_url ?? null
  const category = maker.bio_i18n?._category?.split(',')[0]?.trim() ?? null

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block', borderRight: '2px solid #181614', borderBottom: '2px solid #181614', background: maker.is_live ? 'rgba(26,92,48,.04)' : '#f0ece0', position: 'relative' as const, overflow: 'hidden' }}>
      {maker.is_live && (
        <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, background: '#1a5c30', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', padding: '3px 8px', zIndex: 2, textAlign: 'center' }}>
          ● LIVE NOW
        </div>
      )}
      <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#e6e0d0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
        {cardImage
          ? <img src={cardImage} alt={maker.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '32px', color: 'rgba(24,22,20,.15)', letterSpacing: '-0.02em' }}>{maker.display_name.slice(0, 2).toUpperCase()}</span>
        }
        {maker.is_verified && (
          <div style={{ position: 'absolute' as const, top: maker.is_live ? '22px' : '6px', right: '6px', background: '#181614', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f0ece0', padding: '2px 5px' }}>
            ✦ PRO
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px 10px', borderTop: '2px solid #181614' }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '17px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1, marginBottom: '3px' }}>
          {maker.display_name}
        </div>
        {category && (
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)' }}>
            {category}
          </div>
        )}
      </div>
    </Link>
  )
}
