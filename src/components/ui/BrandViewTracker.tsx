'use client'
import { useEffect } from 'react'

interface Props {
  brandId: string
  marketId?: string | null
  visitorId?: string | null
}

// Fires once when the brand profile page loads
// Uses fire-and-forget — never blocks rendering
export default function BrandViewTracker({ brandId, marketId, visitorId }: Props) {
  useEffect(() => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'brand_view',
        brand_id: brandId,
        market_id: marketId ?? null,
        visitor_id: visitorId ?? null,
      }),
    }).catch(() => {}) // silent fail — analytics must never break the page
  }, [brandId, marketId, visitorId])

  return null // renders nothing
}
