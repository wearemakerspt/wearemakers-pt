import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wearemakers.pt'

  return {
    rules: [
      {
        // All bots — index public pages, block private ones
        userAgent: '*',
        allow: [
          '/',
          '/markets',
          '/markets/',
          '/brands',
          '/brands/',
          '/journal',
          '/journal/',
          '/circuit',
          '/pitch',
          '/espacos',
          '/welcome',
        ],
        disallow: [
          '/dashboard/',
          '/dashboard/maker',
          '/dashboard/curator',
          '/dashboard/admin',
          '/auth/',
          '/auth/login',
          '/auth/register',
          '/api/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
