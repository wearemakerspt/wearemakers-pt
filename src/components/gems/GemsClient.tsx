'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import SaveGemButton from '@/components/ui/SaveGemButton'

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

interface Gem {
  id: string
  name: string
  category: string
  description: string | null
  address: string | null
  lat: number | null
  lng: number | null
  distance_metres: number | null
  space_id: string
  space_name: string
  space_parish: string | null
  vetted_by_name: string
  vetted_by_slug: string | null
}

interface Props {
  gems: Gem[]
  userId: string | null
}

export default function GemsClient({ gems, userId }: Props) {
  const [activeCategory, setActiveCategory] = useState('all')

  const T = { fontFamily: 'var(--TAG)', letterSpacing: '0.18em', textTransform: 'uppercase' as const }

  const filtered = useMemo(() =>
    activeCategory === 'all' ? gems : gems.filter(g => g.category === activeCategory),
    [gems, activeCategory]
  )

  const grouped = useMemo(() => {
    const parishMap = new Map<string, Map<string, Gem[]>>()
    for (const gem of filtered) {
      const parish = gem.space_parish ?? gem.space_name ?? 'Lisbon'
      const space = gem.space_name
      if (!parishMap.has(parish)) parishMap.set(parish, new Map())
      const spaceMap = parishMap.get(parish)!
      if (!spaceMap.has(space)) spaceMap.set(space, [])
      spaceMap.get(space)!.push(gem)
    }
    return parishMap
  }, [filtered])

  return (
    <div>
      {/* Category filter */}
      <div style={{ borderBottom: '3px solid var(--INK)', background: 'var(--P2)', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setActiveCategory(c.value)}
            style={{
              ...T, fontSize: '10px', fontWeight: 700,
              padding: '12px 16px',
              background: activeCategory === c.value ? 'var(--INK)' : 'transparent',
              color: activeCategory === c.value ? 'var(--P)' : 'rgba(24,22,20,.5)',
              border: 'none', borderRight: '2px solid rgba(24,22,20,.1)',
              cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' as const,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ padding: '10px 16px', borderBottom: '2px solid rgba(24,22,20,.08)' }}>
        <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)' }}>
          {filtered.length} GEM{filtered.length !== 1 ? 'S' : ''} · {grouped.size} NEIGHBOURHOOD{grouped.size !== 1 ? 'S' : ''}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(24,22,20,.12)', marginBottom: '8px' }}>
            NO GEMS YET
          </div>
          <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
            No {activeCategory !== 'all' ? activeCategory : ''} recommendations yet.{' '}
            <button onClick={() => setActiveCategory('all')} style={{ background: 'none', border: 'none', color: 'var(--RED)', cursor: 'pointer', ...T, fontSize: '10px' }}>
              SEE ALL →
            </button>
          </div>
        </div>
      )}

      {/* Gems grouped by parish → space */}
      {Array.from(grouped.entries()).map(([parish, spaceMap]) => (
        <div key={parish}>
          {/* Parish header */}
          <div style={{ background: 'var(--INK2)', padding: '12px 16px', borderBottom: '2px solid rgba(240,236,224,.06)', borderTop: '3px solid var(--INK)' }}>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.25)', marginBottom: '2px' }}>NEIGHBOURHOOD</div>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, color: 'var(--P)' }}>
              {parish}
            </div>
          </div>

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
              {spaceGems.map((g, i) => {
                const googleQuery = encodeURIComponent(`${g.name}${g.address ? ', ' + g.address : ''}, Lisbon`)
                const googleUrl = `https://www.google.com/search?q=${googleQuery}`
                const mapsUrl = g.lat && g.lng && g.lat !== 0 && g.lng !== 0
                  ? `https://www.google.com/maps?q=${g.lat},${g.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${googleQuery}`

                return (
                  <div key={g.id} style={{ borderBottom: '2px solid var(--INK)', background: i % 2 === 0 ? 'var(--P)' : 'var(--P2)' }}>
                    <div style={{ display: 'flex' }}>
                      {/* Icon */}
                      <div style={{ width: '56px', flexShrink: 0, background: 'var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', borderRight: '2px solid var(--INK)', alignSelf: 'stretch' }}>
                        {GEM_ICONS[g.category] ?? '◈'}
                      </div>

                      {/* Content */}
                      <div style={{ padding: '14px 14px 12px', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1 }}>
                            {g.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {g.distance_metres !== null && (
                              <span style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', border: '1px solid rgba(24,22,20,.2)', padding: '2px 7px' }}>
                                {g.distance_metres}m
                              </span>
                            )}
                            <SaveGemButton gemId={g.id} gemName={g.name} userId={userId} size="sm" />
                          </div>
                        </div>

                        {g.description && (
                          <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.6)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '8px' }}>
                            {g.description}
                          </div>
                        )}

                        {g.address && (
                          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>◎</span><span>{g.address}</span>
                          </div>
                        )}

                        {g.vetted_by_name && (
                          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: 'var(--RED)' }}>✦</span>
                            {g.vetted_by_slug ? (
                              <Link href={`/brands/${g.vetted_by_slug}`} style={{ color: 'rgba(24,22,20,.45)', textDecoration: 'none' }}>
                                REC BY {g.vetted_by_name.toUpperCase()}
                              </Link>
                            ) : (
                              <span>REC BY {g.vetted_by_name.toUpperCase()}</span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                            style={{ ...T, fontSize: '9px', fontWeight: 700, padding: '6px 12px', background: 'var(--INK)', color: 'var(--P)', textDecoration: 'none', display: 'inline-block' }}>
                            DIRECTIONS →
                          </a>
                          <a href={googleUrl} target="_blank" rel="noopener noreferrer"
                            style={{ ...T, fontSize: '9px', fontWeight: 700, padding: '6px 12px', background: 'transparent', color: 'rgba(24,22,20,.5)', border: '1px solid rgba(24,22,20,.2)', textDecoration: 'none', display: 'inline-block' }}>
                            SEARCH ON GOOGLE ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Footer CTA after last parish */}
          {Array.from(grouped.keys()).pop() === parish && filtered.length > 0 && (
            <div style={{ padding: '20px 16px', borderTop: '3px solid var(--INK)', background: 'var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ ...T, fontSize: '10px', color: 'rgba(240,236,224,.35)' }}>
                Are you a maker? Share a place you love.
              </div>
              <Link href="/welcome/maker" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--P)', background: 'var(--RED)', border: '2px solid var(--RED)', padding: '10px 16px', textDecoration: 'none' }}>
                JOIN & SUBMIT A GEM →
              </Link>
            </div>
          )}
        </div>
      ))}

      {/* Back */}
      <div style={{ padding: '16px', borderTop: filtered.length === 0 ? '3px solid var(--INK)' : 'none' }}>
        <Link href="/markets" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--RED)', textDecoration: 'none' }}>
          ← BACK TO MARKETS
        </Link>
      </div>
    </div>
  )
}
