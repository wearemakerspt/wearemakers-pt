import Link from 'next/link'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import BrandCard from '@/components/brands/BrandCard'
import type { BrandSummary } from '@/lib/queries/brands'

// Raw brand shape coming from spotlight queries
type SpotlightBrand = {
  id: string
  display_name: string
  slug: string
  avatar_url: string | null
  is_verified: boolean
  bio_i18n: any
  instagram_handle: string | null
}

// Normalise spotlight brand → BrandSummary shape BrandCard expects
function normalise(b: SpotlightBrand, liveIds: Set<string>): BrandSummary {
  return {
    id: b.id,
    display_name: b.display_name,
    slug: b.slug,
    avatar_url: b.avatar_url,
    is_verified: b.is_verified,
    bio_i18n: b.bio_i18n,
    instagram_handle: b.instagram_handle,
    bio: b.bio_i18n?.en ?? b.bio_i18n?.pt ?? null,
    is_live: liveIds.has(b.id),
    live_market_name: null,
    digital_offer: null,
  } as unknown as BrandSummary
}

type Props = {
  brands: SpotlightBrand[]
  liveIds: Set<string>
  title: string
  kicker: string
  subtitle?: string
}

const FONT_TAG = "'Share Tech Mono',monospace"
const FONT_LOGO = "'Barlow Condensed',sans-serif"
const INK = '#181614'
const PAPER = '#f0ece0'
const RED = '#c8291a'
const GRN = '#1a5c30'

// This is a Server Component — it fetches its own user for SiteHeader
export default async function BrandCollection({
  brands,
  liveIds,
  title,
  kicker,
  subtitle,
}: Props) {
  const user = await getCurrentUser()
  const liveCount = brands.filter(b => liveIds.has(b.id)).length
  const normalised = brands.map(b => normalise(b, liveIds))

  // Derive available categories from this collection only
  const rawCategories = Array.from(
    new Set(
      brands
        .map(b => b.bio_i18n?._category?.split(',')[0].trim())
        .filter(Boolean)
    )
  ).sort() as string[]

  const categories = ['ALL', ...rawCategories]

  return (
    <>
      <SiteHeader user={user} liveCount={liveCount} />
      <main style={{ background: PAPER, minHeight: '100dvh' }}>

        {/* Editorial header — matches /brands exactly */}
        <div style={{ padding: '16px 16px 0', background: PAPER, borderBottom: `3px solid ${INK}` }}>

          {/* Back link */}
          <Link href="/" style={{ fontFamily: FONT_TAG, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: INK, opacity: 0.4, textDecoration: 'none', display: 'inline-block', marginBottom: '8px' }}>
            ← BACK
          </Link>

          {/* Kicker */}
          <div style={{ fontFamily: FONT_TAG, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: `rgba(24,22,20,.4)`, marginBottom: '4px' }}>
            {kicker}
          </div>

          {/* Title + live count */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontFamily: FONT_LOGO, fontWeight: 900, fontSize: 'clamp(36px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: INK }}>
              {title}
            </div>
            {liveCount > 0 && (
              <div style={{ fontFamily: FONT_TAG, fontSize: '11px', fontWeight: 700, color: GRN, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '8px' }}>●</span> {liveCount} LIVE NOW
              </div>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div style={{ fontFamily: FONT_TAG, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: `rgba(24,22,20,.4)`, marginTop: '6px' }}>
              {subtitle}
            </div>
          )}

          {/* Filter pills — only shown when >1 category exists */}
          {categories.length > 2 && (
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', padding: '12px 0 0', flexWrap: 'nowrap' }}>
              {categories.map((cat, i) => (
                <span
                  key={cat}
                  style={{
                    fontFamily: FONT_TAG,
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '8px 14px',
                    border: `2px solid ${INK}`,
                    background: i === 0 ? RED : PAPER,
                    color: i === 0 ? '#fff' : INK,
                    marginRight: '6px',
                    marginBottom: '10px',
                    display: 'inline-block',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Maker count */}
          <div style={{ fontFamily: FONT_TAG, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: `rgba(24,22,20,.35)`, padding: '8px 0 12px' }}>
            {brands.length} MAKER{brands.length !== 1 ? 'S' : ''}
          </div>
        </div>

        {/* Brand grid — 4 col, same as /brands */}
        {normalised.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: `3px solid ${INK}` }}>
            {normalised.map(b => (
              <BrandCard key={b.id} brand={b} view="grid" />
            ))}
          </div>
        ) : (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_LOGO, fontWeight: 900, fontSize: '40px', textTransform: 'uppercase', color: `rgba(24,22,20,.12)`, marginBottom: '12px' }}>
              NO MAKERS YET
            </div>
            <div style={{ fontFamily: FONT_TAG, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: `rgba(24,22,20,.3)`, lineHeight: 2 }}>
              Check back soon.
            </div>
          </div>
        )}

      </main>
    </>
  )
}
