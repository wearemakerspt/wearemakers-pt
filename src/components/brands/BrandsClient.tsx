'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import SaveBrandButton from '@/components/ui/SaveBrandButton'

interface Brand {
  id: string
  display_name: string
  slug: string | null
  bio: string | null
  bio_i18n: any
  instagram_handle: string | null
  avatar_url: string | null
  featured_photo_url?: string | null
  is_verified: boolean
  is_live: boolean
  live_market_name?: string | null
}

interface Props {
  brands: Brand[]
  userId: string | null
}

export default function BrandsClient({ brands, userId }: Props) {
  const [activeCategory, setActiveCategory] = useState('all')

  // Build category list dynamically from actual brand data
  const categories = useMemo(() => {
    const catSet = new Set<string>()
    for (const b of brands) {
      const raw = (b.bio_i18n as any)?._category
      if (!raw) continue
      // Categories can be comma-separated
      for (const c of raw.split(',')) {
        const trimmed = c.trim()
        if (trimmed) catSet.add(trimmed)
      }
    }
    // Canonical display order — known categories first, then any extras
    const known = ['CERAMICS', 'LEATHER', 'TEXTILE', 'PAPER', 'JEWELLERY', 'GLASS', 'WOODWORK', 'CLOTHING', 'T-SHIRTS & HOODIES', 'PRINTS', 'ILLUSTRATION', 'PHOTOGRAPHY', 'ACCESSORIES', 'FOOD', 'PLANTS']
    const sorted: string[] = []
    for (const k of known) {
      if (catSet.has(k)) sorted.push(k)
    }
    // Add any remaining cats not in the known list
    for (const c of catSet) {
      if (!sorted.includes(c)) sorted.push(c)
    }
    return sorted
  }, [brands])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return brands
    if (activeCategory === '● LIVE NOW') return brands.filter(b => b.is_live)
    return brands.filter(b => {
      const cat = (b.bio_i18n as any)?._category ?? ''
      // Match any comma-separated category
      return cat.split(',').some((c: string) => c.trim() === activeCategory)
    })
  }, [brands, activeCategory])

  const T = { fontFamily: 'var(--TAG)', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const liveCount = brands.filter(b => b.is_live).length

  const allTabs = [
    'all',
    ...(liveCount > 0 ? ['● LIVE NOW'] : []),
    ...categories,
  ]

  return (
    <div>
      {/* ── Category filter bar — flush left, no gap, horizontal scroll ── */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        borderBottom: '3px solid var(--INK)',
        background: 'var(--P2)',
        // No padding-left — pills start at the very edge
      }}>
        <style>{`.brands-filter::-webkit-scrollbar { display: none; }`}</style>
        {allTabs.map((cat) => {
          const active = activeCategory === cat
          const isLive = cat === '● LIVE NOW'
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...T,
                fontSize: '10px',
                fontWeight: 700,
                padding: '12px 16px',
                background: active ? 'var(--INK)' : 'transparent',
                color: active ? 'var(--P)' : isLive ? 'var(--GRN)' : 'rgba(24,22,20,.5)',
                border: 'none',
                borderRight: '2px solid rgba(24,22,20,.1)',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {cat === 'all' ? 'ALL BRANDS' : cat}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <div style={{ padding: '10px 16px', borderBottom: '2px solid rgba(24,22,20,.08)', background: 'var(--P)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.35)' }}>
          {filtered.length} BRAND{filtered.length !== 1 ? 'S' : ''}
          {activeCategory !== 'all' && ` · ${activeCategory === '● LIVE NOW' ? 'LIVE NOW' : activeCategory}`}
        </div>
        {liveCount > 0 && activeCategory !== '● LIVE NOW' && (
          <div style={{ ...T, fontSize: '9px', color: 'var(--GRN)', fontWeight: 700 }}>
            ● {liveCount} LIVE NOW
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(24,22,20,.12)', marginBottom: '8px' }}>
            NO BRANDS IN THIS CATEGORY
          </div>
          <button
            onClick={() => setActiveCategory('all')}
            style={{ ...T, fontSize: '10px', color: 'var(--RED)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            SEE ALL BRANDS →
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 0,
        }}>
          {filtered.map((brand, i) => {
            const cardImage = brand.featured_photo_url ?? brand.avatar_url ?? null
            const category = (brand.bio_i18n as any)?._category?.split(',')[0]?.trim() ?? null
            const priceRange = (brand.bio_i18n as any)?._price_range ?? null

            return (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug ?? brand.id}`}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  borderRight: '2px solid var(--INK)',
                  borderBottom: '2px solid var(--INK)',
                  background: brand.is_live ? 'rgba(26,92,48,.03)' : 'var(--P)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* LIVE badge */}
                {brand.is_live && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    background: 'var(--GRN)',
                    fontFamily: 'var(--TAG)',
                    fontWeight: 700,
                    fontSize: '8px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    padding: '3px 8px',
                    zIndex: 2,
                    textAlign: 'center',
                  }}>
                    ● LIVE NOW{brand.live_market_name ? ` · ${brand.live_market_name}` : ''}
                  </div>
                )}

                {/* Photo */}
                <div style={{
                  aspectRatio: '1',
                  background: 'var(--P2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {cardImage
                    ? <img src={cardImage} alt={brand.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover', paddingTop: brand.is_live ? '20px' : '0' }} />
                    : <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '36px', color: 'rgba(24,22,20,.1)', letterSpacing: '-0.02em', marginTop: brand.is_live ? '20px' : '0' }}>
                        {brand.display_name.slice(0, 2).toUpperCase()}
                      </span>
                  }
                  {brand.is_verified && (
                    <div style={{
                      position: 'absolute',
                      top: brand.is_live ? '26px' : '6px',
                      right: '6px',
                      background: 'var(--INK)',
                      fontFamily: 'var(--TAG)',
                      fontWeight: 700,
                      fontSize: '7px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--P)',
                      padding: '2px 5px',
                    }}>
                      ★ PRO
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '10px 10px 12px', borderTop: '2px solid var(--INK)' }}>
                  <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>
                    {brand.display_name}
                  </div>
                  {category && (
                    <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', marginBottom: '2px' }}>
                      {category}
                    </div>
                  )}
                  {priceRange && (
                    <div style={{ fontFamily: 'var(--MONO)', fontSize: '11px', color: 'rgba(24,22,20,.45)', fontWeight: 700 }}>
                      {priceRange}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}

          {/* CTA card */}
          <Link href="/welcome/maker" style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '2px solid var(--INK)',
            borderBottom: '2px solid var(--INK)',
            background: 'var(--INK)',
            aspectRatio: '1',
            padding: '16px',
            textAlign: 'center',
            minHeight: '160px',
          }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--RED)', lineHeight: 1.1, marginBottom: '6px' }}>
              SELL AT<br />LISBON<br />MARKETS?
            </div>
            <div style={{ fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--P)', opacity: 0.6 }}>
              JOIN FREE →
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
