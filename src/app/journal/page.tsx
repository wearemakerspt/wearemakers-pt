import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/queries/journal'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

// Revalidate every 5 minutes — new articles appear quickly without a full deploy
export const revalidate = 300

export const metadata: Metadata = {
  title: 'The Journal — Neighborhood Loops',
  description:
    'Long-form guides to Lisbon\'s underground maker neighbourhoods. Walk Arroios, LX Factory, Mouraria — find the makers, the gems, the right coffee.',
  openGraph: {
    title: 'WEAREMAKERS.PT — The Journal',
    description:
      'Neighborhood Loops: walking guides to Lisbon\'s independent maker economy.',
    type: 'website',
  },
  alternates: {
    canonical: '/journal',
  },
}

export default async function JournalIndexPage() {
  const [articles, user] = await Promise.all([
    getAllArticles(),
    getCurrentUser(),
  ])

  return (
    <>
      <SiteHeader user={user} />

      <main>
        {/* Journal masthead */}
        <div className="border-b-4 border-ink px-4 py-4 bg-parchment">
          <div className="font-display font-black text-sm tracking-[0.5em] uppercase text-center text-ink py-2 border-t-2 border-b-2 border-ink mb-3">
            WEAREMAKERS.PT — THE JOURNAL
          </div>
          <div className="flex justify-between font-tag text-xs tracking-widest uppercase text-ink/38">
            <span>
              LISBON,{' '}
              {new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }).toUpperCase()}
            </span>
            <span>NEIGHBORHOOD LOOPS</span>
            <span>ISSUE 07</span>
          </div>
        </div>

        {/* Article list */}
        {articles.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="font-tag text-sm tracking-widest uppercase text-ink/30">
              No articles published yet.
            </p>
          </div>
        ) : (
          <ol className="divide-y-[3px] divide-ink">
            {articles.map((article, i) => (
              <li key={article.id}>
                <Link
                  href={`/journal/${article.slug}`}
                  className="flex gap-4 px-4 py-5 hover:bg-parchment-2 transition-colors group"
                >
                  {/* Issue number */}
                  <span
                    className="font-display font-black text-6xl text-ink/7 leading-none flex-shrink-0 w-14 text-right"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-tag font-bold text-xs tracking-[0.22em] uppercase text-stamp mb-1.5">
                      {article.kicker} · {article.published_at
                        ? new Date(article.published_at).toLocaleDateString(
                            'en-GB',
                            { day: '2-digit', month: 'short', year: 'numeric' }
                          ).toUpperCase()
                        : 'DRAFT'}
                    </p>

                    <h2 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight leading-[0.92] text-ink mb-2 group-hover:text-stamp transition-colors">
                      {article.title}
                    </h2>

                    <p className="font-mono text-base text-ink/55 leading-relaxed line-clamp-2">
                      {article.dek}
                    </p>

                    <p className="font-tag text-xs tracking-wide uppercase text-ink/30 mt-2">
                      {article.author_name}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span className="font-tag text-ink/20 self-center flex-shrink-0 text-xl group-hover:text-stamp transition-colors">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  )
}
