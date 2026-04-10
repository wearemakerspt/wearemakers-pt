'use client'
import { useState, useTransition } from 'react'
import { adminSetMarketStatus, adminAssignCurator } from '@/app/dashboard/admin/actions'

export default function AdminMarkets({ markets, spaces, curators }: { markets: any[]; spaces: any[]; curators: any[] }) {
  const [list, setList] = useState(markets)
  const [isPending, startTransition] = useTransition()
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  function handleStatus(id: string, status: string) {
    setList(prev => prev.map(m => m.id === id ? { ...m, status } : m))
    startTransition(async () => { await adminSetMarketStatus(id, status) })
  }

  const statusColor: Record<string, string> = { live: 'var(--RED)', community_live: 'var(--GRN)', scheduled: 'rgba(24,22,20,.4)', shadow: 'rgba(24,22,20,.2)', cancelled: 'var(--INK)' }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>{list.length} MARKETS (RECENT 50)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '400px', overflowY: 'auto' }}>
        {list.map((m: any) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'var(--P2)', border: '1px solid rgba(24,22,20,.1)', borderLeft: `4px solid ${statusColor[m.status] ?? 'transparent'}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>
                {(m.space as any)?.name ?? m.title}
              </div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>
                {m.event_date} · {(m.curator as any)?.display_name ?? 'NO CURATOR'}
              </div>
            </div>
            <select defaultValue={m.status} onChange={e => handleStatus(m.id, e.target.value)} disabled={isPending}
              style={{ ...T, fontSize: '9px', padding: '4px 8px', border: '1px solid var(--INK)', background: 'var(--P)', cursor: 'pointer', color: 'var(--INK)' }}>
              {['shadow','scheduled','live','community_live','cancelled'].map(s => (
                <option key={s} value={s}>{s.replace('_',' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
