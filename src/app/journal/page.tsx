import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/queries/journal'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'The Journal — WEAREMAKERS.PT',
  description: 'Long-form guides to Lisbon\'s independent maker neighbourhoods. Walk LX Factory, Intendente, Príncipe Real — find the makers, the gems, the right coffee.',
  openGraph: {
    title: 'WEAREMAKERS.PT — The Journal',
    description: 'Neighbourhood Loops: walking guides to Lisbon\'s independent maker economy.',
    type: 'website',
  },
  alternates: { canonical: '/journal' },
}

export default async function JournalIndexPage() {
  const [articles, user] = await Promise.all([
    getAllArticles(),
    getCurrentUser(),
  ])

  const T = { fontFamily: 'var(--TAG)', letterSpacing: '0.18em', textTransform: 'uppercase' as const }

  return (
    <>
      <SiteHeader user={user} />
      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* Masthead */}
        <div style={{ borderBottom: '3px solid var(--INK)', padding: '0 16px' }}>
          <div style={{ borderTop: '2px solid var(--INK)', borderBottom: '2px solid var(--INK)', margin: '16px 0 10px', padding: '8px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '13px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'var(--INK)' }}>
              WEAREMAKERS.PT — THE JOURNAL
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.38)' }}>
              LISBON, {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
            </span>
            <span style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.38)' }}>NEIGHBOURHOOD LOOPS</span>
            <span style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.38)' }}>ISSUE {String(articles.length).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Article list */}
        {articles.length === 0 ? (
          <div style={{ padding: '64px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(24,22,20,.12)', marginBottom: '8px' }}>
              NO ARTICLES YET
            </div>
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>Check back soon.</div>
          </div>
        ) : (
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {articles.map((article, i) => (
              <li key={article.id} style={{ borderBottom: '3px solid var(--INK)' }}>
                <Link
                  href={`/journal/${article.slug}`}
                  style={{ textDecoration: 'none', display: 'flex', gap: '16px', padding: '20px 16px', background: i % 2 === 0 ? 'var(--P)' : 'var(--P2)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--P3)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? 'var(--P)' : 'var(--P2)'}
                >
                  {/* Issue number */}
                  <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '56px', color: 'rgba(24,22,20,.07)', lineHeight: 1, flexShrink: 0, width: '56px', textAlign: 'right', alignSelf: 'flex-start' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--RED)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>{article.kicker}</span>
                      {article.published_at && (
                        <>
                          <span style={{ color: 'rgba(24,22,20,.2)' }}>·</span>
                          <span style={{ fontWeight: 400, color: 'rgba(24,22,20,.38)' }}>
                            {new Date(article.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                          </span>
                        </>
                      )}
                    </div>

                    <h2 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(24px,5vw,36px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.92, color: 'var(--INK)', marginBottom: '10px' }}>
                      {article.title}
                    </h2>

                    <p style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.55)', lineHeight: 1.6, marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {article.dek}
                    </p>

                    <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.3)' }}>
                      {article.author_name}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ ...T, fontSize: '18px', color: 'rgba(24,22,20,.18)', alignSelf: 'center', flexShrink: 0 }}>→</div>
                </Link>
              </li>
            ))}
          </ol>
        )}

        {/* Footer link */}
        <div style={{ padding: '24px 16px', borderTop: '3px solid var(--INK)' }}>
          <Link href="/" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--RED)', textDecoration: 'none' }}>
            ← BACK TO LIVE MARKETS
          </Link>
        </div>

      </main>
    </>
  )
}
