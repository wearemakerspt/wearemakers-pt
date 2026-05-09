import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getMarketBySlug } from '@/lib/queries/markets'
import { getCurrentUser } from '@/lib/queries/auth'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/components/ui/SiteHeader'
import RealtimeRefresh from '@/components/ui/RealtimeRefresh'
import SaveMarketButton from '@/components/ui/SaveMarketButton'
import MapEmbed from '@/components/ui/MapEmbed'
import MarketHeroCarousel from '@/components/markets/MarketHeroCarousel'

export const dynamic = 'force-dynamic'
interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const market = await getMarketBySlug(id)
  if (!market) return { title: 'Market Not Found' }

  const isLive = market.status === 'live' || market.status === 'community_live'
  const date = new Date(market.event_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
  const ogUrl = `https://wearemakers.pt/api/og?type=market&title=${encodeURIComponent(market.title)}&sub=${encodeURIComponent(market.space.name)}&date=${encodeURIComponent(date)}&status=${encodeURIComponent(isLive ? 'LIVE NOW' : 'SCHEDULED')}`

  return {
    title: `${market.title} — WEAREMAKERS.PT`,
    description: market.description ?? `${market.title} at ${market.space.name}, Lisbon.`,
    alternates: { canonical: `/markets/${id}` },
    openGraph: {
      title: market.title,
      description: market.description ?? `${market.title} at ${market.space.name}, Lisbon.`,
      url: `https://wearemakers.pt/markets/${id}`,
      siteName: 'WEAREMAKERS.PT',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: market.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: market.title,
      description: market.description ?? `${market.title} at ${market.space.name}, Lisbon.`,
      images: [ogUrl],
    },
  }
}

function MarketJsonLd({ market }: { market: any }) {
  const startDate = `${market.event_date}T${market.starts_at}`
  const endDate = `${market.event_date_end ?? market.event_date}T${market.ends_at}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: market.title,
    description: market.description ?? `${market.title} at ${market.space.name}, Lisbon.`,
    startDate,
    endDate,
    eventStatus: market.status === 'cancelled'
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: `https://wearemakers.pt/markets/${market.id}`,
    location: {
      '@type': 'Place',
      name: market.space.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: market.space.address ?? undefined,
        addressLocality: 'Lisbon',
        addressCountry: 'PT',
      },
      ...(market.space.lat && market.space.lng ? {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: market.space.lat,
          longitude: market.space.lng,
        }
      } : {}),
    },
    organizer: market.curator ? {
      '@type': 'Organization',
      name: market.curator.display_name,
      url: `https://wearemakers.pt/curators/${market.curator.slug}`,
    } : {
      '@type': 'Organization',
      name: 'WEAREMAKERS.PT',
      url: 'https://wearemakers.pt',
    },
    image: 'https://wearemakers.pt/og-default.png',
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

const GEM_ICONS: Record<string, string> = { coffee: '☕', food: '🍽', drinks: '🍷', studio: '◆', shop: '◈' }
const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560', GREEN = '#1a5c30'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

export default async function MarketDetailPage({ params }: Props) {
  const { id } = await params
  const [market, user] = await Promise.all([getMarketBySlug(id), getCurrentUser()])
  if (!market) notFound()

  const isLive = market.status === 'live' || market.status === 'community_live'

  const spaceSlug = market.space.name
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  let initialSaved = false
  if (user) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.from('saved_markets').select('id').eq('visitor_id', user.id).eq('market_id', market.id).maybeSingle()
      initialSaved = !!data
    } catch { }
  }

  return (
    <>
      <MarketJsonLd market={market} />
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={isLive ? market.checkin_count : 0} />

      <style>{`
        .mkt-mobile-hero { display: none; }
        .mkt-mobile-actions { display: none; }
        .mkt-mobile-curator { display: none; }
        @media (max-width: 860px) {
          .mkt-mobile-hero {
            display: block;
            position: relative;
            width: 100%;
            min-height: 80vw;
            background: #1A1A1A;
            overflow: hidden;
            border-bottom: 2px solid #0C0C0C;
          }
          .mkt-mobile-hero-dark { min-height: 56vw; }
          .mkt-mobile-hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(12,12,12,0.1) 0%, rgba(12,12,12,0.75) 100%);
          }
          .mkt-mobile-hero-content {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 24px 20px;
          }
          .detail-hero { grid-template-columns: 1fr !important; }
          .detail-hero-l { border-right: none !important; border-bottom: 2px solid #0C0C0C !important; padding: 28px 20px !important; justify-content: flex-start !important; gap: 20px !important; }
          .detail-hero-r { display: none !important; }
          .detail-meta-row { gap: 16px !important; }
          .detail-makers { grid-template-columns: repeat(2,1fr) !important; }
          .mkt-mobile-actions { display: block; border-bottom: 2px solid #0C0C0C; }
          .mkt-mobile-curator { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 2px solid #0C0C0C; background: #1A1A1A; text-decoration: none; }
          .mkt-maker-card { padding: 16px !important; }
        }
        @media (max-width: 540px) {
          .detail-makers { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        {/* Breadcrumb — dark, matches brand page */}
        <div style={{ height: '44px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: B, background: INK }}>
          <Link href="/markets" style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.6)', textDecoration: 'none' }}>← ALL MARKETS</Link>
        </div>

        {/* Mobile hero carousel — makers' avatars auto-scrolling */}
        <MarketHeroCarousel
          makers={market.makers}
          marketTitle={market.title}
          eventDate={market.event_date}
          startsAt={market.starts_at}
          endsAt={market.ends_at}
          isLive={isLive}
          checkinCount={market.checkin_count}
        />

        {/* Mobile action strip — DIRECTIONS + SAVE */}
        <div className="mkt-mobile-actions">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((market.space.address ?? market.space.name) + ', Lisbon')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 0', background: RED, color: WHITE, fontFamily: FM, fontSize: '10px', letterSpacing: '0.16em', textDecoration: 'none', textTransform: 'uppercase' }}
          >
            DIRECTIONS →
          </a>
          <div style={{ padding: '16px 20px' }}>
            <SaveMarketButton marketId={market.id} marketTitle={market.title} userId={user?.id ?? null} initialSaved={initialSaved} dark={false} />
          </div>
        </div>

        {/* Two-column detail hero — desktop only */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', borderBottom: B, minHeight: '280px' }} className="detail-hero">
          {/* Left */}
          <div style={{ padding: '52px', borderRight: B, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="detail-hero-l">
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(52px,6.5vw,88px)', lineHeight: 0.88, letterSpacing: '-0.02em', textTransform: 'uppercase', color: INK }}>
                  {market.title}
                </h1>
                {isLive ? (
                  <span style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.14em', padding: '6px 12px', background: RED, color: WHITE, textTransform: 'uppercase', marginBottom: '4px' }}>● LIVE NOW</span>
                ) : (
                  <span style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.14em', padding: '6px 12px', border: `1px solid ${STONE}`, color: STONE, textTransform: 'uppercase', marginBottom: '4px' }}>{market.status.toUpperCase()}</span>
                )}
              </div>
            </div>
            {/* Meta row */}
            <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }} className="detail-meta-row">
              {[
                { label: 'DATE', value: new Date(market.event_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase() },
                { label: 'HOURS', value: `${market.starts_at.slice(0,5)}–${market.ends_at.slice(0,5)}` },
                { label: 'LOCATION', value: market.space.name },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: STONE, textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '15px', letterSpacing: '0.04em', textTransform: 'uppercase', color: INK }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar — dark */}
          <div style={{ background: INK, color: WHITE, padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }} className="detail-hero-r">
            {(market as any).curator && (
              <div>
                <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>CURATOR</div>
                <Link href={`/curators/${(market as any).curator.slug}`} style={{ fontFamily: FH, fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', color: WHITE, textDecoration: 'none' }}>
                  {(market as any).curator.display_name} ↗
                </Link>
              </div>
            )}
            <div>
              <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>SPACE</div>
              <Link href={`/spaces/${spaceSlug}`} style={{ fontFamily: FH, fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', color: WHITE, textDecoration: 'none' }}>
                {market.space.name} ↗
              </Link>
            </div>
            {market.space.address && (
              <div>
                <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>ADDRESS</div>
                <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2, color: WHITE }}>{market.space.address}</div>
              </div>
            )}
            <div>
              <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(244,241,236,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>CONFIRMED MAKERS</div>
              <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '16px', color: isLive ? RED : WHITE }}>{market.makers.length}</div>
            </div>
            <div style={{ width: '100%', height: '1px', background: 'rgba(244,241,236,0.1)' }} />
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((market.space.address ?? market.space.name) + ', Lisbon')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px 0', background: RED, color: WHITE, fontFamily: FM, fontSize: '10px', letterSpacing: '0.16em', textDecoration: 'none', textTransform: 'uppercase', transition: 'background .18s' }}>
              DIRECTIONS →
            </a>
            <SaveMarketButton marketId={market.id} marketTitle={market.title} userId={user?.id ?? null} initialSaved={initialSaved} dark={true} />
          </div>
        </div>

        {/* Mobile curator row — shown before map on mobile */}
        {(market as any).curator && (
          <Link
            href={`/curators/${(market as any).curator.slug}`}
            className="mkt-mobile-curator"
          >
            <div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(244,241,236,0.4)', marginBottom: '4px' }}>CURATED BY</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: '16px', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#F4F1EC' }}>{(market as any).curator.display_name}</div>
            </div>
            <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '14px', color: 'rgba(244,241,236,0.4)' }}>↗</span>
          </Link>
        )}

        {/* Map */}
        {market.space.lat && market.space.lng && (
          <div style={{ borderBottom: B }}>
            <MapEmbed lat={market.space.lat} lng={market.space.lng} label={market.space.name} address={market.space.address} height={260} />
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div style={{ background: GREEN, padding: '10px 16px', borderBottom: B, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: WHITE, display: 'inline-block' }} />
            <span style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: WHITE }}>
              OPEN NOW · {market.checkin_count} MAKERS LIVE
            </span>
          </div>
        )}

        {/* Makers grid */}
        <div>
          <div className="section-rule">
            <span className="section-rule-title">{isLive ? 'LIVE NOW' : 'MAKERS'}</span>
            <span className="section-rule-link">{market.makers.length} {isLive ? 'CHECKED IN' : 'REGISTERED'}</span>
          </div>
          {market.makers.length === 0 ? (
            <div style={{ padding: '48px 24px', borderBottom: B }}>
              <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: STONE, lineHeight: 2 }}>NO MAKERS REGISTERED YET<br />Check back closer to the market date.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: B }} className="detail-makers">
              {market.makers.map(mk => (
                <Link
                  key={mk.maker_id}
                  href={`/brands/${mk.maker_slug ?? mk.maker_id}`}
                  className="mkt-maker-card"
                  style={{ textDecoration: 'none', color: 'inherit', borderRight: Bsm, borderBottom: Bsm, padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', background: WHITE, transition: 'background .15s' }}
                >
                  <div style={{ width: '56px', height: '56px', border: B, background: PAPER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontWeight: 900, fontSize: '16px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    {mk.avatar_url
                      ? <img src={mk.avatar_url} alt={mk.maker_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : mk.maker_name.slice(0, 2).toUpperCase()
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '15px', letterSpacing: '0.04em', textTransform: 'uppercase', color: INK, lineHeight: 1.1 }}>{mk.maker_name}</div>
                    {mk.stall_label && <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.08em', color: STONE, textTransform: 'uppercase', marginTop: '4px' }}>Stall {mk.stall_label}</div>}
                    {mk.digital_offer && <div style={{ fontFamily: FB, fontSize: '12px', color: STONE, marginTop: '5px', fontStyle: 'italic', lineHeight: 1.4 }}>✦ {mk.digital_offer}</div>}
                    {mk.is_verified && <div style={{ fontFamily: FM, fontSize: '9px', color: INK, border: `1px solid ${INK}`, padding: '1px 6px', display: 'inline-block', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>✦ PRO</div>}
                  </div>
                  <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.1em', alignSelf: 'flex-end' }}>→</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Hidden Gems */}
        {market.gems.length > 0 && (
          <div>
            <div className="section-rule">
              <span className="section-rule-title">HIDDEN GEMS NEARBY</span>
              <Link href="/gems" className="section-rule-link">{market.gems.length} PLACES →</Link>
            </div>
            {market.gems.map(g => (
              <div key={g.gem_id} style={{ borderBottom: Bsm, display: 'flex', gap: 0, background: WHITE, minHeight: '72px' }}>
                <div style={{ width: '56px', flexShrink: 0, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', borderRight: B, minHeight: '72px' }}>{GEM_ICONS[g.category] ?? '◈'}</div>
                <div style={{ padding: '14px 20px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK }}>{g.gem_name}</div>
                    {g.distance_metres !== null && <span style={{ fontFamily: FM, fontSize: '10px', border: `1px solid rgba(12,12,12,0.2)`, padding: '2px 8px', color: STONE }}>{g.distance_metres}m</span>}
                  </div>
                  {g.description && <div style={{ fontFamily: FB, fontSize: '13px', color: STONE, lineHeight: 1.5, fontStyle: 'italic', marginBottom: '3px' }}>{g.description}</div>}
                  <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.06em' }}>rec by {g.vetted_by_name}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="wam-nav-spacer" />
      </main>
    </>
  )
}
