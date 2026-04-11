import { getWamTop20, getLiveIds } from '@/lib/queries/spotlight'
import BrandCollection from '@/components/ui/BrandCollection'

export const revalidate = 60

export const metadata = {
  title: 'WAM TOP 20 — WEAREMAKERS.PT',
  description: 'The 20 independent maker brands defining Lisbon right now, selected by the WEAREMAKERS editorial team.',
}

export default async function WamTop20Page() {
  const [rows, liveIds] = await Promise.all([
    getWamTop20(),
    getLiveIds(),
  ])

  const brands = (rows as any[]).map(r => r.maker).filter(Boolean)

  return (
    <BrandCollection
      brands={brands}
      liveIds={liveIds}
      title="WAM TOP 20"
      subtitle="The 20 independent maker brands defining Lisbon right now."
      accentColor="var(--RED)"
    />
  )
}
