import type { Metadata } from 'next'
import { getAllBrands } from '@/lib/queries/brands'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import BrandsClient from '@/components/brands/BrandsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Brands — WEAREMAKERS.PT',
  description: '200+ independent maker brands at Lisbon street markets. Browse, filter by category, find who is live today.',
  alternates: { canonical: '/brands' },
}

export default async function BrandsPage() {
  const [brands, user] = await Promise.all([
    getAllBrands(),
    getCurrentUser(),
  ])

  const liveBrands = brands.filter(b => b.is_live)

  return (
    <>
      <SiteHeader user={user} liveCount={liveBrands.length} />
      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* Header */}
        <div style={{ background: 'var(--INK)', borderBottom: '3px solid var(--INK)', padding: '16px', borderLeft: '4px solid var(--RED)' }}>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', fontWeight: 700, color: 'var(--RED)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '6px' }}>
            200+ INDEPENDENT MAKERS
          </div>
          <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(36px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: 'var(--P)', marginBottom: '10px' }}>
            ALL BRANDS
          </h1>
          {liveBrands.length > 0 && (
            <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'var(--GRN)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
              ● {liveBrands.length} LIVE NOW
            </div>
          )}
        </div>

        <BrandsClient brands={brands} userId={user?.id ?? null} />

      </main>
    </>
  )
}
