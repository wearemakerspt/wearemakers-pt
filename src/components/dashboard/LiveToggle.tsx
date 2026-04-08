'use client'

import { useState, useTransition } from 'react'
import { checkInToMarket, checkOutOfMarket, setLiveStatus } from '@/app/dashboard/maker/actions'
import type { AttendedMarket, UpcomingMarket } from '@/lib/queries/maker'

interface LiveMarket {
  id: string
  title: string
  space_name: string
  starts_at: string
  ends_at: string
  status: string
}

interface Props {
  initialIsActive: boolean
  displayName: string
  activeCheckins: AttendedMarket[]
  todayMarkets: UpcomingMarket[]
}

const CATEGORIES = [
  'Ceramics', 'Leather', 'Textile', 'Paper', 'Jewellery',
  'Glass', 'Woodwork', 'Zines', 'Books', 'Art & Prints',
  'Food', 'Accessories', 'Other',
]

function formatTime(t: string) { return t.slice(0, 5) }

export default function LiveToggle({ initialIsActive, displayName, activeCheckins, todayMarkets }: Props) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedMarketId, setSelectedMarketId] = useState<string>(
    todayMarkets[0]?.market.id ?? ''
  )

  // Markets already checked into
  const checkedInIds = new Set(activeCheckins.map(c => c.market.id))
  // Live markets available to check into
  const availableMarkets = todayMarkets.filter(
    um => !checkedInIds.has(um.market.id) &&
    (um.market.status === 'live' || um.market.status === 'community_live' || um.market.status === 'scheduled')
  )

  const selectedMarket = todayMarkets.find(um => um.market.id === selectedMarketId)
  const isCheckedIntoSelected = checkedInIds.has(selectedMarketId)

  function handleGoLive() {
    if (!selectedMarketId) { setError('Select a market first'); return }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('market_id', selectedMarketId)
      fd.set('stall_label', '')
      const result = await checkInToMarket(fd)
      if (result?.error) { setError(result.error) }
      else { setIsActive(true) }
    })
  }

  function handleGoOffline() {
    const checkin = activeCheckins.find(c => c.market.id === selectedMarketId) ?? activeCheckins[0]
    if (!checkin) return
    setError(null)
    startTransition(async () => {
      const result = await checkOutOfMarket(checkin.attendance_id)
      if (result?.error) { setError(result.error) }
      else { setIsActive(false) }
    })
  }

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  return (
    <div style={{ background: 'var(--P)', padding: '16px' }}>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed rgba(24,22,20,.3)' }}>
        <div style={{ width: '14px', height: '14px', flexShrink: 0, borderRadius: '50%', background: isActive ? 'var(--RED)' : 'rgba(24,22,20,.2)', transition: 'background .3s' }} />
        <div>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, color: isActive ? 'var(--RED)' : 'rgba(24,22,20,.3)', transition: 'color .3s' }}>
            {isActive ? '● BROADCASTING LIVE' : '○ OFFLINE'}
          </div>
          <div style={{ ...T, color: 'rgba(24,22,20,.35)', marginTop: '3px' }}>
            {isActive
              ? `${displayName.toUpperCase()} VISIBLE ON PUBLIC MAP`
              : 'NOT VISIBLE TO VISITORS'}
          </div>
        </div>
      </div>

      {/* Market selector — only show when offline */}
      {!isActive && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...T, color: 'rgba(24,22,20,.45)', marginBottom: '8px' }}>
            SELECT MARKET TO CHECK INTO
          </div>

          {availableMarkets.length === 0 ? (
            <div style={{ border: '1px dashed rgba(24,22,20,.25)', padding: '12px', background: 'var(--P2)' }}>
              <div style={{ ...T, color: 'rgba(24,22,20,.3)', fontSize: '10px' }}>
                NO LIVE MARKETS TODAY
              </div>
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.4)', marginTop: '4px' }}>
                Markets must be opened by a curator first. Check the upcoming agenda below.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {availableMarkets.map(um => {
                const selected = selectedMarketId === um.market.id
                const isLive = um.market.status === 'live' || um.market.status === 'community_live'
                return (
                  <button
                    key={um.market.id}
                    onClick={() => setSelectedMarketId(um.market.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', border: `2px solid ${selected ? 'var(--INK)' : 'rgba(24,22,20,.2)'}`,
                      background: selected ? 'var(--INK)' : 'var(--P2)',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: selected ? 'var(--P)' : 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>
                        {um.market.space.name}
                      </div>
                      <div style={{ ...T, fontSize: '10px', color: selected ? 'rgba(240,236,224,.45)' : 'rgba(24,22,20,.38)' }}>
                        {formatTime(um.market.starts_at)}–{formatTime(um.market.ends_at)}
                        {um.market.space.address ? ` · ${um.market.space.address}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isLive && (
                        <span style={{ ...T, fontSize: '9px', color: selected ? 'var(--GRN)' : 'var(--GRN)', fontWeight: 700 }}>● LIVE</span>
                      )}
                      {selected && (
                        <span style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700 }}>SELECTED ✓</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Currently checked in markets when live */}
      {isActive && activeCheckins.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...T, color: 'rgba(24,22,20,.45)', marginBottom: '8px' }}>CURRENTLY AT</div>
          {activeCheckins.map(c => (
            <div key={c.attendance_id} style={{ padding: '8px 12px', border: '2px solid var(--GRN)', background: 'rgba(26,92,48,.05)', marginBottom: '6px' }}>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>
                {c.market.space.name}
              </div>
              <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', marginTop: '3px' }}>
                {formatTime(c.market.starts_at)}–{formatTime(c.market.ends_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* The big button */}
      <button
        onClick={isActive ? handleGoOffline : handleGoLive}
        disabled={isPending || (!isActive && availableMarkets.length === 0)}
        style={{
          width: '100%', padding: '18px 16px', border: '3px solid',
          cursor: isPending || (!isActive && availableMarkets.length === 0) ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(18px,5vw,24px)',
          letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'left', lineHeight: 1,
          background: isActive ? 'var(--RED)' : 'var(--P)',
          borderColor: isActive ? 'var(--RED)' : 'var(--INK)',
          color: isActive ? 'var(--P)' : 'var(--INK)',
          boxShadow: isPending ? 'var(--SHD-ACT)' : 'var(--SHD)',
          transform: isPending ? 'translate(6px,6px)' : 'none',
          opacity: isPending || (!isActive && availableMarkets.length === 0) ? 0.5 : 1,
        }}
      >
        <span>{isPending ? 'UPDATING...' : isActive ? '[ STOP TRANSMISSION ]' : '[ START TRANSMISSION ]'}</span>
        <span style={{ display: 'block', fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', marginTop: '6px', opacity: 0.55 }}>
          {isActive
            ? 'Tap to go offline — remove from live map'
            : selectedMarketId
              ? `Check in to ${selectedMarket?.market.space.name ?? 'selected market'}`
              : 'Select a market above first'}
        </span>
      </button>

      {error && (
        <div style={{ marginTop: '10px', borderLeft: '3px solid var(--RED)', paddingLeft: '10px', ...T, color: 'var(--RED)', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* GPS log when live */}
      {isActive && (
        <div style={{ marginTop: '14px', border: '1px dashed rgba(24,22,20,.3)', background: 'var(--P2)', padding: '10px 12px', fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.6)', lineHeight: 1.8 }}>
          <span style={{ display: 'block', color: 'var(--GRN)', fontWeight: 700 }}>&gt; COORDINATES MATCHED ✓</span>
          <span style={{ display: 'block' }}>&gt; SPACE REGISTRY: {activeCheckins[0]?.market.space.name ?? '—'}</span>
          <span style={{ display: 'block', color: 'var(--GRN)', fontWeight: 700 }}>&gt; STALL REGISTERED — BROADCASTING</span>
          <span style={{ display: 'block', opacity: 0.4 }}>&gt; SESSION ACTIVE</span>
        </div>
      )}
    </div>
  )
}
