'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  displayName: string
  slug: string | null
  category: string | null
  instagramHandle: string | null
  priceRange: string | null
}

export default function FieldKit({ displayName, slug, category, instagramHandle, priceRange }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const profileUrl = slug
    ? `https://wearemakers.pt/brands/${slug}`
    : `https://wearemakers.pt/brands`

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  // Load QR via Google Charts API — simple, no DOM manipulation
  useEffect(() => {
    if (!slug) return
    const size = 160
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(profileUrl)}&bgcolor=f0ece0&color=181614&margin=4`
    setQrDataUrl(url)
  }, [slug, profileUrl])

  async function generatePDF() {
    if (!slug) return
    setIsGenerating(true)
    setError(null)

    try {
      // Load jsPDF if not already loaded
      if (!(window as any).jspdf) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.getElementById('jspdf-script')
          if (existing) { resolve(); return }
          const s = document.createElement('script')
          s.id = 'jspdf-script'
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Failed to load jsPDF'))
          document.head.appendChild(s)
        })
      }

      // Fetch QR as blob and convert to data URL
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileUrl)}&bgcolor=f0ece0&color=181614&margin=4`
      const qrResp = await fetch(qrUrl)
      const qrBlob = await qrResp.blob()
      const qrImg = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(qrBlob)
      })

      // @ts-ignore
      const { jsPDF } = window.jspdf
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [50, 100] })

      const W = 50
      const H = 100
      const pad = 4

      // Background
      doc.setFillColor(240, 236, 224)
      doc.rect(0, 0, W, H, 'F')

      // Red left border stripe
      doc.setFillColor(200, 41, 26)
      doc.rect(0, 0, 2.5, H, 'F')

      // WEAREMAKERS.PT wordmark
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(24, 22, 20)
      doc.text('WEARE', pad + 2, 8)
      doc.setTextColor(200, 41, 26)
      const weareWidth = doc.getTextWidth('WEARE')
      doc.text('MAKERS.PT', pad + 2 + weareWidth, 8)
      doc.setTextColor(24, 22, 20)

      // Rule under wordmark
      doc.setDrawColor(24, 22, 20)
      doc.setLineWidth(0.25)
      doc.line(pad + 2, 10.5, W - pad, 10.5)

      // QR code
      const qrSize = 36
      const qrX = (W - qrSize) / 2
      doc.addImage(qrImg, 'PNG', qrX, 13, qrSize, qrSize)
      doc.setDrawColor(24, 22, 20)
      doc.setLineWidth(0.35)
      doc.rect(qrX, 13, qrSize, qrSize)

      // Brand name
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(24, 22, 20)
      const nameText = displayName.toUpperCase()
      const nameWidth = doc.getTextWidth(nameText)
      doc.text(nameText, Math.max(pad + 2, (W - nameWidth) / 2), 59)

      // Rule
      doc.setLineWidth(0.25)
      doc.line(pad + 2, 62, W - pad, 62)

      // Category
      if (category) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(5.5)
        doc.setTextColor(100, 100, 95)
        const cats = category.split(',').map((c: string) => c.trim()).slice(0, 2).join(' · ')
        doc.text(cats.toUpperCase(), pad + 2, 67)
      }

      // Price range
      if (priceRange) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(5.5)
        doc.setTextColor(200, 41, 26)
        doc.text(priceRange.toUpperCase(), pad + 2, 73)
      }

      // Instagram
      if (instagramHandle) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(5.5)
        doc.setTextColor(24, 22, 20)
        doc.text(`@${instagramHandle.replace('@', '')}`, pad + 2, 79)
      }

      // Bottom rule
      doc.setDrawColor(24, 22, 20)
      doc.setLineWidth(0.25)
      doc.line(pad + 2, 84, W - pad, 84)

      // Bottom text
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(4.5)
      doc.setTextColor(130, 128, 124)
      doc.text('SCAN TO SAVE THIS BRAND', pad + 2, 88)
      doc.setTextColor(200, 41, 26)
      doc.setFont('helvetica', 'bold')
      doc.text('wearemakers.pt', pad + 2, 92.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 128, 124)
      doc.setFontSize(3.8)
      doc.text("The real Lisbon isn't behind glass.", pad + 2, 97)

      doc.save(`${slug}-stall-card.pdf`)
    } catch (err: any) {
      setError('Could not generate PDF. Check your connection and try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!slug) {
    return (
      <div style={{ background: 'var(--P)', padding: '16px' }}>
        <div style={{ border: '1px dashed rgba(24,22,20,.25)', padding: '14px', background: 'var(--P2)' }}>
          <div style={{ ...T, fontWeight: 700, color: 'rgba(24,22,20,.4)', marginBottom: '6px' }}>PROFILE INCOMPLETE</div>
          <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.5)', lineHeight: 1.6 }}>
            Complete your brand profile in §0 first. The stall card needs your brand name to generate the QR code URL.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--P)', padding: '16px' }}>

      {/* Description */}
      <div style={{ borderLeft: '3px solid var(--RED)', paddingLeft: '10px', marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.6)', lineHeight: 1.6 }}>
          Print this card and place it at your stall. Visitors scan the QR code, land on your brand profile, and can save you to their Circuit.
        </div>
      </div>

      {/* Card preview + info */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap' }}>

        {/* Visual preview */}
        <div style={{
          width: '100px', minHeight: '200px', background: '#f0ece0',
          border: '2px solid var(--INK)', boxShadow: 'var(--SHD-SM)',
          display: 'flex', flexDirection: 'column', position: 'relative', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--RED)' }} />
          <div style={{ padding: '6px 6px 6px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '7px', textTransform: 'uppercase' }}>
              <span style={{ color: 'var(--INK)' }}>WEARE</span>
              <span style={{ color: 'var(--RED)' }}>MAKERS.PT</span>
            </div>
            {/* QR preview */}
            <div style={{ width: '72px', height: '72px', border: '1px solid var(--INK)', overflow: 'hidden', margin: '0 auto', flexShrink: 0 }}>
              {qrDataUrl
                ? <img src={qrDataUrl} alt="QR" style={{ width: '100%', height: '100%' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...T, fontSize: '7px', color: 'rgba(24,22,20,.3)' }}>QR</div>
              }
            </div>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, borderTop: '1px solid rgba(24,22,20,.2)', paddingTop: '4px' }}>
              {displayName}
            </div>
            {category && <div style={{ fontFamily: 'var(--TAG)', fontSize: '6px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.5)' }}>{category.split(',')[0].trim()}</div>}
            {priceRange && <div style={{ fontFamily: 'var(--TAG)', fontSize: '6px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--RED)', fontWeight: 700 }}>{priceRange}</div>}
            {instagramHandle && <div style={{ fontFamily: 'var(--MONO)', fontSize: '6px', color: 'rgba(24,22,20,.5)' }}>@{instagramHandle.replace('@', '')}</div>}
            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(24,22,20,.15)', paddingTop: '4px' }}>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(24,22,20,.35)' }}>SCAN TO SAVE</div>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '5px', color: 'var(--RED)', fontWeight: 700 }}>wearemakers.pt</div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ ...T, fontWeight: 700, color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>CARD DETAILS</div>
          {[
            { label: 'Size', value: '50mm × 100mm' },
            { label: 'QR links to', value: `wearemakers.pt/brands/${slug}` },
            { label: 'Brand', value: displayName },
            ...(category ? [{ label: 'Category', value: category.split(',').map((c: string) => c.trim()).join(', ') }] : []),
            ...(priceRange ? [{ label: 'Price', value: priceRange }] : []),
            ...(instagramHandle ? [{ label: 'Instagram', value: `@${instagramHandle.replace('@', '')}` }] : []),
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px dashed rgba(24,22,20,.1)' }}>
              <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.35)', width: '70px', flexShrink: 0 }}>{row.label}</div>
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'var(--INK)', lineHeight: 1.4, wordBreak: 'break-all' }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Download button */}
      <button onClick={generatePDF} disabled={isGenerating}
        style={{
          ...T, fontWeight: 700, fontSize: '12px', letterSpacing: '0.16em',
          color: 'var(--P)', background: 'var(--INK)', border: '3px solid var(--INK)',
          padding: '14px 24px', cursor: isGenerating ? 'not-allowed' : 'pointer',
          boxShadow: 'var(--SHD)', opacity: isGenerating ? 0.5 : 1,
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', justifyContent: 'center',
        }}>
        <span style={{ fontSize: '16px' }}>⬇</span>
        <span>{isGenerating ? 'GENERATING PDF...' : 'DOWNLOAD STALL CARD PDF'}</span>
      </button>

      {error && (
        <div style={{ marginTop: '10px', borderLeft: '3px solid var(--RED)', paddingLeft: '10px', ...T, color: 'var(--RED)', fontWeight: 700 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '10px', ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', lineHeight: 1.8 }}>
        PRINT ON A4 · CUT TO SIZE · PLACE AT STALL
      </div>
    </div>
  )
}
