'use client'
import { useState } from 'react'
import { confirmMakerRequest, removeMakerRequest } from '@/app/dashboard/curator/actions'

interface MakerRequest {
  attendance_id: string
  maker_id: string
  display_name: string
  slug: string | null
  category: string | null
  is_verified: boolean
  stall_label: string | null
  checked_in_at: string
}

interface MarketWithRequests {
  market_id: string
  market_title: string
  event_date: string
  requests: MakerRequest[]
}

interface Props {
  markets: MarketWithRequests[]
}

const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

function RequestRow({ req, marketId }: { req: MakerRequest; marketId: string }) {
  const [loading, setLoading] = useState<'confirm' | 'remove' | null>(null)
  const [done, setDone] = useState<'confirmed' | 'removed' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isPending = req.stall_label === 'INTENT' && !req.is_verified
  const isConfirmed = req.is_verified

  const handleConfirm = async () => {
    setLoading('confirm')
    setError(null)
    const result = await confirmMakerRequest(req.attendance_id)
    if (result.error) {
      setError(result.error)
      setLoading(null)
    } else {
      setDone('confirmed')
      setLoading(null)
    }
  }

  const handleRemove = async () => {
    if (!confirm(`Remove ${req.display_name} from this market?`)) return
    setLoading('remove')
    setError(null)
    const result = await removeMakerRequest(req.attendance_id)
    if (result.error) {
      setError(result.error)
      setLoading(null)
    } else {
      setDone('removed')
      setLoading(null)
    }
  }

  if (done === 'removed') return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 16px', borderBottom: '1px solid rgba(24,22,20,0.1)',
      background: done === 'confirmed' ? 'rgba(26,92,48,0.06)' : 'var(--P)',
    }}>
      {/* Initials */}
      <div style={{
        width: '40px', height: '40px', flexShrink: 0,
        background: 'var(--P2)', border: '2px solid var(--INK)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '14px', color: 'var(--INK)',
      }}>
        {req.display_name.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 700, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>
          {req.display_name}
        </div>
        {req.category && (
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,0.4)', marginTop: '3px' }}>
            {req.category}
          </div>
        )}
      </div>

      {/* Status / Actions */}
      {done === 'confirmed' ? (
        <div style={{ ...T, fontSize: '9px', color: 'var(--GRN)', fontWeight: 700 }}>✓ CONFIRMED</div>
      ) : isConfirmed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ ...T, fontSize: '9px', color: 'var(--GRN)' }}>✓ CONFIRMED</div>
          <button
            onClick={handleRemove}
            disabled={loading !== null}
            style={{ ...T, fontSize: '9px', padding: '4px 8px', background: 'transparent', border: '1px solid rgba(24,22,20,0.2)', color: 'rgba(24,22,20,0.4)', cursor: 'pointer' }}
          >
            REMOVE
          </button>
        </div>
      ) : isPending ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(200,41,26,0.7)', background: 'rgba(200,41,26,0.08)', padding: '3px 8px', border: '1px solid rgba(200,41,26,0.2)' }}>
            PENDING
          </div>
          <button
            onClick={handleConfirm}
            disabled={loading !== null}
            style={{ ...T, fontSize: '9px', padding: '5px 10px', background: 'var(--INK)', border: 'none', color: 'var(--P)', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading === 'confirm' ? '...' : 'CONFIRM'}
          </button>
          <button
            onClick={handleRemove}
            disabled={loading !== null}
            style={{ ...T, fontSize: '9px', padding: '5px 10px', background: 'var(--RED)', border: 'none', color: 'var(--P)', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading === 'remove' ? '...' : 'REFUSE'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleRemove}
          disabled={loading !== null}
          style={{ ...T, fontSize: '9px', padding: '4px 8px', background: 'transparent', border: '1px solid rgba(24,22,20,0.2)', color: 'rgba(24,22,20,0.4)', cursor: 'pointer' }}
        >
          REMOVE
        </button>
      )}

      {error && (
        <div style={{ ...T, fontSize: '9px', color: 'var(--RED)' }}>{error}</div>
      )}
    </div>
  )
}

export default function MakerRequests({ markets }: Props) {
  const totalPending = markets.reduce((sum, m) =>
    sum + m.requests.filter(r => r.stall_label === 'INTENT' && !r.is_verified).length, 0)

  if (markets.every(m => m.requests.length === 0)) {
    return (
      <div style={{ padding: '24px 16px' }}>
        <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,0.3)' }}>
          NO MAKER REQUESTS — Makers who declare attendance intent will appear here for your approval.
        </div>
      </div>
    )
  }

  return (
    <div>
      {totalPending > 0 && (
        <div style={{ background: 'rgba(200,41,26,0.08)', borderBottom: '2px solid rgba(200,41,26,0.2)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: 'var(--RED)', borderRadius: '50%' }} />
          <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700 }}>
            {totalPending} MAKER{totalPending !== 1 ? 'S' : ''} AWAITING CONFIRMATION
          </div>
        </div>
      )}

      {markets.map(market => {
        if (market.requests.length === 0) return null
        const pendingCount = market.requests.filter(r => r.stall_label === 'INTENT' && !r.is_verified).length

        return (
          <div key={market.market_id} style={{ borderBottom: '2px solid rgba(24,22,20,0.1)' }}>
            {/* Market header */}
            <div style={{
              padding: '10px 16px', background: 'var(--P2)',
              borderBottom: '1px solid rgba(24,22,20,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: 'var(--INK)' }}>
                  {market.market_title}
                </div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,0.4)', marginTop: '2px' }}>
                  {new Date(market.event_date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {pendingCount > 0 && (
                  <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', background: 'rgba(200,41,26,0.08)', padding: '3px 8px', border: '1px solid rgba(200,41,26,0.2)' }}>
                    {pendingCount} PENDING
                  </div>
                )}
                <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,0.3)' }}>
                  {market.requests.length} TOTAL
                </div>
              </div>
            </div>

            {/* Maker rows */}
            {market.requests.map(req => (
              <RequestRow key={req.attendance_id} req={req} marketId={market.market_id} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
