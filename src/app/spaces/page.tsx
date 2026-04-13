import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Market Spaces — WEAREMAKERS.PT',
  description: 'Permanent locations for Lisbon street markets. Find makers, upcoming markets and hidden gems at each space.',
  alternates: { canonical: '/spaces' },
}

export default async function SpacesPage() {
  const [user, supabase] = await Promise.all([getCurrentUser(), createClient()])
  const sb = await supabase

  const { data: spaces } = await sb
    .from('spaces')
    .select('id, name, slug, address, parish, city, description')
    .eq('is_active', true)
    .order('name')

  return (
    <>
      <SiteHeader user={user} />
      <main style={{ background: '#f0ece0', minHeight: '100dvh' }}>

        <div style={{ padding: '16px 16px 0', borderBottom: '3px solid #181614' }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>
            {spaces?.length ?? 0} PERMANENT LOCATIONS
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(36px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: '#181614', marginBottom: '16px' }}>
            MARKET SPACES
          </h1>
        </div>

        <div>
          {(spaces ?? []).map((space, i) => (
            <Link
              key={space.id}
              href={`/spaces/${space.slug}`}
              style={{ textDecoration: 'none', display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', borderBottom: '3px solid #181614', background: i % 2 === 0 ? '#f0ece0' : '#e6e0d0' }}
            >
              {/* Number */}
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '32px', color: 'rgba(24,22,20,.12)', letterSpacing: '-0.02em', lineHeight: 1, flexShrink: 0, width: '36px', textAlign: 'right' as const }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 'clamp(22px,5vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1, marginBottom: '4px' }}>
                  {space.name}
                </div>
                {space.parish && (
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c8291a', marginBottom: '4px' }}>
                    {space.parish}
                  </div>
                )}
                {space.address && (
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', color: 'rgba(24,22,20,.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {space.address}
                  </div>
                )}
                {space.description && (
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: 'rgba(24,22,20,.55)', lineHeight: 1.5, marginTop: '6px' }}>
                    {space.description.slice(0, 120)}{space.description.length > 120 ? '...' : ''}
                  </div>
                )}
              </div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', fontWeight: 700, color: '#c8291a', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0, alignSelf: 'center' }}>
                VIEW →
              </div>
            </Link>
          ))}
        </div>

        {(!spaces || spaces.length === 0) && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.3)' }}>
              No spaces listed yet.
            </div>
          </div>
        )}
      </main>
    </>
  )
}
