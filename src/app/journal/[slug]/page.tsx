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
    openGraph: { title: `${title} | WEAREMAKERS.PT`, description, type: 'article', publishedTime: article.published_at ?? undefined, authors: [article.author_name], images: article.cover_image_url ? [{ url: article.cover_image_url, width: 1200, height: 630, alt: title }] : [] },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: `/journal/${slug}` },
  }
}

function renderMarkdown(md: string): string {
  return md.split('\n\n').map(block => {
    const t = block.trim()
    if (!t) return ''
    if (t.startsWith('## ')) return `<h2>${t.slice(3)}</h2>`
    if (t.startsWith('### ')) return `<h3>${t.slice(4)}</h3>`
    let html = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g, ' ')
    return `<p>${html}</p>`
  }).filter(Boolean).join('')
}

interface Props { params: Promise<{ slug: string }> }

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, user] = await Promise.all([getArticleBySlug(slug), getCurrentUser()])
  if (!article) notFound()

  const featuredMakers = await getMakersForArticle(article.featured_makers ?? [])
  const bodyHtml = renderMarkdown(article.body_md ?? '')

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: article.title, description: article.dek,
    datePublished: article.published_at, dateModified: article.updated_at,
    author: { '@type': 'Organization', name: article.author_name, url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: 'WEAREMAKERS.PT', url: absoluteUrl('/') },
    image: article.cover_image_url ?? absoluteUrl('/og-default.png'),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/journal/${slug}`) },
  }

  return (
    <>
      <SiteHeader user={user} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        {/* Article hero — dark */}
        <div style={{ background: INK, padding: '60px 52px 52px', borderBottom: B, maxWidth: '820px' }}>
          {/* Kicker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '28px', height: '2px', background: RED, display: 'inline-block', flexShrink: 0 }} />
            <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.22em', color: RED, textTransform: 'uppercase' }}>{article.kicker}</div>
            {article.published_at && (
              <>
                <span style={{ color: 'rgba(244,241,236,0.2)' }}>·</span>
                <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(244,241,236,0.35)', textTransform: 'uppercase' }}>
                  {new Date(article.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                </div>
              </>
            )}
          </div>
          <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(36px,8vw,96px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: WHITE, marginBottom: '28px' }}>
            {article.title}
          </h1>
          <div style={{ width: '40px', height: '4px', background: RED, marginBottom: '16px' }} />
          <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(244,241,236,0.3)', textTransform: 'uppercase' }}>{article.author_name}</div>
        </div>

        {/* Lede */}
        <div style={{ borderBottom: B, padding: '32px 52px', background: PAPER }}>
          <div style={{ maxWidth: '640px' }}>
            <p style={{ fontFamily: FB, fontSize: 'clamp(17px,2.5vw,21px)', color: INK, lineHeight: 1.75, fontWeight: 400, borderLeft: `4px solid ${RED}`, paddingLeft: '20px', margin: 0 }}>
              {article.lede}
            </p>
          </div>
        </div>

        {/* Body + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', borderBottom: B, alignItems: 'start' }} className="article-body">
          {/* Content */}
          <div style={{ padding: '52px 52px 60px', borderRight: B, maxWidth: '640px' }}>
            <style>{`
              .art-body h2 { font-family: ${FH}; font-weight: 900; font-size: 26px; text-transform: uppercase; letter-spacing: 0.02em; color: ${INK}; margin: 36px 0 14px; padding-top: 24px; border-top: ${Bsm}; line-height: 1.1; }
              .art-body h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
              .art-body h3 { font-family: ${FM}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; color: ${RED}; margin: 28px 0 10px; }
              .art-body p { font-family: ${FB}; font-weight: 300; font-size: 15px; color: ${STONE}; line-height: 1.75; margin: 0 0 20px; }
              .art-body p:last-child { margin-bottom: 0; }
              .art-body strong { color: ${INK}; font-weight: 600; }
              .art-body em { font-style: italic; }
              .art-body a { color: ${RED}; text-decoration: underline; text-underline-offset: 3px; }
              .art-body a:hover { opacity: 0.7; }
              .art-body blockquote { border-left: 3px solid ${RED}; background: ${PAPER}; padding: 14px 18px; font-style: italic; color: ${STONE}; margin: 20px 0; }
            `}</style>
            <div className="art-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </div>

          {/* Sidebar */}
          <div style={{ padding: '40px 28px', position: 'sticky' as const, top: '50px' }}>
            {featuredMakers.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: STONE, borderBottom: Bsm, paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                  MAKERS IN THIS LOOP
                </div>
                {featuredMakers.slice(0, 4).map((m: any) => (
                  <Link key={m.id} href={`/brands/${m.slug ?? m.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: Bsm, textDecoration: 'none', color: 'inherit', transition: 'opacity .15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.5'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                  >
                    <div style={{ width: '32px', height: '32px', flexShrink: 0, background: PAPER, border: Bsm, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontWeight: 900, fontSize: '11px', color: STONE }}>
                      {m.avatar_url ? <img src={m.avatar_url} alt={m.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', color: INK }}>{m.display_name}</div>
                      <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.06em' }}>{m.bio_i18n?._category?.split(',')[0]?.trim() ?? ''}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div>
              <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: STONE, borderBottom: Bsm, paddingBottom: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>MORE FROM THE JOURNAL</div>
              <Link href="/journal" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>ALL ARTICLES →</Link>
            </div>
          </div>
        </div>

        {/* Pull quote */}
        {article.pull_quote && (
          <div style={{ borderBottom: B, padding: '40px 52px', background: INK }}>
            <blockquote style={{ margin: 0, borderTop: '1px solid rgba(244,241,236,0.1)', borderBottom: '1px solid rgba(244,241,236,0.1)', padding: '24px 0' }}>
              <p style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(22px,4vw,32px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.05, color: WHITE, margin: 0 }}>
                &ldquo;{article.pull_quote}&rdquo;
              </p>
            </blockquote>
          </div>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div style={{ padding: '20px 52px', borderBottom: B, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {article.tags.map((tag: string) => (
              <span key={tag} style={{ fontFamily: FM, fontSize: '10px', color: STONE, border: `1px solid rgba(12,12,12,0.2)`, padding: '4px 12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{tag}</span>
            ))}
          </div>
        )}

        {featuredMakers.length > 0 && <MakersInLoop makers={featuredMakers} articleSlug={slug} />}

        <div style={{ padding: '24px 52px' }}>
          <Link href="/journal" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>← BACK TO THE JOURNAL</Link>
        </div>
      </main>
      <style>{`
        @media (max-width: 860px) {
          .article-body { grid-template-columns: 1fr !important; }
          .article-body > div:first-child { border-right: none !important; border-bottom: ${Bsm} !important; padding: 36px 24px 48px !important; max-width: 100% !important; }
          .article-body > div:last-child { position: static !important; padding: 28px 24px !important; }
        }
      `}</style>
    </>
  )
}
