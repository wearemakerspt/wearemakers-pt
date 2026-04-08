import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getMarketBySlug } from '@/lib/queries/markets'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const market = await getMarketBySlug(id)
  if (!market) return { title: 'Market Not Found' }
  return {
    title: `${market.title} — WEAREMAKERS.PT`,
    description: market.description ?? `${market.title} at ${market.space.name}, Lisbon. ${market.checkin_count} makers checked in.`,
    alternates: { canonical: `/markets/${id}` },
  }
}

const GEM_ICONS: Record<string, string> = {
  coffee: '☕', food: '🍽', drinks: '🍷', studio: '◆', shop: '◈'
}

export default async function MarketDetailPage({ params }: Props) {
  const { id } = await params
  const [market, user] = await Promise.all([getMarketBySlug(id), getCurrentUser()])
  if (!market) notFound()

  const isLive = market.status === 'live' || market.status === 'community_live'

  return (
    <>
      <SiteHeader user={user} liveCount={isLive ? market.checkin_count : 0} />
      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

        {/* Dark header */}
        <div style={{ background: '#181614', padding: '16px 16px', borderBottom: '3px solid #181614' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {market.space.name.toUpperCase()} · {(market.space.parish ?? '').toUpperCase()}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(36px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: '#f0ece0', marginBottom: '8px' }}>
            {market.title}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: '15px', color: 'rgba(240,236,224,.7)' }}>
            Today {market.starts_at.slice(0,5)}–{market.ends_at.slice(0,5)}
          </div>
          {market.space.address && (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(240,236,224,.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '4px' }}>
              {market.space.address}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', borderBottom: '3px solid #181614', background: '#f0ece0' }}>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((market.space.address ?? market.space.name) + ', Lisbon')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '12px 8px', borderRight: '3px solid #181614', background: isLive ? '#c8291a' : '#f0ece0', color: isLive ? '#fff' : '#181614', textDecoration: 'none', textAlign: 'center', display: 'block' }}
          >
            DIRECTIONS →
          </a>
          {user && (
            <Link
              href="/auth/login"
              style={{ flex: 1, fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '12px 8px', background: '#f0ece0', color: '#181614', textDecoration: 'none', textAlign: 'center', display: 'block' }}
            >
              + ADD TO PLAN
            </Link>
          )}
        </div>

        {/* Makers checked in */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '3px solid #181614' }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
              {isLive ? 'LIVE NOW' : 'MAKERS'}
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: '#c8291a', fontWeight: 700, letterSpacing: '0.1em' }}>
              {market.makers.length} {isLive ? 'CHECKED IN' : 'REGISTERED'}
            </div>
          </div>

          {market.makers.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', borderBottom: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
                NO MAKERS CHECKED IN YET<br />Check back when the market opens.
              </div>
            </div>
          ) : (
            market.makers.map(mk => (
              <Link
                key={mk.maker_id}
                href={`/brands/${mk.maker_slug ?? mk.maker_id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px', borderBottom: '2px solid #181614', background: '#f0ece0', transition: 'background 0.06s' }}
                className="hover:bg-parchment-2"
              >
                {/* Avatar */}
                <div style={{ width: '44px', height: '44px', flexShrink: 0, background: '#181614', border: '3px solid #181614', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '16px', color: '#c8291a', overflow: 'hidden', position: 'relative' }}>
                  {mk.avatar_url
                    ? <img src={mk.avatar_url} alt={mk.maker_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : mk.maker_name.slice(0, 2).toUpperCase()
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1 }}>
                      {mk.maker_name}
                    </div>
                    {mk.is_verified && <span className="badge-pro">✦ PRO</span>}
                  </div>
                  {mk.stall_label && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(24,22,20,.38)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Stall {mk.stall_label}
                    </div>
                  )}
                  {mk.digital_offer && (
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: 'rgba(24,22,20,.55)', marginTop: '3px', fontStyle: 'italic' }}>
                      ✦ {mk.digital_offer}
                    </div>
                  )}
                </div>
                {mk.instagram_handle && (
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: '#c8291a', letterSpacing: '0.06em', flexShrink: 0 }}>
                    {mk.instagram_handle}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Hidden Gems */}
        {market.gems.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '3px solid #181614', borderTop: '3px solid #181614' }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#181614', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '3px', height: '12px', background: '#c8291a', display: 'inline-block' }} />
                HIDDEN GEMS
              </div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: '#c8291a', fontWeight: 700 }}>
                {market.gems.length} NEARBY
              </div>
            </div>
            {market.gems.map(g => (
              <div key={g.gem_id} style={{ borderBottom: '2px solid #181614', display: 'flex', gap: 0, background: '#f0ece0', minHeight: '72px' }}>
                <div style={{ width: '56px', flexShrink: 0, background: '#181614', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', borderRight: '2px solid #181614', minHeight: '72px' }}>
                  {GEM_ICONS[g.category] ?? '◈'}
                </div>
                <div style={{ padding: '10px 12px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614' }}>
                      {g.gem_name}
                    </div>
                    <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, border: '2px solid #181614', padding: '1px 6px', color: '#181614' }}>
                      {g.distance_metres}m
                    </span>
                  </div>
                  {g.description && (
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '12px', color: 'rgba(24,22,20,.5)', lineHeight: 1.4, fontStyle: 'italic' }}>
                      {g.description}
                    </div>
                  )}
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', color: 'rgba(24,22,20,.32)', marginTop: '3px', letterSpacing: '0.06em' }}>
                    rec by {g.vetted_by_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back */}
        <div style={{ padding: '16px', borderTop: '3px solid #181614' }}>
          <Link href="/markets" style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← ALL MARKETS
          </Link>
        </div>
      </main>
    </>
  )
}
