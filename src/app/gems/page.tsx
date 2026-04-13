import type { Metadata } from 'next'
import { getAllGems } from '@/lib/queries/markets'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import GemsClient from '@/components/gems/GemsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hidden Gems — WEAREMAKERS.PT',
  description: 'Places recommended by Lisbon\'s independent makers. The best coffee, food, studios and shops near the street markets — curated by the people who know these streets.',
  alternates: { canonical: '/gems' },
}

export default async function GemsPage() {
  const [gems, user] = await Promise.all([
    getAllGems(),
    getCurrentUser(),
  ])

  const T = { fontFamily: 'var(--TAG)', letterSpacing: '0.18em', textTransform: 'uppercase' as const }

  return (
    <>
      <SiteHeader user={user} />
      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>
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
        <GemsClient gems={gems} userId={user?.id ?? null} />
      </main>
    </>
  )
}
