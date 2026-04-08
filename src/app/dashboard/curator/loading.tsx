export default function CuratorDashboardLoading() {
  return (
    <div className="min-h-dvh bg-parchment animate-pulse">
      {/* Black header skeleton */}
      <div className="bg-ink border-b-[3px] border-ink">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="h-3 w-80 bg-parchment/10 mb-4" />
          <div className="flex items-end justify-between mb-5">
            <div className="space-y-2">
              <div className="h-12 w-56 bg-parchment/15" />
              <div className="h-3 w-40 bg-parchment/8" />
            </div>
            <div className="h-12 w-36 bg-stamp/30" />
          </div>
          <div className="flex gap-0 border-[2px] border-parchment/10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 px-4 py-3 border-r-[2px] border-parchment/10 last:border-r-0">
                <div className="h-6 w-10 bg-parchment/10 mb-1" />
                <div className="h-3 w-16 bg-parchment/8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          {/* Left — ledger */}
          <div style={{ border: '3px solid #1a1a1a' }}>
            <div className="h-12 bg-ink/80 border-b-[3px] border-ink" />
            <div className="divide-y-[2px] divide-ink">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 px-3 py-4">
                  <div className="h-5 w-6 bg-ink/8" />
                  <div className="h-5 w-20 bg-ink/8" />
                  <div className="h-5 w-32 bg-ink/10" />
                  <div className="h-5 w-16 bg-ink/6" />
                  <div className="h-5 w-20 bg-ink/8" />
                  <div className="h-5 w-8 bg-ink/6" />
                  <div className="h-5 w-28 bg-ink/8" />
                </div>
              ))}
            </div>
          </div>

          {/* Right — sidebar */}
          <div className="space-y-5">
            {[1, 2].map((block) => (
              <div key={block} style={{ border: '3px solid #1a1a1a' }}>
                <div className="h-12 bg-ink/80 border-b-[3px] border-ink" />
                <div className="bg-parchment p-5 space-y-3">
                  <div className="h-4 w-full bg-ink/8" />
                  <div className="h-14 bg-ink/6" />
                  <div className="h-14 bg-ink/6" />
                  <div className="h-14 bg-ink/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
