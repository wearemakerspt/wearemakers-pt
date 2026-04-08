import type { MarketStatus } from '@/types/database'

/**
 * Format a Postgres date string "2026-04-05" as "SAT 05 APR"
 */
export function formatMarketDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d
    .toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
    .toUpperCase()
}

/**
 * Format a Postgres time string "09:00:00" as "09:00"
 */
export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

/**
 * Map a market status to a display label and colour class.
 */
export function getStatusMeta(status: MarketStatus): {
  label: string
  colorClass: string
  dotClass: string
} {
  switch (status) {
    case 'live':
      return { label: 'LIVE', colorClass: 'text-red-600', dotClass: 'bg-red-600' }
    case 'community_live':
      return { label: 'COMMUNITY', colorClass: 'text-green-800', dotClass: 'bg-green-800' }
    case 'scheduled':
      return { label: 'SCHEDULED', colorClass: 'text-stone-500', dotClass: 'bg-stone-400' }
    case 'shadow':
      return { label: 'UNCONFIRMED', colorClass: 'text-stone-400', dotClass: 'bg-stone-300' }
    case 'cancelled':
      return { label: 'CANCELLED', colorClass: 'text-stone-900', dotClass: 'bg-stone-900' }
  }
}

/**
 * Generate an absolute URL for use in OG tags and sitemaps.
 */
export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    'https://wearemakers.pt'
  return `${base}${path}`
}

/**
 * Slugify a string — "The Arroios Loop" → "the-arroios-loop"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
