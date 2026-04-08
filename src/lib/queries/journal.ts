import { createClient } from '@/lib/supabase/server'
import type { JournalArticle } from '@/types/database'

/**
 * Fetch all published journal articles, ordered newest first.
 * Used on the /journal index page (generateStaticParams for ISR).
 */
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

/**
 * Fetch a single article by slug.
 * Returns null if not found or not published (404).
 */
export async function getArticleBySlug(
  slug: string
): Promise<JournalArticle | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('journal_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      // PGRST116 = "no rows" — expected for 404
      console.error('[journal] getArticleBySlug error:', error.message)
    }
    return null
  }

  return data
}

/**
 * Fetch maker profiles mentioned in an article.
 * Used to populate the "Makers in this Loop" section.
 */
export async function getMakersForArticle(slugs: string[]) {
  if (!slugs.length) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, slug, bio, instagram_handle, avatar_url, is_verified, digital_offer, role')
    .in('slug', slugs)
    .eq('role', 'maker')
    .eq('is_active', true)

  if (error) {
    console.error('[journal] getMakersForArticle error:', error.message)
    return []
  }

  return data ?? []
}
