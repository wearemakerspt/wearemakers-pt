import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllArticles, getArticleBySlug, getMakersForArticle } from '@/lib/queries/journal'
import { getCurrentUser } from '@/lib/queries/auth'
import { absoluteUrl } from '@/lib/utils'
import SiteHeader from '@/components/ui/SiteHeader'
import ArticleBody from '@/components/journal/ArticleBody'
import MakersInLoop from '@/components/journal/MakersInLoop'

// ISR: revalidate every 5 minutes
export const revalidate = 300
export const dynamic = 'force-dynamic'

// Pre-render all published articles at build time

// Per-article OG metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return { title: 'Article Not Found' }
  }

  const title = article.seo_title ?? article.title
  const description = article.seo_description ?? article.dek

  return {
    title,
    description,
    openGraph: {
      title: `${title} | WEAREMAKERS.PT`,
      description,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
      authors: [article.author_name],
      images: article.cover_image_url
        ? [{ url: article.cover_image_url, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
    alternates: {
      canonical: `/journal/${slug}`,
    },
  }
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params

  const [article, user] = await Promise.all([
    getArticleBySlug(slug),
    getCurrentUser(),
  ])

  if (!article) notFound()

  // Fetch maker profiles mentioned in this article
  const featuredMakers = await getMakersForArticle(article.featured_makers ?? [])

  // JSON-LD structured data for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Organization',
      name: article.author_name,
      url: absoluteUrl('/'),
    },
    publisher: {
      '@type': 'Organization',
      name: 'WEAREMAKERS.PT',
      url: absoluteUrl('/'),
    },
    image: article.cover_image_url ?? absoluteUrl('/og-default.png'),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/journal/${slug}`),
    },
  }

  return (
    <>
      <SiteHeader user={user} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        {/* Article */}
        <article className="max-w-2xl mx-auto px-5 py-8 pb-16">
          {/* Kicker */}
          <p className="font-tag font-bold text-xs tracking-[0.28em] uppercase text-stamp mb-3">
            {article.kicker}
            {article.published_at && (
              <>
                {' · '}
                {new Date(article.published_at)
                  .toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  .toUpperCase()}
              </>
            )}
          </p>

          {/* Title */}
          <h1 className="font-display font-black text-5xl md:text-6xl uppercase tracking-tight leading-[0.88] text-ink mb-4">
            {article.title}
          </h1>

          {/* 4px rule */}
          <div className="h-1 bg-ink w-20 mb-4" />

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 font-tag text-xs tracking-widest uppercase text-ink/35 mb-6">
            <span>{article.author_name}</span>
            {article.published_at && (
              <span>
                {new Date(article.published_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          {/* Lede — displayed large */}
          <p className="font-mono text-[clamp(18px,2.6vw,22px)] text-ink leading-[1.7] font-bold mb-6 border-l-[5px] border-stamp pl-4">
            {article.lede}
          </p>

          {/* Article body — Markdown rendered server-side */}
          <ArticleBody content={article.body_md} />

          {/* Pull quote */}
          {article.pull_quote && (
            <blockquote className="border-t-[3px] border-b-[3px] border-ink py-5 my-8">
              <p className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight leading-tight text-ink">
                &ldquo;{article.pull_quote}&rdquo;
              </p>
            </blockquote>
          )}

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-dashed border-ink">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-tag text-xs tracking-widest uppercase text-ink/45 border border-ink/20 px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Makers in this Loop */}
        {featuredMakers.length > 0 && (
          <MakersInLoop makers={featuredMakers} articleSlug={slug} />
        )}

        {/* Back to journal */}
        <div className="px-5 pb-16 max-w-2xl mx-auto">
          <a
            href="/journal"
            className="font-tag font-bold text-xs tracking-widest uppercase text-ink/45 hover:text-ink transition-colors"
          >
            ← BACK TO THE JOURNAL
          </a>
        </div>
      </main>
    </>
  )
}
