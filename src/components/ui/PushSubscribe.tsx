'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushSubscribe({ userId }: Props) {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported' | 'loading'>('idle')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'granted') setStatus('subscribed')
    if (Notification.permission === 'denied') setStatus('denied')
  }, [])

  async function subscribe() {
    if (!('serviceWorker' in navigator)) return
    setStatus('loading')

    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      // Subscribe to push
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      // Save subscription to Supabase
      const subJson = sub.toJSON()
      const supabase = createClient()
      await supabase.from('push_subscriptions').upsert({
        visitor_id: userId,
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys!.p256dh,
        auth: subJson.keys!.auth,
      }, { onConflict: 'visitor_id,endpoint' })

      setStatus('subscribed')
    } catch (err) {
      console.error('Push subscription error:', err)
      setStatus('idle')
    }
  }

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  if (status === 'unsupported') return null
  if (status === 'subscribed') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', ...T, fontSize: '10px', color: 'var(--GRN)', fontWeight: 700 }}>
      <span>🔔</span> NOTIFICATIONS ON
    </div>
  )
  if (status === 'denied') return (
    <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.35)' }}>
      NOTIFICATIONS BLOCKED — enable in browser settings
    </div>
  )

  return (
    <button
      onClick={subscribe}
      disabled={status === 'loading'}
      style={{
        ...T, fontWeight: 700, fontSize: '10px',
        color: 'var(--INK)', background: 'transparent',
        border: '2px solid var(--INK)', padding: '8px 14px',
        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px',
        opacity: status === 'loading' ? 0.6 : 1,
      }}
    >
      <span>🔔</span>
      {status === 'loading' ? 'ENABLING...' : 'ENABLE NOTIFICATIONS'}
    </button>
  )
}
