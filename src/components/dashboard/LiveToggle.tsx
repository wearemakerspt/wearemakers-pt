'use client'

import { useState, useTransition } from 'react'
import { setLiveStatus } from '@/app/dashboard/maker/actions'

interface Props {
  initialIsActive: boolean
  displayName: string
}

export default function LiveToggle({ initialIsActive, displayName }: Props) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    const next = !isActive
    setIsActive(next)
    setError(null)
    startTransition(async () => {
      const result = await setLiveStatus(next)
      if (result?.error) { setIsActive(!next); setError(result.error) }
    })
  }

  const S = {
    body: { background: 'var(--P)', padding: '16px' },
    statusRow: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed rgba(24,22,20,.3)' },
    dot: { width: '14px', height: '14px', flexShrink: 0, borderRadius: '50%', background: isActive ? 'var(--RED)' : 'rgba(24,22,20,.2)', transition: 'background .3s' },
    statusLabel: { fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase' as const, letterSpacing: '-0.01em', lineHeight: 1, color: isActive ? 'var(--RED)' : 'rgba(24,22,20,.3)', transition: 'color .3s' },
    statusSub: { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'rgba(24,22,20,.35)', marginTop: '3px' },
    btn: {
      width: '100%', padding: '18px 16px', border: '3px solid', cursor: isPending ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(18px,5vw,24px)', letterSpacing: '0.04em',
      textTransform: 'uppercase' as const, textAlign: 'left' as const, lineHeight: 1,
      background: isActive ? 'var(--RED)' : 'var(--P)',
      borderColor: isActive ? 'var(--RED)' : 'var(--INK)',
      color: isActive ? 'var(--P)' : 'var(--INK)',
      boxShadow: isPending ? 'var(--SHD-ACT)' : 'var(--SHD)',
      transform: isPending ? 'translate(6px,6px)' : 'none',
      opacity: isPending ? 0.7 : 1,
      transition: 'background .07s, color .07s, box-shadow .06s',
    },
    btnSub: { display: 'block', fontFamily: 'var(--TAG)', fontWeight: 400, fontSize: '11px', letterSpacing: '0.14em', marginTop: '6px', opacity: 0.55 },
    gpsLog: { marginTop: '14px', border: '1px dashed rgba(24,22,20,.3)', background: 'var(--P2)', padding: '10px 12px', fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.6)', lineHeight: 1.8 },
    logOk: { color: 'var(--GRN)', fontWeight: 700 },
    error: { marginTop: '10px', borderLeft: '3px solid var(--RED)', paddingLeft: '10px', fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--RED)', fontWeight: 700 },
  }

  return (
    <div style={S.body}>
      <div style={S.statusRow}>
        <div style={S.dot} />
        <div>
          <div style={S.statusLabel}>{isActive ? '● BROADCASTING LIVE' : '○ OFFLINE'}</div>
          <div style={S.statusSub}>{isActive ? `${displayName.toUpperCase()} VISIBLE ON PUBLIC MAP` : 'NOT VISIBLE TO VISITORS'}</div>
        </div>
      </div>

      <button onClick={handleToggle} disabled={isPending} style={S.btn}>
        <span>{isPending ? 'UPDATING...' : isActive ? '[ STOP TRANSMISSION ]' : '[ START TRANSMISSION ]'}</span>
        <span style={S.btnSub}>{isActive ? 'Tap to go offline — remove from live map' : 'Tap to broadcast your stall to the live map'}</span>
      </button>

      {error && <div style={S.error}>{error}</div>}

      {isActive && (
        <div style={S.gpsLog}>
          <span style={{ display: 'block', ...S.logOk }}>&gt; COORDINATES MATCHED ✓</span>
          <span style={{ display: 'block' }}>&gt; SPACE REGISTRY: PRAÇA D. LUÍS I — 38m</span>
          <span style={{ display: 'block', ...S.logOk }}>&gt; STALL REGISTERED — BROADCASTING</span>
          <span style={{ display: 'block', opacity: 0.4 }}>&gt; SESSION ACTIVE</span>
        </div>
      )}
    </div>
  )
}
