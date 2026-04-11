import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles, getArticleBySlug, getMakersForArticle } from '@/lib/queries/journal'
import { getCurrentUser } from '@/lib/queries/auth'
import { absoluteUrl } from '@/lib/utils'
import SiteHeader from '@/components/ui/SiteHeader'
import MakersInLoop from '@/components/journal/MakersInLoop'

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Article Not Found' }

  const title = article.seo_title ?? article.title
  const description = article.seo_description ?? article.dek

  return {
    title: `${title} — WEAREMAKERS.PT`,
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
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `/journal/${slug}` },
  }
}

// Simple markdown → HTML (headings, paragraphs, bold, italic, links)
function renderMarkdown(md: string): string {
  return md
    .split('\n\n')
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''

      // ## Heading 2
      if (trimmed.startsWith('## ')) {
        const text = trimmed.slice(3)
        return `<h2>${text}</h2>`
      }
      // ### Heading 3
      if (trimmed.startsWith('### ')) {
        const text = trimmed.slice(4)
        return `<h3>${text}</h3>`
      }

      // Paragraph — process inline formatting
      let html = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, ' ')

      return `<p>${html}</p>`
    })
    .filter(Boolean)
    .join('')
}

interface Props { params: Promise<{ slug: string }> }

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, user] = await Promise.all([
    getArticleBySlug(slug),
    getCurrentUser(),
  ])
  if (!article) notFound()

  const featuredMakers = await getMakersForArticle(article.featured_makers ?? [])
  const bodyHtml = renderMarkdown(article.body_md ?? '')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { '@type': 'Organization', name: article.author_name, url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: 'WEAREMAKERS.PT', url: absoluteUrl('/') },
    image: article.cover_image_url ?? absoluteUrl('/og-default.png'),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/journal/${slug}`) },
  }

  const T = { fontFamily: 'var(--TAG)', letterSpacing: '0.18em', textTransform: 'uppercase' as const }

  return (
    <>
      <SiteHeader user={user} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* Article header — dark */}
        <div style={{ background: 'var(--INK)', padding: '24px 16px', borderBottom: '3px solid var(--INK)' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>

            {/* Kicker + date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--RED)' }}>
                {article.kicker}
              </div>
              {article.published_at && (
                <>
                  <span style={{ color: 'rgba(240,236,224,.2)', fontSize: '10px' }}>·</span>
                  <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.35)' }}>
                    {new Date(article.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(36px,8vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: 'var(--P)', marginBottom: '16px' }}>
              {article.title}
            </h1>

            {/* Rule */}
            <div style={{ width: '40px', height: '4px', background: 'var(--RED)', marginBottom: '16px' }} />

            {/* Author */}
            <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.3)' }}>
              {article.author_name}
            </div>
          </div>
        </div>

        {/* Lede — large opening paragraph */}
        <div style={{ borderBottom: '3px solid var(--INK)', padding: '24px 16px', background: 'var(--P2)' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <p style={{ fontFamily: 'var(--MONO)', fontSize: 'clamp(17px,2.5vw,21px)', color: 'var(--INK)', lineHeight: 1.75, fontWeight: 700, borderLeft: '4px solid var(--RED)', paddingLeft: '16px', margin: 0 }}>
              {article.lede}
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '32px 16px', borderBottom: '3px solid var(--INK)' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <style>{`
              .article-body h2 {
                font-family: var(--LOGO);
                font-weight: 900;
                font-size: clamp(24px, 4vw, 32px);
                text-transform: uppercase;
                letter-spacing: -0.01em;
                line-height: 0.95;
                color: var(--INK);
                margin: 36px 0 16px;
                padding-top: 24px;
                border-top: 2px solid var(--INK);
              }
              .article-body h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
              .article-body h3 {
                font-family: var(--TAG);
                font-weight: 700;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                color: var(--RED);
                margin: 28px 0 10px;
              }
              .article-body p {
                font-family: var(--MONO);
                font-size: 16px;
                color: rgba(24,22,20,.75);
                line-height: 1.85;
                margin: 0 0 20px;
              }
              .article-body p:last-child { margin-bottom: 0; }
              .article-body strong { color: var(--INK); font-weight: 700; }
              .article-body em { font-style: italic; }
              .article-body a { color: var(--RED); text-decoration: underline; text-underline-offset: 3px; }
              .article-body a:hover { opacity: 0.7; }
            `}</style>
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </div>
        </div>

        {/* Pull quote */}
        {article.pull_quote && (
          <div style={{ borderBottom: '3px solid var(--INK)', padding: '32px 16px', background: 'var(--INK)' }}>
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <blockquote style={{ margin: 0, borderTop: '3px solid rgba(240,236,224,.15)', borderBottom: '3px solid rgba(240,236,224,.15)', padding: '24px 0' }}>
                <p style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(22px,4vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.05, color: 'var(--P)', margin: 0 }}>
                  &ldquo;{article.pull_quote}&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div style={{ padding: '16px', borderBottom: '3px solid var(--INK)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {article.tags.map(tag => (
              <span key={tag} style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', border: '1px solid rgba(24,22,20,.2)', padding: '3px 10px' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Makers in this Loop */}
        {featuredMakers.length > 0 && (
          <MakersInLoop makers={featuredMakers} articleSlug={slug} />
        )}

        {/* Back */}
        <div style={{ padding: '20px 16px' }}>
          <Link href="/journal" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--RED)', textDecoration: 'none' }}>
            ← BACK TO THE JOURNAL
          </Link>
        </div>

      </main>
    </>
  )
}
