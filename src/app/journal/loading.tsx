export default function JournalLoading() {
  return (
    <div className="animate-pulse">
      {/* Masthead skeleton */}
      <div className="border-b-4 border-ink px-4 py-4 bg-parchment">
        <div className="h-9 bg-ink/8 mb-3" />
        <div className="flex justify-between">
          <div className="h-3 w-32 bg-ink/8" />
          <div className="h-3 w-24 bg-ink/8" />
          <div className="h-3 w-16 bg-ink/8" />
        </div>
      </div>

      {/* Article skeleton rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-5 border-b-[3px] border-ink">
          <div className="w-14 h-14 bg-ink/6 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-ink/8" />
            <div className="h-8 w-3/4 bg-ink/10" />
            <div className="h-4 w-full bg-ink/6" />
            <div className="h-4 w-4/5 bg-ink/6" />
          </div>
        </div>
      ))}
    </div>
  )
}
