'use client'
import { useState } from 'react'
import SaveGemButton from '@/components/ui/SaveGemButton'

const CATEGORIES = ['ALL', 'COFFEE', 'FOOD', 'DRINKS', 'STUDIOS', 'SHOPS']
const CAT_ICONS: Record<string, string> = { coffee: '☕', food: '🍽', drinks: '🍷', studio: '◆', shop: '◈' }

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

type Gem = {
  id: string
  name: string
  category: string
  description: string | null
  address: string | null
  distance_metres: number | null
  vetted_by_name: string
  space_name: string | null
  space_parish: string | null
  near_space_id?: string | null
  is_saved?: boolean
}

type GroupedGems = {
  parish: string
  spaces: {
    space_name: string
    space_id: string | null
    gems: Gem[]
  }[]
}

export default function GemsClient({ gems, userId }: { gems: Gem[]; userId: string | null }) {
  const [activeCategory, setActiveCategory] = useState('ALL')

  const filtered = activeCategory === 'ALL'
    ? gems
    : gems.filter(g => g.category.toLowerCase() === activeCategory.toLowerCase())

  // Group by parish → space
  const grouped: GroupedGems[] = []
  const parishMap = new Map<string, Map<string, Gem[]>>()

  filtered.forEach(gem => {
    const parish = gem.space_parish ?? 'LISBON'
    const spaceName = gem.space_name ?? 'NEARBY'
    if (!parishMap.has(parish)) parishMap.set(parish, new Map())
    const spaceMap = parishMap.get(parish)!
    if (!spaceMap.has(spaceName)) spaceMap.set(spaceName, [])
    spaceMap.get(spaceName)!.push(gem)
  })

  parishMap.forEach((spaces, parish) => {
    const spaceArr: GroupedGems['spaces'] = []
    spaces.forEach((gs, spaceName) => {
      spaceArr.push({ space_name: spaceName, space_id: gs[0]?.near_space_id ?? null, gems: gs })
    })
    grouped.push({ parish, spaces: spaceArr })
  })

  return (
    <div>
      <style>{`
        .gem-tab:hover { background: ${INK} !important; color: ${WHITE} !important; }
        .gem-tab-active:hover { background: ${RED} !important; color: ${WHITE} !important; }
        .gem-row:hover { background: ${PAPER} !important; }
        .gem-dir-btn:hover { background: ${INK} !important; color: ${WHITE} !important; }
      `}</style>

      {/* Filter tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: B, overflowX: 'auto', scrollbarWidth: 'none', background: WHITE }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={cat === activeCategory ? 'gem-tab gem-tab-active' : 'gem-tab'}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0 20px', height: '44px',
              fontFamily: FM, fontSize: '10px', letterSpacing: '0.13em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', borderRight: Bsm, cursor: 'pointer', flexShrink: 0,
              background: cat === activeCategory ? INK : WHITE,
              color: cat === activeCategory ? WHITE : INK,
              border: 'none', borderRight: Bsm,
              transition: 'background .15s, color .15s',
            }}>
            {cat !== 'ALL' && <span>{CAT_ICONS[cat.toLowerCase()] ?? '◈'}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ padding: '10px 40px', borderBottom: Bsm, background: WHITE }}>
        <span style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {filtered.length} GEM{filtered.length !== 1 ? 'S' : ''} · {grouped.length} NEIGHBOURHOOD{grouped.length !== 1 ? 'S' : ''}
        </span>
      </div>

      {/* Gems grouped by parish → space */}
      {grouped.length === 0 ? (
        <div style={{ padding: '64px 40px', textAlign: 'center' }}>
          <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.14em', textTransform: 'uppercase' }}>No gems in this category yet.</div>
        </div>
      ) : (
        grouped.map(group => (
          <div key={group.parish}>
            {/* Parish header */}
            <div style={{ padding: '0 40px', height: '38px', display: 'flex', alignItems: 'center', background: PAPER, borderBottom: Bsm, borderTop: B }}>
              <span style={{ fontFamily: FH, fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'rgba(12,12,12,0.15)' }}>{group.parish}</span>
            </div>

            {group.spaces.map(spaceGroup => (
              <div key={spaceGroup.space_name}>
                {/* Space subheader */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: '42px', borderBottom: Bsm, background: WHITE }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '3px', height: '14px', background: RED, flexShrink: 0 }} />
                    <span style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK }}>
                      NEAR {spaceGroup.space_name.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {spaceGroup.gems.length} PLACE{spaceGroup.gems.length !== 1 ? 'S' : ''}
                  </span>
                </div>

                {/* Gems */}
                {spaceGroup.gems.map((gem, i) => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${gem.name}${gem.address ? ', ' + gem.address : ''}, Lisbon`)}`
                  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${gem.name} Lisbon`)}`

                  return (
                    <div key={gem.id} className="gem-row" style={{ display: 'flex', gap: 0, borderBottom: Bsm, background: i % 2 === 0 ? WHITE : PAPER, minHeight: '88px', transition: 'background .15s' }}>
                      {/* Icon column */}
                      <div style={{ width: '64px', flexShrink: 0, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', borderRight: B }}>
                        {CAT_ICONS[gem.category.toLowerCase()] ?? '◈'}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, padding: '16px 20px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1, marginBottom: '4px' }}>{gem.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              {gem.distance_metres !== null && (
                                <span style={{ fontFamily: FM, fontSize: '10px', border: Bsm, padding: '2px 8px', color: STONE }}>{gem.distance_metres}m</span>
                              )}
                              {gem.address && (
                                <span style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.06em' }}>{gem.address}</span>
                              )}
                            </div>
                          </div>
                          <SaveGemButton gemId={gem.id} userId={userId} initialSaved={gem.is_saved ?? false} />
                        </div>

                        {gem.description && (
                          <p style={{ fontFamily: FB, fontSize: '13px', color: STONE, lineHeight: 1.55, fontStyle: 'italic', marginBottom: '8px' }}>{gem.description}</p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.06em' }}>
                            ● rec by {gem.vetted_by_name}
                          </div>
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="gem-dir-btn"
                            style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: INK, border: B, padding: '5px 14px', textDecoration: 'none', transition: 'background .15s, color .15s' }}>
                            DIRECTIONS →
                          </a>
                          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="gem-dir-btn"
                            style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: STONE, border: Bsm, padding: '5px 14px', textDecoration: 'none', transition: 'background .15s, color .15s' }}>
                            SEARCH ON GOOGLE →
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ))
      )}

      {/* Submit CTA */}
      <div style={{ padding: '20px 40px', borderTop: B, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          ARE YOU A MAKER? SHARE A PLACE YOU LOVE.
        </div>
        <a href="/dashboard/maker" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: WHITE, background: RED, border: `2px solid ${RED}`, padding: '10px 20px', textDecoration: 'none' }}>
          JOIN &amp; SUBMIT A GEM →
        </a>
      </div>
    </div>
  )
}
