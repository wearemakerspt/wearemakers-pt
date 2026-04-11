import { getCuratorSpotlightBrands, getLiveIds } from '@/lib/queries/spotlight'
import BrandCollection from '@/components/ui/BrandCollection'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ curatorSlug: string }>
}) {
  const { curatorSlug } = await params
  const { curator } = await getCuratorSpotlightBrands(curatorSlug)
  if (!curator) return {}
  return {
    title: `${curator.display_name} — Spotlight · WEAREMAKERS.PT`,
    description: `Maker picks by curator ${curator.display_name} at WEAREMAKERS.PT`,
  }
}

export default async function CuratorSpotlightPage({
  params,
}: {
  params: Promise<{ curatorSlug: string }>
}) {
  const { curatorSlug } = await params

  const [{ curator, brands }, liveIds] = await Promise.all([
    getCuratorSpotlightBrands(curatorSlug),
    getLiveIds(),
  ])

  if (!curator || brands.length === 0) notFound()

  return (
    <BrandCollection
      brands={brands}
      liveIds={liveIds}
      title={curator.display_name}
      kicker="CURATOR SPOTLIGHT"
      subtitle={`${brands.length} maker${brands.length !== 1 ? 's' : ''} selected`}
    />
  )
}
