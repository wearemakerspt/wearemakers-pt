import { createClient } from '@/lib/supabase/server'
import type { JournalArticle } from '@/types/database'

export async function getAllArticles(): Promise<JournalArticle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('journal_articles')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('[journal] getAllArticles error:', error.message)
    return []
  }
  return data ?? []
}

export async function getArticleBySlug(slug: string): Promise<JournalArticle | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('journal_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('[journal] getArticleBySlug error:', error.message)
    }
    return null
  }
  return data
}

/**
 * Fetch maker profiles mentioned in an article.
 * featured_makers is UUID[] — query by id, not slug.
 */
export async function getMakersForArticle(makerIds: string[]) {
  if (!makerIds || makerIds.length === 0) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, slug, bio, instagram_handle, avatar_url, is_verified, digital_offer, role')
    .in('id', makerIds)
    .in('role', ['maker', 'admin'])

  if (error) {
    console.error('[journal] getMakersForArticle error:', error.message)
    return []
  }
  return data ?? []
}

export async function getNextMarket(): Promise<{
  id: string
  title: string
  event_date: string
  starts_at: string
  space_name: string | null
} | null> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('markets')
    .select('id, title, event_date, starts_at, space:spaces(name)')
    .in('status', ['scheduled', 'live', 'community_live'])
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .order('starts_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    title: data.title,
    event_date: data.event_date,
    starts_at: data.starts_at,
    space_name: (data.space as any)?.name ?? null,
  }
}
