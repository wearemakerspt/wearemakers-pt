'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to your error reporting service here (Sentry, etc.)
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#f4f1ea] flex items-center justify-center p-6">
        <div className="max-w-md w-full border-4 border-[#1a1a1a]" style={{ boxShadow: '8px 8px 0 0 #1a1a1a' }}>
          <div className="bg-[#1a1a1a] px-5 py-4">
            <p className="font-mono text-xs tracking-widest uppercase text-[#d32f2f] mb-1">
              SYSTEM ERROR
            </p>
            <h1 className="font-sans text-5xl font-black uppercase tracking-tight leading-none text-[#f4f1ea]">
              SOMETHING<br />BROKE
            </h1>
          </div>
          <div className="bg-[#f4f1ea] p-5">
            <p className="font-mono text-base text-[#1a1a1a]/60 leading-relaxed mb-5">
              {error.message ?? 'An unexpected error occurred.'}
              {error.digest && (
                <span className="block mt-2 font-mono text-xs text-[#1a1a1a]/30">
                  Ref: {error.digest}
                </span>
              )}
            </p>
            <button
              onClick={reset}
              className="font-mono font-bold text-xs tracking-widest uppercase text-[#f4f1ea] bg-[#1a1a1a] border-2 border-[#1a1a1a] px-5 py-3 hover:bg-[#d32f2f] hover:border-[#d32f2f] transition-colors"
            >
              TRY AGAIN →
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
