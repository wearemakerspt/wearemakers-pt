import Link from 'next/link'

export default function ArticleNotFound() {
  return (
    <main className="min-h-dvh bg-parchment flex items-center justify-center p-6">
      <div className="max-w-md w-full border-4 border-ink shadow-hard">
        <div className="bg-ink px-5 py-4">
          <p className="font-tag text-xs tracking-widest uppercase text-stamp mb-1">
            404 — NOT FOUND
          </p>
          <h1 className="font-display font-black text-5xl uppercase tracking-tight leading-none text-parchment">
            ARTICLE<br />NOT FOUND
          </h1>
        </div>
        <div className="bg-parchment p-5">
          <p className="font-mono text-base text-ink/60 leading-relaxed mb-5">
            This article doesn&apos;t exist or hasn&apos;t been published yet.
            It might be a shadow market — check back Saturday morning.
          </p>
          <Link
            href="/journal"
            className="inline-block font-tag font-bold text-xs tracking-widest uppercase text-parchment bg-ink border-2 border-ink px-5 py-3 shadow-hard-sm hover:bg-stamp hover:border-stamp transition-colors"
          >
            ← BACK TO JOURNAL
          </Link>
        </div>
      </div>
    </main>
  )
}
