'use client'

export default function PrintButton({ spaceName }: { spaceName: string }) {
  return (
    <div style={{ background: '#1A1A1A', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
      <span style={{ color: '#F4F1EC', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        SPACE IMPACT REPORT — {spaceName.toUpperCase()}
      </span>
      <button
        onClick={() => window.print()}
        style={{ background: '#C8291A', color: '#F4F1EC', border: 'none', padding: '10px 20px', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
      >
        ↓ DOWNLOAD PDF (PRINT)
      </button>
    </div>
  )
}
