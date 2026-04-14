import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/queries/journal'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'The Journal — WEAREMAKERS.PT',
  description: "Long-form guides to Lisbon's independent maker neighbourhoods.",
  alternates: { canonical: '/journal' },
}

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

export default async function JournalIndexPage() {
  const [articles, user] = await Promise.all([getAllArticles(), getCurrentUser()])
  const featured = articles[0] ?? null
  const secondary = articles.slice(1, 3)

  return (
    <>
      <SiteHeader user={user} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        <style>{`
          .jnl-featured:hover { background: #1f1f1f !important; }
          .jnl-mini:hover { background: ${PAPER} !important; }
          .jnl-row:hover { background: #d8d2c4 !important; }
          .jnl-row:hover .jnl-arr { color: ${RED} !important; }
          @media (max-width: 860px) {
            .journal-hero { grid-template-columns: 1fr !important; }
            .journal-hero > a:first-child { border-right: none !important; border-bottom: ${B} !important; padding: 40px 24px !important; }
            .section-rule { padding: 0 16px !important; }
            .jnl-row { padding: 16px 24px !important; }
          }
        `}</style>

        {/* Masthead bar */}
        <div style={{ borderBottom: B, padding: '0 40px' }}>
          <div style={{ borderTop: Bsm, borderBottom: Bsm, margin: '16px 0', padding: '8px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '13px', letterSpacing: '0.5em', textTransform: 'uppercase', color: INK }}>
              WEAREMAKERS.PT — THE JOURNAL
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: STONE }}>
              LISBON, {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
            </span>
            <span style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: STONE }}>NEIGHBOURHOOD LOOPS</span>
            <span style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: STONE }}>ISSUE {String(articles.length).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Featured hero — two column */}
        {featured && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: B, minHeight: '340px' }} className="journal-hero">
            {/* Featured large */}
            <Link href={`/journal/${featured.slug}`} className="jnl-featured" style={{ background: INK, color: WHITE, padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: B, textDecoration: 'none', transition: 'background .18s' }}>
              <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.22em', color: RED, textTransform: 'uppercase', marginBottom: '20px' }}>{featured.kicker}</div>
              <div style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(38px,4.5vw,58px)', lineHeight: 0.9, letterSpacing: '-0.015em', textTransform: 'uppercase', flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '24px' }}>
                {featured.title}
              </div>
              <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(244,241,236,0.4)', textTransform: 'uppercase' }}>
                {featured.published_at ? new Date(featured.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase() : ''} · {featured.author_name}
              </div>
            </Link>

            {/* Two mini cards */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {secondary.map((article, i) => (
                <Link key={article.id} href={`/journal/${article.slug}`} className="jnl-mini" style={{ flex: 1, padding: '28px 36px', borderBottom: i === 0 ? Bsm : 'none', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: WHITE, transition: 'background .15s' }}>
                  <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', color: RED, marginBottom: '8px', textTransform: 'uppercase' }}>{article.kicker}</div>
                  <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '17px', letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.1, flex: 1, color: INK }}>{article.title}</div>
                  <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.1em', color: STONE, marginTop: '12px', textTransform: 'uppercase' }}>
                    {article.published_at ? new Date(article.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : ''}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Section rule */}
        <div className="section-rule">
          <span className="section-rule-title">ALL ARTICLES</span>
          <span className="section-rule-link">{articles.length} ISSUES</span>
        </div>

        {/* Article list */}
        <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {articles.map((article, i) => (
            <li key={article.id} style={{ borderBottom: B }}>
              <Link href={`/journal/${article.slug}`} className="jnl-row" style={{ textDecoration: 'none', display: 'flex', gap: '16px', padding: '20px 40px', background: i % 2 === 0 ? WHITE : PAPER, transition: 'background .15s' }}>
                <span style={{ fontFamily: FH, fontWeight: 900, fontSize: '56px', color: 'rgba(12,12,12,0.07)', lineHeight: 1, flexShrink: 0, width: '56px', textAlign: 'right', alignSelf: 'flex-start' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    <span>{article.kicker}</span>
                    {article.published_at && (<><span style={{ color: 'rgba(12,12,12,0.2)' }}>·</span><span style={{ fontWeight: 400, color: STONE }}>{new Date(article.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span></>)}
                  </div>
                  <h2 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(24px,5vw,36px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.92, color: INK, marginBottom: '10px' }}>
                    {article.title}
                  </h2>
                  <p style={{ fontFamily: FB, fontWeight: 400, fontSize: '13px', color: STONE, lineHeight: 1.6, marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                    {article.dek}
                  </p>
                  <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{article.author_name}</div>
                </div>
                <div className="jnl-arr" style={{ fontFamily: FM, fontSize: '18px', color: 'rgba(12,12,12,0.18)', alignSelf: 'center', flexShrink: 0, transition: 'color .15s' }}>→</div>
              </Link>
            </li>
          ))}
        </ol>

        {articles.length === 0 && (
          <div style={{ padding: '64px 40px', textAlign: 'center' }}>
            <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(12,12,12,0.12)', marginBottom: '8px' }}>NO ARTICLES YET</div>
            <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Check back soon.</div>
          </div>
        )}

        <div style={{ padding: '24px 40px', borderTop: B }}>
          <Link href="/" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>← BACK TO LIVE MARKETS</Link>
        </div>
      </main>
    </>
  )
}
