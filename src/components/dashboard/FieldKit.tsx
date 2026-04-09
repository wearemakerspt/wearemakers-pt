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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrReady, setQrReady] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const profileUrl = slug
    ? `https://wearemakers.pt/brands/${slug}`
    : `https://wearemakers.pt/brands`

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  // Load QR code library and render to canvas preview
  useEffect(() => {
    if (!slug) return

    // Only load once
    if (document.getElementById('qrcode-script')) {
      setQrReady(true)
      renderQRPreview()
      return
    }

    const script = document.createElement('script')
    script.id = 'qrcode-script'
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    script.onload = () => {
      setQrReady(true)
      renderQRPreview()
    }
    document.head.appendChild(script)
    // No cleanup — keep script loaded for PDF generation
  }, [slug, profileUrl])

  function renderQRPreview() {
    const container = document.getElementById('qr-preview-container')
    if (container) {
      container.innerHTML = ''
      // @ts-ignore
      new QRCode(container, {
        text: profileUrl,
        width: 160,
        height: 160,
        colorDark: '#181614',
        colorLight: '#f0ece0',
        correctLevel: 2,
      })
    }
  }

  async function generatePDF() {
    if (!qrReady || !slug) return
    setIsGenerating(true)
    setError(null)

    try {
      // Load jsPDF (only once)
      if (!document.getElementById('jspdf-script')) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.id = 'jspdf-script'
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Failed to load jsPDF'))
          document.head.appendChild(s)
        })
      }

      // Generate QR as data URL via canvas
      const qrCanvas = document.createElement('canvas')
      qrCanvas.width = 400
      qrCanvas.height = 400
      const tempDiv = document.createElement('div')
      document.body.appendChild(tempDiv)

      await new Promise<void>((resolve) => {
        // @ts-ignore
        const qr = new QRCode(tempDiv, {
          text: profileUrl,
          width: 400,
          height: 400,
          colorDark: '#181614',
          colorLight: '#f0ece0',
          correctLevel: 2,
        })
        setTimeout(() => {
          const img = tempDiv.querySelector('img') as HTMLImageElement
          if (img) {
            const ctx = qrCanvas.getContext('2d')!
            const i = new Image()
            i.onload = () => { ctx.drawImage(i, 0, 0); resolve() }
            i.src = img.src
          } else resolve()
        }, 300)
      })

      document.body.removeChild(tempDiv)
      const qrDataUrl = qrCanvas.toDataURL('image/png')

      // @ts-ignore
      const { jsPDF } = window.jspdf
      // 50mm wide, 100mm tall — portrait business card format
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [50, 100],
      })

      const W = 50
      const H = 100
      const pad = 4

      // Background
      doc.setFillColor(240, 236, 224)
      doc.rect(0, 0, W, H, 'F')

      // Red left border stripe
      doc.setFillColor(200, 41, 26)
      doc.rect(0, 0, 2, H, 'F')

      // WEAREMAKERS.PT wordmark at top
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6)
      doc.setTextColor(24, 22, 20)
      doc.text('WEARE', pad + 2, 8)
      doc.setTextColor(200, 41, 26)
      doc.text('MAKERS.PT', pad + 2 + doc.getTextWidth('WEARE'), 8)
      doc.setTextColor(24, 22, 20)

      // Thin rule under wordmark
      doc.setDrawColor(24, 22, 20)
      doc.setLineWidth(0.3)
      doc.line(pad + 2, 10, W - pad, 10)

      // QR code — centred, large
      const qrSize = 38
      const qrX = (W - qrSize) / 2
      doc.addImage(qrDataUrl, 'PNG', qrX, 13, qrSize, qrSize)

      // Border around QR
      doc.setDrawColor(24, 22, 20)
      doc.setLineWidth(0.4)
      doc.rect(qrX, 13, qrSize, qrSize)

      // Brand name — big
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(24, 22, 20)
      const nameText = displayName.toUpperCase()
      const nameWidth = doc.getTextWidth(nameText)
      const nameX = Math.max(pad + 2, (W - nameWidth) / 2)
      doc.text(nameText, nameX, 60)

      // Rule
      doc.setLineWidth(0.3)
      doc.line(pad + 2, 63, W - pad, 63)

      // Category
      if (category) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(5.5)
        doc.setTextColor(100, 100, 95)
        const cats = category.split(',').map((c: string) => c.trim()).join(' · ')
        doc.text(cats.toUpperCase(), pad + 2, 68)
      }

      // Price range
      if (priceRange) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(5.5)
        doc.setTextColor(200, 41, 26)
        doc.text(priceRange.toUpperCase(), pad + 2, 74)
      }

      // Instagram
      if (instagramHandle) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(5.5)
        doc.setTextColor(24, 22, 20)
        doc.text(`@${instagramHandle.replace('@', '')}`, pad + 2, 80)
      }

      // Bottom rule
      doc.setDrawColor(24, 22, 20)
      doc.setLineWidth(0.3)
      doc.line(pad + 2, 85, W - pad, 85)

      // URL at bottom
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(4.5)
      doc.setTextColor(130, 128, 124)
      doc.text('SCAN TO SAVE THIS BRAND', pad + 2, 89)
      doc.setTextColor(200, 41, 26)
      doc.text('wearemakers.pt', pad + 2, 93)

      // Tagline
      doc.setTextColor(130, 128, 124)
      doc.setFontSize(4)
      doc.text('The real Lisbon isn\'t behind glass.', pad + 2, 97)

      // Save
      doc.save(`${slug}-wearemakers-stall-card.pdf`)

    } catch (err: any) {
      setError('Could not generate PDF. Try again.')
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

      {/* Card preview */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap' }}>

        {/* Preview card */}
        <div style={{
          width: '100px', minHeight: '200px', background: '#f0ece0',
          border: '2px solid var(--INK)', boxShadow: 'var(--SHD-SM)',
          display: 'flex', flexDirection: 'column', position: 'relative',
          flexShrink: 0,
        }}>
          {/* Red left border */}
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--RED)' }} />

          <div style={{ padding: '6px 6px 6px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Wordmark */}
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '7px', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              <span style={{ color: 'var(--INK)' }}>WEARE</span>
              <span style={{ color: 'var(--RED)' }}>MAKERS.PT</span>
            </div>

            {/* QR preview */}
            <div id="qr-preview-container" style={{
              width: '72px', height: '72px', border: '1px solid var(--INK)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f0ece0', margin: '0 auto 6px',
              overflow: 'hidden',
            }}>
              {!qrReady && (
                <div style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.3)', textAlign: 'center' }}>QR</div>
              )}
            </div>

            {/* Brand name */}
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px', borderTop: '1px solid rgba(24,22,20,.2)', paddingTop: '4px' }}>
              {displayName}
            </div>

            {category && (
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '6px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(24,22,20,.5)', marginBottom: '2px' }}>
                {category.split(',')[0].trim()}
              </div>
            )}
            {priceRange && (
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '6px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--RED)', fontWeight: 700 }}>
                {priceRange}
              </div>
            )}
            {instagramHandle && (
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '6px', color: 'rgba(24,22,20,.5)', marginTop: '2px' }}>
                @{instagramHandle.replace('@', '')}
              </div>
            )}

            <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(24,22,20,.15)', paddingTop: '4px' }}>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(24,22,20,.35)' }}>
                SCAN TO SAVE
              </div>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '5px', color: 'var(--RED)', fontWeight: 700 }}>
                wearemakers.pt
              </div>
            </div>
          </div>
        </div>

        {/* Card info */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ ...T, fontWeight: 700, color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>CARD DETAILS</div>
          {[
            { label: 'Size', value: '50mm × 100mm (print-ready)' },
            { label: 'QR links to', value: `wearemakers.pt/brands/${slug}` },
            { label: 'Brand', value: displayName },
            ...(category ? [{ label: 'Category', value: category.split(',')[0].trim() }] : []),
            ...(priceRange ? [{ label: 'Price', value: priceRange }] : []),
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px dashed rgba(24,22,20,.1)' }}>
              <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.35)', width: '70px', flexShrink: 0 }}>{row.label}</div>
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'var(--INK)', lineHeight: 1.4 }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={generatePDF}
        disabled={isGenerating || !qrReady}
        style={{
          ...T, fontWeight: 700, fontSize: '12px', letterSpacing: '0.16em',
          color: 'var(--P)', background: 'var(--INK)',
          border: '3px solid var(--INK)', padding: '14px 24px',
          cursor: isGenerating || !qrReady ? 'not-allowed' : 'pointer',
          boxShadow: 'var(--SHD)', opacity: isGenerating || !qrReady ? 0.5 : 1,
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '16px' }}>⬇</span>
        <span>{isGenerating ? 'GENERATING PDF...' : !qrReady ? 'LOADING QR...' : 'DOWNLOAD STALL CARD PDF'}</span>
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
