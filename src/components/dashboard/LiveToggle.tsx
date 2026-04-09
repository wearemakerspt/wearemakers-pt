'use client'

import { useState, useTransition, useEffect } from 'react'
import { checkInToMarket, checkOutOfMarket } from '@/app/dashboard/maker/actions'
import type { AttendedMarket, UpcomingMarket } from '@/lib/queries/maker'

interface Props {
  initialIsActive: boolean
  displayName: string
  activeCheckins: AttendedMarket[]
  todayMarkets: UpcomingMarket[]
}

function formatTime(t: string) { return t.slice(0, 5) }

export default function LiveToggle({ initialIsActive, displayName, activeCheckins, todayMarkets }: Props) {
  const [isActive, setIsActive] = useState(initialIsActive)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [justWentLive, setJustWentLive] = useState(false)
  const [justWentOffline, setJustWentOffline] = useState(false)
  const [offlineMarketName, setOfflineMarketName] = useState<string | null>(null)
  const [sessionDuration, setSessionDuration] = useState<string | null>(null)
  const [selectedMarketId, setSelectedMarketId] = useState<string>(
    todayMarkets[0]?.market.id ?? ''
  )

  const checkedInIds = new Set(activeCheckins.map(c => c.market.id))
  // Include range markets where today falls within the range
  const todayStr2 = new Date().toISOString().split('T')[0]
  const availableMarkets = todayMarkets.filter(um => {
    if (checkedInIds.has(um.market.id)) return false
    if (!['live', 'community_live', 'scheduled'].includes(um.market.status)) return false
    const endDate = (um.market as any).event_date_end ?? um.market.event_date
    return todayStr2 >= um.market.event_date && todayStr2 <= endDate
  })
  const selectedMarket = todayMarkets.find(um => um.market.id === selectedMarketId)
  const [stallLabel, setStallLabel] = useState('')

  function handleGoLive() {
    if (!selectedMarketId) { setError('Select a market first'); return }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('market_id', selectedMarketId)
      fd.set('stall_label', stallLabel.trim())
      const result = await checkInToMarket(fd)
      if (result?.error) { setError(result.error) }
      else {
        setIsActive(true)
        setJustWentLive(true)
        setTimeout(() => setJustWentLive(false), 4000)
      }
    })
  }

  function handleGoOffline() {
    const checkin = activeCheckins.find(c => c.market.id === selectedMarketId) ?? activeCheckins[0]
    if (!checkin) return
    setError(null)

    // Calculate session duration
    const checkedInAt = new Date(checkin.checked_in_at)
    const now = new Date()
    const mins = Math.round((now.getTime() - checkedInAt.getTime()) / 60000)
    const dur = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`

    startTransition(async () => {
      const result = await checkOutOfMarket(checkin.attendance_id)
      if (result?.error) { setError(result.error) }
      else {
        setOfflineMarketName(checkin.market.space.name)
        setSessionDuration(dur)
        setIsActive(false)
        setJustWentOffline(true)
        setTimeout(() => setJustWentOffline(false), 3500)
      }
    })
  }

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  // ── Check-out confirmation overlay ───────────────────────
  if (justWentOffline) {
    return (
      <div style={{ background: 'var(--INK)', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', border: '4px solid rgba(240,236,224,.3)', padding: '12px 28px', marginBottom: '20px', transform: 'rotate(-1deg)', boxShadow: '4px 4px 0 rgba(0,0,0,.4)' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '52px', color: 'rgba(240,236,224,.9)', letterSpacing: '-0.02em', lineHeight: 0.9, textTransform: 'uppercase' }}>
            OFFLINE
          </div>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>
            OFF THE MAP
          </div>
        </div>

        <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', color: 'rgba(240,236,224,.8)', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '6px' }}>
          SESSION ENDED
        </div>

        {offlineMarketName && (
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(240,236,224,.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {offlineMarketName}
          </div>
        )}

        {sessionDuration && (
          <div style={{ fontFamily: 'var(--MONO)', fontWeight: 800, fontSize: '32px', color: 'rgba(240,236,224,.6)', marginBottom: '20px' }}>
            {sessionDuration}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '280px', margin: '0 auto' }}>
          {[
            '✓ Removed from the live map',
            '✓ Attendance recorded',
            '✓ Session logged to your history',
          ].map((line, i) => (
            <div key={i} style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,236,224,.4)', textAlign: 'left' }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Full-screen GO LIVE confirmation overlay ──────────────
  if (justWentLive) {
    const mkt = selectedMarket ?? todayMarkets[0]
    return (
      <div style={{
        background: 'var(--RED)', padding: '32px 20px', textAlign: 'center',
        animation: 'fadeIn .2s ease',
      }}>
        {/* Stamp */}
        <div style={{
          display: 'inline-block', border: '4px solid rgba(255,255,255,.8)',
          padding: '12px 28px', marginBottom: '20px',
          transform: 'rotate(-2deg)',
          boxShadow: '4px 4px 0 rgba(0,0,0,.25)',
        }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '52px', color: '#fff', letterSpacing: '-0.02em', lineHeight: 0.9, textTransform: 'uppercase' }}>
            LIVE
          </div>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(255,255,255,.8)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>
            ON MAP NOW
          </div>
        </div>

        <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '8px' }}>
          {displayName.toUpperCase()} IS BROADCASTING
        </div>

        {mkt && (
          <div style={{ ...T, color: 'rgba(255,255,255,.7)', fontSize: '12px', marginBottom: '20px' }}>
            {mkt.market.space.name} · {formatTime(mkt.market.starts_at)}–{formatTime(mkt.market.ends_at)}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
          {[
            '✓ Visible to all visitors on the platform',
            '✓ Saved followers will receive a notification',
            '✓ Your brand appears in the Live Now feed',
          ].map((line, i) => (
            <div key={i} style={{ ...T, fontSize: '10px', color: 'rgba(255,255,255,.75)', textAlign: 'left', display: 'flex', gap: '8px' }}>
              <span>{line}</span>
            </div>
          ))}
        </div>

        <div style={{ ...T, fontSize: '10px', color: 'rgba(255,255,255,.4)', marginTop: '20px' }}>
          THIS SCREEN WILL DISMISS AUTOMATICALLY
        </div>
      </div>
    )
  }

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
            {isActive ? `${displayName.toUpperCase()} VISIBLE ON PUBLIC MAP` : 'NOT VISIBLE TO VISITORS'}
          </div>
        </div>
      </div>

      {/* Market selector — only when offline */}
      {!isActive && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...T, color: 'rgba(24,22,20,.45)', marginBottom: '8px' }}>
            SELECT MARKET TO CHECK INTO
          </div>
          {availableMarkets.length === 0 ? (
            <div style={{ border: '1px dashed rgba(24,22,20,.25)', padding: '14px', background: 'var(--P2)' }}>
              <div style={{ ...T, fontWeight: 700, color: 'rgba(24,22,20,.5)', fontSize: '10px', marginBottom: '8px' }}>
                NO OPEN MARKETS TODAY
              </div>
              <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.45)', lineHeight: 1.6 }}>
                Your curator needs to open a market before you can check in.
              </div>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  'Check §4 below to declare intent for upcoming markets',
                  'If you run your own market, check the curator dashboard',
                  '3 makers checking in independently opens a community market',
                ].map((tip, i) => (
                  <div key={i} style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.35)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ color: 'var(--RED)', flexShrink: 0 }}>→</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {availableMarkets.map(um => {
                const selected = selectedMarketId === um.market.id
                const isLive = um.market.status === 'live' || um.market.status === 'community_live'
                return (
                  <button key={um.market.id} onClick={() => setSelectedMarketId(um.market.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px',
                      border: `2px solid ${selected ? 'var(--INK)' : 'rgba(24,22,20,.2)'}`,
                      background: selected ? 'var(--INK)' : 'var(--P2)', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: selected ? 'var(--P)' : 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>
                        {um.market.space.name}
                      </div>
                      <div style={{ ...T, fontSize: '10px', color: selected ? 'rgba(240,236,224,.45)' : 'rgba(24,22,20,.38)' }}>
                        {formatTime(um.market.starts_at)}–{formatTime(um.market.ends_at)}
                        {(um.market as any).event_date_end ? ` · UNTIL ${new Date((um.market as any).event_date_end + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}` : ''}
                        {um.market.space.address ? ` · ${um.market.space.address}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isLive && <span style={{ ...T, fontSize: '9px', color: 'var(--GRN)', fontWeight: 700 }}>● LIVE</span>}
                      {selected && <span style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700 }}>SELECTED ✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Stall reference — shown when a market is selected */}
          {availableMarkets.length > 0 && selectedMarketId && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(24,22,20,.4)', display: 'block', marginBottom: '6px' }}>
                STALL REFERENCE (optional)
              </label>
              <input
                type="text"
                value={stallLabel}
                onChange={e => setStallLabel(e.target.value)}
                placeholder="e.g. A-7, Unit 3, Row B"
                style={{
                  width: '100%', background: 'transparent',
                  border: 'none', borderBottom: '1px dashed rgba(24,22,20,.3)',
                  padding: '7px 0', fontFamily: 'var(--MONO)', fontSize: '15px',
                  color: 'var(--INK)', outline: 'none',
                }}
              />
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
      <button onClick={isActive ? handleGoOffline : handleGoLive}
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
        }}>
        <span>{isPending ? 'UPDATING...' : isActive ? '[ STOP TRANSMISSION ]' : '[ START TRANSMISSION ]'}</span>
        <span style={{ display: 'block', fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', marginTop: '6px', opacity: 0.55 }}>
          {isActive ? 'Tap to go offline — remove from live map'
            : selectedMarketId ? `Check in to ${selectedMarket?.market.space.name ?? 'selected market'}`
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
