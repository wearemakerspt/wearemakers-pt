export default function MakerDashboardLoading() {
  return (
    <div className="min-h-dvh bg-parchment animate-pulse">
      {/* Header skeleton */}
      <div className="bg-ink border-b-[3px] border-ink">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="h-3 w-64 bg-parchment/10 mb-4" />
          <div className="flex items-end gap-5">
            <div className="w-16 h-16 bg-parchment/10 flex-shrink-0" />
            <div className="space-y-2">
              <div className="h-10 w-48 bg-parchment/15" />
              <div className="h-3 w-32 bg-parchment/8" />
            </div>
          </div>
          <div className="flex gap-0 mt-5 border-[2px] border-parchment/10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 px-4 py-3 border-r-[2px] border-parchment/10 last:border-r-0">
                <div className="h-6 w-8 bg-parchment/10 mb-1" />
                <div className="h-3 w-16 bg-parchment/8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body skeleton */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2].map((col) => (
            <div key={col} className="space-y-5">
              {[1, 2, 3].map((block) => (
                <div key={block} style={{ border: '3px solid #1a1a1a' }}>
                  <div className="h-10 bg-ink/80 border-b-[3px] border-ink" />
                  <div className="bg-parchment p-5 space-y-3">
                    <div className="h-12 bg-ink/6" />
                    <div className="h-6 w-3/4 bg-ink/6" />
                    <div className="h-6 w-1/2 bg-ink/6" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
