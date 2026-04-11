'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

type Brand = {
  id: string
  display_name: string
  slug: string
  avatar_url: string | null
  is_verified: boolean
  bio_i18n: any
  instagram_handle: string | null
}

type Props = {
  brands: Brand[]
  liveIds: Set<string>
  title: string
  subtitle?: string
  accentColor?: string
}

export default function BrandCollection({
  brands,
  liveIds,
  title,
  subtitle,
  accentColor = 'var(--INK)',
}: Props) {
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [priceFilter, setPriceFilter] = useState('ALL')
  const [liveOnly, setLiveOnly] = useState(false)

  const categories = useMemo(() => {
    const cats = new Set<string>()
    brands.forEach(b => { const c = b.bio_i18n?._category; if (c) cats.add(c) })
    return Array.from(cats).sort()
  }, [brands])

  const prices = useMemo(() => {
    const ps = new Set<string>()
    brands.forEach(b => { const p = b.bio_i18n?._price_range; if (p) ps.add(p) })
    return Array.from(ps).sort()
  }, [brands])

  const hasLive = brands.some(b => liveIds.has(b.id))

  const filtered = useMemo(() => brands.filter(b => {
    if (categoryFilter !== 'ALL' && b.bio_i18n?._category !== categoryFilter) return false
    if (priceFilter !== 'ALL' && b.bio_i18n?._price_range !== priceFilter) return false
    if (liveOnly && !liveIds.has(b.id)) return false
    return true
  }), [brands, categoryFilter, priceFilter, liveOnly, liveIds])

  const showCatFilter = categories.length > 1
  const showPriceFilter = prices.length > 1
  const showFilters = showCatFilter || showPriceFilter || hasLive

  const T = { fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase' as const }

  function Btn({ active, onClick, label, green }: { active: boolean; onClick: () => void; label: string; green?: boolean }) {
    const bg = active ? (green ? 'var(--GRN)' : accentColor) : 'transparent'
    const col = active ? 'var(--P)' : 'var(--INK)'
    const border = active ? (green ? '2px solid var(--GRN)' : `2px solid ${accentColor}`) : '2px solid rgba(24,22,20,.3)'
    return (
      <button onClick={onClick} style={{ ...T, fontSize: '9px', padding: '4px 10px', background: bg, color: col, border, cursor: 'pointer' }}>
        {label}
      </button>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--P)' }}>

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--P)', borderBottom: '3px solid var(--INK)', padding: '14px' }}>
        <Link href="/" style={{ ...T, fontSize: '9px', color: 'var(--INK)', opacity: 0.4, textDecoration: 'none', display: 'inline-block', marginBottom: '8px' }}>
          ← BACK
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(28px,6vw,48px)', textTransform: 'uppercase', lineHeight: 0.92, color: 'var(--INK)', letterSpacing: '-0.01em' }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'var(--INK)', opacity: 0.45, marginTop: '5px' }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ ...T, fontSize: '9px', color: 'var(--INK)', opacity: 0.35 }}>
            {filtered.length}/{brands.length} MAKERS
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ borderBottom: '2px solid var(--INK)', padding: '10px 14px', display: 'flex', gap: '6px', flexWrap: 'wrap', background: 'var(--P2)' }}>
          {showCatFilter && (
            <>
              <Btn active={categoryFilter === 'ALL'} onClick={() => setCategoryFilter('ALL')} label="ALL" />
              {categories.map(c => <Btn key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} label={c} />)}
            </>
          )}
          {showPriceFilter && (
            <>
              {showCatFilter && <span style={{ width: '1px', background: 'rgba(24,22,20,.15)', alignSelf: 'stretch', margin: '0 2px' }} />}
              {prices.map(p => <Btn key={p} active={priceFilter === p} onClick={() => setPriceFilter(priceFilter === p ? 'ALL' : p)} label={p} />)}
            </>
          )}
          {hasLive && (
            <>
              <span style={{ width: '1px', background: 'rgba(24,22,20,.15)', alignSelf: 'stretch', margin: '0 2px' }} />
              <Btn active={liveOnly} onClick={() => setLiveOnly(v => !v)} label="● LIVE NOW" green />
            </>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1px', background: 'var(--INK)', border: '3px solid var(--INK)', margin: '14px' }}>
          {filtered.map((brand, i) => {
            const isLive = liveIds.has(brand.id)
            return (
              <Link key={brand.id} href={`/brands/${brand.slug}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{ background: 'var(--P)', padding: '12px', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--P2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--P)' }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    {brand.avatar_url ? (
                      <img src={brand.avatar_url} alt={brand.display_name} style={{ width: '44px', height: '44px', objectFit: 'cover', border: '2px solid var(--INK)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', border: '2px solid var(--INK)', background: 'var(--P3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--TAG)', fontSize: '9px', color: 'var(--INK)', opacity: 0.35 }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {brand.display_name}
                      </div>
                      {brand.bio_i18n?._category && (
                        <div style={{ ...T, fontSize: '9px', color: 'var(--INK)', opacity: 0.4, marginTop: '3px' }}>
                          {brand.bio_i18n._category}{brand.bio_i18n._price_range ? ` · ${brand.bio_i18n._price_range}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {isLive && (
                      <span style={{ ...T, fontSize: '8px', background: 'var(--GRN)', color: 'var(--P)', padding: '2px 6px' }}>● LIVE</span>
                    )}
                    {brand.is_verified && (
                      <span style={{ ...T, fontSize: '8px', border: '1px solid var(--INK)', color: 'var(--INK)', padding: '2px 6px' }}>PRO</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div style={{ padding: '48px 24px', textAlign: 'center', fontFamily: 'var(--MONO)', fontSize: '13px', color: 'var(--INK)', opacity: 0.3 }}>
          No makers match the current filters.
        </div>
      )}

      <div style={{ height: '40px' }} />
    </div>
  )
}
