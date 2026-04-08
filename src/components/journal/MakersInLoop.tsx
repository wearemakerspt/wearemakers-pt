'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MakerSummary {
  id: string
  display_name: string
  slug: string | null
  bio: string | null
  instagram_handle: string | null
  avatar_url: string | null
  is_verified: boolean
  digital_offer: string | null
  role: string
}

interface Props {
  makers: MakerSummary[]
  articleSlug: string
}

export default function MakersInLoop({ makers, articleSlug }: Props) {
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
        localStorage.setItem('wm_starred', JSON.stringify(Array.from(next)))
      } catch {}
      return next
    })
  }

  return (
    <div style={{ marginTop: '32px', border: '3px solid #181614', boxShadow: '6px 6px 0 0 #181614' }}>
      <div style={{ background: '#181614', color: '#f0ece0', padding: '11px 16px', fontFamily: "'Share Tech Mono',monospace", fontWeight: 700, fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid #181614' }}>
        MAKERS IN THIS LOOP
      </div>
      {makers.map((maker) => {
        const slug = maker.slug ?? maker.id
        const isStarred = starred.has(slug)
        const initials = maker.display_name.slice(0, 2).toUpperCase()
        return (
          <div key={maker.id} style={{ borderBottom: '2px solid #181614', padding: '13px 16px', display: 'flex', gap: '13px', alignItems: 'center', background: '#f0ece0' }}>
            <div style={{ width: '44px', height: '44px', flexShrink: 0, background: '#181614', border: '3px solid #181614', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '16px', color: '#c8291a' }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <Link href={`/brands/${slug}`} style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#181614', lineHeight: 1, textDecoration: 'none' }}>
                {maker.display_name}
              </Link>
              {maker.instagram_handle && (
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '13px', color: '#c8291a' }}>
                  {maker.instagram_handle}
                </div>
              )}
            </div>
            <button onClick={() => toggleStar(slug)} style={{ width: '36px', height: '36px', border: '2px solid #181614', background: isStarred ? '#c8291a' : '#f0ece0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', color: isStarred ? '#fff' : '#181614', flexShrink: 0 }}>
              {isStarred ? '★' : '☆'}
            </button>
          </div>
        )
      })}
      <Link href={`/brands?loop=${articleSlug}`} style={{ display: 'block', padding: '18px', background: '#181614', color: '#f0ece0', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: '20px', textTransform: 'uppercase', textAlign: 'center', textDecoration: 'none' }}>
        SEE THEM ALL →
      </Link>
    </div>
  )
}