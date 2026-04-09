'use client'

import { useState } from 'react'

interface LiveMaker {
  id: string
  display_name: string
  slug: string | null
  instagram_handle?: string | null
}

interface LiveMarket {
  id: string
  title: string
  space: { name: string; parish: string | null }
  event_date: string
}

interface Props {
  liveMakers: LiveMaker[]
  liveMarkets: LiveMarket[]
}

export default function PromoKit({ liveMakers, liveMarkets }: Props) {
  const [copied, setCopied] = useState(false)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  // Generate the Instagram Stories caption
  function generateCaption(): string {
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()
    const marketNames = liveMarkets.map(m => m.space.name.toUpperCase()).join(' + ')

    const makerHandles = liveMakers
      .map(m => {
        if (m.instagram_handle) return `@${m.instagram_handle.replace('@', '')}`
        return `@${m.display_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      })
      .join(' ')

    const lines = [
      `🔴 LIVE TODAY — ${marketNames}`,
      `📅 ${today}`,
      ``,
      `Criadores em directo:`,
      makerHandles,
      ``,
      `Descobre todos em wearemakers.pt`,
      ``,
      `#wearemakerspt #mercadolisboa #lisbon #artesanato #makers`,
    ]

    return lines.join('\n')
  }

  function handleCopy() {
    const caption = generateCaption()
    navigator.clipboard.writeText(caption).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  if (liveMakers.length === 0) {
    return (
      <div style={{ background: 'var(--P)', padding: '16px' }}>
        <div style={{ border: '1px dashed rgba(24,22,20,.25)', padding: '14px', background: 'var(--P2)' }}>
          <div style={{ ...T, fontWeight: 700, color: 'rgba(24,22,20,.4)', marginBottom: '6px' }}>
            NO MAKERS CHECKED IN YET
          </div>
          <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.45)', lineHeight: 1.6 }}>
            Open a market and wait for makers to check in. The Promo Kit will generate an Instagram Stories caption with all their handles automatically.
          </div>
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[
              '→ Open a market in §1 above',
              '→ Makers tap START TRANSMISSION when they arrive',
              '→ Their handles appear here automatically',
              '→ One tap copies everything — paste directly into Stories',
            ].map((tip, i) => (
              <div key={i} style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>{tip}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const caption = generateCaption()

  return (
    <div style={{ background: 'var(--P)', padding: '16px' }}>

      {/* Description */}
      <div style={{ borderLeft: '3px solid var(--RED)', paddingLeft: '10px', marginBottom: '14px' }}>
        <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.6)', lineHeight: 1.6 }}>
          {liveMakers.length} maker{liveMakers.length !== 1 ? 's' : ''} currently live. One tap copies all their handles as a Stories caption — paste directly into Instagram.
        </div>
      </div>

      {/* Live makers list */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ ...T, fontWeight: 700, color: 'rgba(24,22,20,.4)', marginBottom: '8px' }}>
          LIVE NOW — {liveMakers.length} BRAND{liveMakers.length !== 1 ? 'S' : ''}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {liveMakers.map(m => (
            <div key={m.id} style={{
              ...T, fontSize: '10px', fontWeight: 700,
              padding: '5px 10px', background: 'var(--INK)', color: 'var(--P)',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <span style={{ color: 'var(--RED)', fontSize: '7px' }}>●</span>
              {m.display_name.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Caption preview */}
      <div style={{ marginBottom: '14px', border: '2px dashed rgba(24,22,20,.2)', background: 'var(--P2)', padding: '12px' }}>
        <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.35)', marginBottom: '8px' }}>
          STORIES CAPTION PREVIEW
        </div>
        <pre style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'var(--INK)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {caption}
        </pre>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        style={{
          ...T, fontWeight: 700, fontSize: '12px', letterSpacing: '0.16em',
          color: copied ? 'var(--GRN)' : 'var(--P)',
          background: copied ? 'rgba(26,92,48,.1)' : 'var(--INK)',
          border: `3px solid ${copied ? 'var(--GRN)' : 'var(--INK)'}`,
          padding: '14px 24px', cursor: 'pointer',
          boxShadow: copied ? 'none' : 'var(--SHD)',
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', justifyContent: 'center',
          transition: 'all .15s',
        }}
      >
        <span style={{ fontSize: '16px' }}>{copied ? '✓' : '⎘'}</span>
        <span>{copied ? 'COPIED TO CLIPBOARD — PASTE INTO STORIES' : 'COPY INSTAGRAM STORIES CAPTION'}</span>
      </button>

      <div style={{ marginTop: '10px', ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', lineHeight: 1.8 }}>
        UPDATES AUTOMATICALLY AS MAKERS CHECK IN AND OUT
      </div>
    </div>
  )
}
