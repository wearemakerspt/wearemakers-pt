import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wearemakers.pt'
  const supabase = await createClient()

  // Journal articles
  const { data: articles } = await supabase
    .from('journal_articles')
    .select('slug, published_at, updated_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  // Maker brand profiles
  const { data: makers } = await supabase
    .from('profiles')
    .select('slug, updated_at')
    .in('role', ['maker', 'admin'])
    .eq('is_active', true)
    .not('slug', 'is', null)

  // Markets — upcoming and live only
  const { data: markets } = await supabase
    .from('markets')
    .select('id, updated_at')
    .in('status', ['live', 'community_live', 'scheduled'])
    .gte('event_date', new Date().toISOString().split('T')[0])

  const staticRoutes: MetadataRoute.Sitemap = [
    // Core public pages
    { url: base,                      lastModified: new Date(), changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${base}/markets`,         lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${base}/brands`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/journal`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/circuit`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    // Acquisition pages — important for SEO
    { url: `${base}/pitch`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/espacos`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    // WAM TOP 20
    { url: `${base}/brands/wam-top20`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? []).map(a => ({
    url: `${base}/journal/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const brandRoutes: MetadataRoute.Sitemap = (makers ?? [])
    .filter(m => m.slug)
    .map(m => ({
      url: `${base}/brands/${m.slug}`,
      lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  const marketRoutes: MetadataRoute.Sitemap = (markets ?? []).map(m => ({
    url: `${base}/markets/${m.id}`,
    lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...articleRoutes, ...brandRoutes, ...marketRoutes]
}
