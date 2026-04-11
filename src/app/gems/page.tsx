import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllGems } from '@/lib/queries/markets'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hidden Gems — WEAREMAKERS.PT',
  description: 'Places recommended by Lisbon\'s independent makers. The best coffee, food, studios and shops near the street markets — curated by the people who know these streets.',
  alternates: { canonical: '/gems' },
}

const GEM_ICONS: Record<string, string> = {
  coffee: '☕', food: '🍽', drinks: '🍷', studio: '◆', shop: '◈'
}

const CATEGORIES = [
  { value: 'all', label: 'ALL' },
  { value: 'coffee', label: '☕ COFFEE' },
  { value: 'food', label: '🍽 FOOD' },
  { value: 'drinks', label: '🍷 DRINKS' },
  { value: 'studio', label: '◆ STUDIOS' },
  { value: 'shop', label: '◈ SHOPS' },
]

export default async function GemsPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams
  const activeCategory = cat ?? 'all'

  const [gems, user] = await Promise.all([
    getAllGems(),
    getCurrentUser(),
  ])

  // Filter by category
  const filtered = activeCategory === 'all'
    ? gems
    : gems.filter(g => g.category === activeCategory)

  // Group by parish → space
  const parishMap = new Map<string, Map<string, typeof filtered>>()

  for (const gem of filtered) {
    const parish = gem.space_parish ?? gem.space_name ?? 'Lisbon'
    const space = gem.space_name

    if (!parishMap.has(parish)) parishMap.set(parish, new Map())
    const spaceMap = parishMap.get(parish)!
    if (!spaceMap.has(space)) spaceMap.set(space, [])
    spaceMap.get(space)!.push(gem)
  }

  const T = { fontFamily: 'var(--TAG)', letterSpacing: '0.18em', textTransform: 'uppercase' as const }

  return (
    <>
      <SiteHeader user={user} />
      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* Header */}
        <div style={{ background: 'var(--INK)', padding: '20px 16px', borderBottom: '3px solid var(--INK)' }}>
          <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700, marginBottom: '8px' }}>
            RECOMMENDED BY MAKERS · LISBON
          </div>
          <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(36px,8vw,60px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: 'var(--P)', marginBottom: '10px' }}>
            HIDDEN GEMS
          </h1>
          <p style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(240,236,224,.45)', lineHeight: 1.6, maxWidth: '520px', margin: 0 }}>
            The best spots near each market — recommended by the independent makers who set up there every week.
          </p>
        </div>

        {/* Category filter */}
        <div style={{ borderBottom: '3px solid var(--INK)', background: 'var(--P2)', padding: '0', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <Link
              key={c.value}
              href={c.value === 'all' ? '/gems' : `/gems?cat=${c.value}`}
              style={{
                ...T, fontSize: '10px', fontWeight: 700,
                padding: '12px 16px',
                background: activeCategory === c.value ? 'var(--INK)' : 'transparent',
                color: activeCategory === c.value ? 'var(--P)' : 'rgba(24,22,20,.5)',
                textDecoration: 'none',
                borderRight: '2px solid rgba(24,22,20,.1)',
                flexShrink: 0,
                whiteSpace: 'nowrap' as const,
              }}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Count */}
        <div style={{ padding: '10px 16px', borderBottom: '2px solid rgba(24,22,20,.08)', background: 'var(--P)' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)' }}>
            {filtered.length} GEM{filtered.length !== 1 ? 'S' : ''} · {parishMap.size} NEIGHBOURHOOD{parishMap.size !== 1 ? 'S' : ''}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(24,22,20,.12)', marginBottom: '8px' }}>
              NO GEMS YET
            </div>
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
              Makers haven't submitted any {activeCategory !== 'all' ? activeCategory : ''} recommendations yet.<br />
              <Link href="/gems" style={{ color: 'var(--RED)', textDecoration: 'none' }}>See all gems →</Link>
            </div>
          </div>
        )}

        {/* Gems grouped by parish → space */}
        {Array.from(parishMap.entries()).map(([parish, spaceMap]) => (
          <div key={parish}>

            {/* Parish header */}
            <div style={{ background: 'var(--INK2)', padding: '12px 16px', borderBottom: '2px solid rgba(240,236,224,.06)', borderTop: '3px solid var(--INK)' }}>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.25)', marginBottom: '2px' }}>NEIGHBOURHOOD</div>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, color: 'var(--P)' }}>
                {parish}
              </div>
            </div>

            {/* Spaces within parish */}
            {Array.from(spaceMap.entries()).map(([spaceName, spaceGems]) => (
              <div key={spaceName}>

                {/* Space sub-header */}
                <div style={{ padding: '8px 16px', borderBottom: '2px solid rgba(24,22,20,.1)', background: 'var(--P2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'rgba(24,22,20,.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '3px', height: '10px', background: 'var(--RED)', display: 'inline-block' }} />
                    NEAR {spaceName.toUpperCase()}
                  </div>
                  <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)' }}>
                    {spaceGems.length} PLACE{spaceGems.length !== 1 ? 'S' : ''}
                  </div>
                </div>

                {/* Gem cards */}
                {spaceGems.map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', borderBottom: '2px solid var(--INK)', background: i % 2 === 0 ? 'var(--P)' : 'var(--P2)', minHeight: '72px' }}>

                    {/* Category icon */}
                    <div style={{ width: '56px', flexShrink: 0, background: 'var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', borderRight: '2px solid var(--INK)' }}>
                      {GEM_ICONS[g.category] ?? '◈'}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1 }}>
                          {g.name}
                        </div>
                        <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', flexShrink: 0, marginTop: '3px' }}>
                          {g.category.toUpperCase()}
                        </div>
                      </div>

                      {g.description && (
                        <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.55)', lineHeight: 1.5, fontStyle: 'italic', marginBottom: '6px' }}>
                          {g.description}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Maker recommendation */}
                        {g.vetted_by_name && (
                          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: 'var(--RED)' }}>✦</span>
                            {g.vetted_by_slug ? (
                              <Link href={`/brands/${g.vetted_by_slug}`} style={{ color: 'rgba(24,22,20,.5)', textDecoration: 'none' }}>
                                REC BY {g.vetted_by_name.toUpperCase()}
                              </Link>
                            ) : (
                              <span>REC BY {g.vetted_by_name.toUpperCase()}</span>
                            )}
                          </div>
                        )}

                        {/* Address */}
                        {g.address && (
                          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.3)' }}>
                            {g.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}

        {/* Footer CTA */}
        {filtered.length > 0 && (
          <div style={{ padding: '24px 16px', borderTop: '3px solid var(--INK)', background: 'var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ ...T, fontSize: '10px', color: 'rgba(240,236,224,.35)' }}>
              Are you a maker? Share a place you love.
            </div>
            <Link href="/welcome/maker" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--P)', background: 'var(--RED)', border: '2px solid var(--RED)', padding: '10px 16px', textDecoration: 'none' }}>
              JOIN & SUBMIT A GEM →
            </Link>
          </div>
        )}

        {/* Back */}
        <div style={{ padding: '16px', borderTop: '3px solid var(--INK)' }}>
          <Link href="/markets" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--RED)', textDecoration: 'none' }}>
            ← BACK TO MARKETS
          </Link>
        </div>

      </main>
    </>
  )
}
