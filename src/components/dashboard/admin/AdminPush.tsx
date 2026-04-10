'use client'
import { useState, useTransition } from 'react'
import { sendAdminPush } from '@/app/dashboard/admin/actions'

export default function AdminPush() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/')
  const [sent, setSent] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = { width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '8px 12px', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '10px' }

  function handleSend() {
    if (!title || !body) return
    startTransition(async () => {
      const r = await sendAdminPush(title, body, url)
      setSent(r?.sent ?? 0)
      setTitle(''); setBody(''); setUrl('/')
    })
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      <div style={{ borderLeft: '3px solid var(--RED)', paddingLeft: '10px', marginBottom: '14px' }}>
        <div style={{ fontFamily: 'var(--MONO)', fontSize: '14px', color: 'rgba(24,22,20,.6)', lineHeight: 1.6 }}>
          Send a push notification to all subscribers. Use sparingly.
        </div>
      </div>
      {sent !== null && (
        <div style={{ ...T, fontWeight: 700, color: 'var(--GRN)', marginBottom: '12px', fontSize: '10px' }}>
          ✓ SENT TO {sent} SUBSCRIBERS
        </div>
      )}
      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>TITLE</div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. LX Market is open today" style={inputStyle} />
      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>MESSAGE</div>
      <input value={body} onChange={e => setBody(e.target.value)} placeholder="Short message to subscribers" style={inputStyle} />
      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>LINK URL</div>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="/" style={inputStyle} />
      <button onClick={handleSend} disabled={isPending || !title || !body}
        style={{ ...T, fontWeight: 700, fontSize: '11px', color: 'var(--P)', background: 'var(--RED)', border: '3px solid var(--RED)', padding: '12px 20px', cursor: 'pointer', boxShadow: 'var(--SHD-SM)', opacity: (isPending || !title || !body) ? 0.5 : 1 }}>
        {isPending ? 'SENDING...' : '🔔 SEND TO ALL SUBSCRIBERS'}
      </button>
    </div>
  )
}
