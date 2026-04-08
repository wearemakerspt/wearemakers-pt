'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { pinFeaturedMaker, unpinFeaturedMaker } from '@/app/dashboard/curator/actions'
import type { FeaturedSlot } from '@/lib/queries/curator'
import type { Profile } from '@/types/database'

interface Props {
  slots: FeaturedSlot[]
  searchableMakers: Pick<Profile, 'id' | 'display_name' | 'slug' | 'instagram_handle' | 'is_verified' | 'bio'>[]
}

export default function SpotlightPins({ slots: initialSlots, searchableMakers }: Props) {
  const [slots, setSlots] = useState(initialSlots)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const pinnedCount = slots.filter((s) => s.pinned !== null).length

  const filteredMakers = query.length > 1
    ? searchableMakers.filter(
        (m) =>
          m.display_name.toLowerCase().includes(query.toLowerCase()) ||
          (m.instagram_handle ?? '').toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : []

  // Close results on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.closest('[data-search-wrap]')?.contains(e.target as Node)) {
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handlePin(makerId: string) {
    setQuery('')
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('maker_id', makerId)
      const result = await pinFeaturedMaker(fd)
      if (result?.error) setError(result.error)
    })
  }

  function handleUnpin(featuredId: string) {
    // Optimistic removal
    setSlots((prev) =>
      prev.map((s) => (s.pinned?.id === featuredId ? { ...s, pinned: null } : s))
    )
    setError(null)
    startTransition(async () => {
      const result = await unpinFeaturedMaker(featuredId)
      if (result?.error) setError(result.error)
    })
  }

  function handlePublish() {
    setPublished(true)
    setTimeout(() => setPublished(false), 3000)
  }

  return (
    <div style={{ border: '3px solid #1a1a1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between bg-ink px-4 py-3 border-b-[3px] border-ink">
        <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
          §2 — HOMEPAGE SPOTLIGHT
        </span>
        <span
          className={`font-tag text-xs font-bold tracking-widest uppercase ${
            pinnedCount === 3 ? 'text-stamp' : 'text-parchment/30'
          }`}
        >
          {pinnedCount}/3
        </span>
      </div>

      <div className="bg-parchment p-5">
        {/* Instruction */}
        <div className="mb-4 border-l-[3px] border-stamp pl-3">
          <p className="font-tag text-xs tracking-wide uppercase text-ink/40 leading-relaxed">
            Pin up to 3 makers as <strong className="text-ink">★ CURATOR&apos;S CHOICE</strong>.
            They appear on the public homepage and in the directory.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4" data-search-wrap>
          <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
            Search Makers
          </label>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name or @handle..."
            disabled={pinnedCount >= 3}
            className="w-full bg-parchment border-b-[2px] border-dashed border-ink px-0 py-2 font-mono text-base text-ink placeholder:text-ink/25 focus:outline-none focus:border-solid transition-all disabled:opacity-40"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />

          {/* Search results dropdown */}
          {filteredMakers.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 z-30 bg-parchment divide-y-[2px] divide-ink/10"
              style={{
                border: '2px solid #1a1a1a',
                boxShadow: '4px 4px 0 0 #1a1a1a',
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              {filteredMakers.map((maker) => {
                const alreadyPinned = slots.some((s) => s.pinned?.maker_id === maker.id)
                return (
                  <button
                    key={maker.id}
                    type="button"
                    onClick={() => !alreadyPinned && handlePin(maker.id)}
                    disabled={alreadyPinned || isPending}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-parchment-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-8 h-8 bg-ink flex-shrink-0 flex items-center justify-center">
                      <span className="font-display font-black text-sm text-stamp leading-none">
                        {maker.display_name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-black text-lg uppercase tracking-tight leading-none text-ink">
                        {maker.display_name}
                        {maker.is_verified && (
                          <span className="ml-2 font-tag font-normal text-xs text-ink/40">✦ PRO</span>
                        )}
                      </p>
                      {maker.instagram_handle && (
                        <p className="font-tag text-xs text-ink/35">{maker.instagram_handle}</p>
                      )}
                    </div>
                    <span className="font-tag text-xs tracking-widest uppercase text-ink/30 flex-shrink-0">
                      {alreadyPinned ? '✓ PINNED' : '★ PIN'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Pin slots */}
        <div className="space-y-2 mb-4">
          {slots.map((slot) => (
            <div
              key={slot.position}
              className={`flex items-center gap-3 border-[2px] p-3 ${
                slot.pinned ? 'border-ink bg-parchment' : 'border-dashed border-ink/25 bg-parchment-2'
              }`}
              style={slot.pinned ? { boxShadow: '3px 3px 0 0 #1a1a1a' } : undefined}
            >
              {/* Slot number */}
              <span
                className={`font-display font-black text-2xl leading-none flex-shrink-0 ${
                  slot.pinned ? 'text-stamp' : 'text-ink/15'
                }`}
              >
                {slot.position}
              </span>

              {slot.pinned ? (
                <>
                  {/* Filled slot */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-black text-xl uppercase tracking-tight leading-none text-ink">
                      {slot.pinned.maker.display_name}
                    </p>
                    <p className="font-tag text-xs tracking-wide uppercase text-ink/35 mt-0.5">
                      {slot.pinned.maker.instagram_handle ?? slot.pinned.maker.bio?.slice(0, 40) ?? ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnpin(slot.pinned!.id)}
                    disabled={isPending}
                    className="font-tag font-bold text-xs tracking-widest uppercase text-ink/40 border border-dashed border-ink/30 px-3 py-2 hover:text-stamp hover:border-stamp transition-colors disabled:opacity-40"
                  >
                    ✕ UNPIN
                  </button>
                </>
              ) : (
                <p className="font-tag text-xs tracking-widest uppercase text-ink/25 italic flex-1">
                  Empty — search above to fill
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-3 border-l-[3px] border-stamp pl-3">
            <p className="font-tag text-xs tracking-wide uppercase text-stamp font-bold">
              ✗ {error}
            </p>
          </div>
        )}

        {/* Publish button — only when all 3 filled */}
        {pinnedCount === 3 && (
          <button
            onClick={handlePublish}
            className="w-full font-tag font-bold text-xs tracking-widest uppercase text-parchment bg-stamp border-[3px] border-stamp py-4 stamp-noise hover:bg-ink hover:border-ink transition-colors"
            style={{ boxShadow: '4px 4px 0 0 #1a1a1a' }}
          >
            {published ? '✓ PUBLISHED TO HOMEPAGE' : '★ PUBLISH CURATOR\'S CHOICE →'}
          </button>
        )}
      </div>
    </div>
  )
}
