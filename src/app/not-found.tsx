import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-parchment flex items-center justify-center p-6">
      <div className="fixed inset-1 border-4 border-ink pointer-events-none z-50" />
      <div className="max-w-md w-full border-4 border-ink shadow-hard">
        <div className="bg-ink px-5 py-4">
          <p className="font-tag text-xs tracking-widest uppercase text-stamp mb-1">
            ERROR 404
          </p>
          <h1 className="font-display font-black text-6xl uppercase tracking-tight leading-none text-parchment">
            NOT<br />FOUND
          </h1>
        </div>
        <div className="bg-parchment p-5">
          <p className="font-mono text-base text-ink/60 leading-relaxed mb-6">
            This page doesn&apos;t exist. It might be a shadow market —
            unconfirmed, unofficial, not yet on the map.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/journal"
              className="inline-block font-tag font-bold text-xs tracking-widest uppercase text-parchment bg-ink border-2 border-ink px-5 py-3 shadow-hard-sm hover:bg-stamp hover:border-stamp transition-colors"
            >
              READ THE JOURNAL →
            </Link>
            <Link
              href="/auth/login"
              className="inline-block font-tag font-bold text-xs tracking-widest uppercase text-ink bg-parchment border-2 border-ink px-5 py-3 shadow-hard-xs hover:bg-parchment-2 transition-colors"
            >
              ACCESS CIRCUIT →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
