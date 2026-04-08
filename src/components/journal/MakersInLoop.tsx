'use client'

import { useState } from 'react'
import type { Profile } from '@/types/database'

interface Props {
  makers: Profile[]
  articleSlug: string
}

export default function MakersInLoop({ makers, articleSlug }: Props) {
  // Read starred brands from localStorage (mirrors the SPA logic)
  const [starred, setStarred] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const raw = localStorage.getItem('wm_starred')
      return new Set(raw ? JSON.parse(raw) : [])
    } catch {
      return new Set()
    }
  })

  function toggleStar(slug: string) {
    setStarred((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      try {
        localStorage.setItem('wm_starred', JSON.stringify([...next]))
      } catch {}
      return next
    })
  }

  return (
    <section
      aria-label="Makers in this Loop"
      className="max-w-2xl mx-auto px-5 mb-10"
    >
      {/* Section header */}
      <div className="border-4 border-ink shadow-hard">
        <div className="bg-ink px-4 py-3">
          <h2 className="font-tag font-bold text-sm tracking-[0.2em] uppercase text-parchment">
            MAKERS IN THIS LOOP —{' '}
            <span className="text-stamp">{makers.length} FEATURED</span>
          </h2>
        </div>

        {/* Maker rows */}
        <div className="divide-y-[2px] divide-ink bg-parchment">
          {makers.map((maker) => {
            const key = maker.slug ?? maker.id
            const isStarred = starred.has(key)

            return (
              <div
                key={maker.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-parchment-2 transition-colors"
              >
                {/* Avatar */}
                <div className="w-11 h-11 flex-shrink-0 bg-parchment-2 border-2 border-ink flex items-center justify-center shadow-hard-xs">
                  {maker.avatar_url ? (
                    <img
                      src={maker.avatar_url}
                      alt={maker.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display font-black text-base text-stamp">
                      {maker.display_name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={maker.slug ? `/makers/${maker.slug}` : '#'}
                      className="font-display font-black text-2xl uppercase tracking-tight leading-none text-ink hover:text-stamp transition-colors"
                    >
                      {maker.display_name}
                    </a>
                    {maker.is_verified && (
                      <span className="font-tag font-bold text-xs tracking-widest uppercase bg-ink text-parchment px-2 py-0.5 shadow-hard-xs">
                        ✦ PRO
                      </span>
                    )}
                  </div>
                  {maker.instagram_handle && (
                    <p className="font-tag text-sm text-stamp mt-0.5">
                      {maker.instagram_handle}
                    </p>
                  )}
                </div>

                {/* Star button */}
                <button
                  onClick={() => toggleStar(key)}
                  title={isStarred ? 'Remove from My Circuit' : 'Add to My Circuit'}
                  className={`w-9 h-9 flex-shrink-0 border-2 flex items-center justify-center text-lg transition-colors shadow-hard-xs ${
                    isStarred
                      ? 'bg-stamp border-stamp text-parchment'
                      : 'bg-parchment-2 border-ink text-ink hover:bg-stamp hover:border-stamp hover:text-parchment'
                  }`}
                >
                  {isStarred ? '★' : '☆'}
                </button>
              </div>
            )
          })}
        </div>

        {/* View on map CTA */}
        <button
          onClick={() => {
            // Navigate to the SPA with loop filter pre-set
            const slugs = makers
              .map((m) => m.slug ?? m.display_name)
              .join(',')
            window.location.href = `/?loop=${encodeURIComponent(slugs)}`
          }}
          className="w-full bg-ink text-parchment px-4 py-5 border-t-4 border-ink font-display font-black text-2xl uppercase tracking-tight hover:bg-stamp transition-colors stamp-noise"
        >
          VIEW THIS LOOP ON THE MAP
          <span className="block font-tag font-normal text-sm tracking-widest mt-1 opacity-55">
            Filter live feed · {makers.length} makers
          </span>
        </button>
      </div>
    </section>
  )
}
