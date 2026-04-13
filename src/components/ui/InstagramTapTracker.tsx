'use client'

interface Props {
  brandId: string
  handle: string
  marketId?: string | null
  visitorId?: string | null
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

// Wrap the Instagram link with this component to track taps
export default function InstagramTapTracker({
  brandId,
  handle,
  marketId,
  visitorId,
  children,
  className,
  style,
}: Props) {
  function handleClick() {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'instagram_tap',
        brand_id: brandId,
        market_id: marketId ?? null,
        visitor_id: visitorId ?? null,
      }),
    }).catch(() => {})
  }

  return (
    <a
      href={`https://instagram.com/${handle.replace('@', '')}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </a>
  )
}
