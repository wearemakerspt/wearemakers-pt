import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wearemakers.pt'
  const supabase = await createClient()

  // Journal articles
  const { data: articles } = await supabase
    .from('journal_articles')
    .select('slug, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  // Maker brands
  const { data: makers } = await supabase
    .from('profiles')
    .select('slug, updated_at')
    .eq('role', 'maker')
    .not('slug', 'is', null)

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/markets`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/brands`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/journal`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map(a => ({
    url: `${base}/journal/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const brandRoutes: MetadataRoute.Sitemap = (makers ?? [])
    .filter(m => m.slug)
    .map(m => ({
      url: `${base}/brands/${m.slug}`,
      lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    }))

  return [...staticRoutes, ...articleRoutes, ...brandRoutes]
}
