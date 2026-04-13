'use client'
import { useState } from 'react'

interface Lead {
  email: string
  opted_in_at: string
}

interface Props {
  leads: Lead[]
  brandName: string
}

export default function MakerLeads({ leads, brandName }: Props) {
  const [downloading, setDownloading] = useState(false)
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch('/api/leads')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wearemakers-leads-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silent fail
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      {/* Header strip */}
      <div style={{ padding: '12px 14px', borderBottom: '2px solid rgba(24,22,20,.1)', background: 'var(--P2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1 }}>
            {leads.length}
          </div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>
            EMAIL LEADS COLLECTED
          </div>
        </div>

        {leads.length > 0 && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '10px 16px', cursor: 'pointer', opacity: downloading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {downloading ? 'DOWNLOADING...' : '↓ DOWNLOAD CSV'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {leads.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: 'rgba(24,22,20,.1)', marginBottom: '8px' }}>
            NO LEADS YET
          </div>
          <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', lineHeight: 2 }}>
            When visitors save your brand, they'll be invited to leave their email.<br />
            Leads appear here as they come in.
          </div>
        </div>
      )}

      {/* Leads list */}
      {leads.length > 0 && (
        <div>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', padding: '8px 14px', background: 'var(--INK)', borderBottom: '2px solid var(--INK)' }}>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.4)' }}>EMAIL</div>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.4)', textAlign: 'right' as const }}>DATE</div>
          </div>

          {leads.map((lead, i) => (
            <div key={lead.email} style={{
              display: 'grid', gridTemplateColumns: '1fr 120px',
              padding: '10px 14px',
              borderBottom: '1px solid rgba(24,22,20,.08)',
              background: i % 2 === 0 ? 'var(--P)' : 'var(--P2)',
            }}>
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                {lead.email}
              </div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', textAlign: 'right' as const }}>
                {new Date(lead.opted_in_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).toUpperCase()}
              </div>
            </div>
          ))}

          {/* Footer note */}
          <div style={{ padding: '10px 14px', borderTop: '2px solid rgba(24,22,20,.06)' }}>
            <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.3)' }}>
              THESE LEADS BELONG TO YOU · GDPR COMPLIANT OPT-IN · EXPORT ANYTIME
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
