import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const type = searchParams.get('type') ?? 'default'       // 'market' | 'brand' | 'default'
  const title = searchParams.get('title') ?? 'WEAREMAKERS.PT'
  const sub = searchParams.get('sub') ?? ''                 // space name / category
  const date = searchParams.get('date') ?? ''               // market date
  const status = searchParams.get('status') ?? ''           // 'LIVE NOW' | 'SCHEDULED'
  const avatar = searchParams.get('avatar') ?? ''           // brand avatar URL

  const PARCHMENT = '#F4F1EC'
  const INK = '#1A1A1A'
  const RED = '#E8001C'
  const STONE = '#6B6560'
  const GREEN = '#1a5c30'
  const PAPER = '#EDE9E2'

  const isLive = status === 'LIVE NOW'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: PARCHMENT,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top border — red */}
        <div style={{ height: '6px', background: RED, width: '100%', flexShrink: 0 }} />

        {/* Main content area */}
        <div style={{ display: 'flex', flex: 1, padding: '52px 64px', gap: '0' }}>

          {/* Left — content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '48px', borderRight: `3px solid ${INK}` }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.06em', color: INK, textTransform: 'uppercase' }}>
                WEARE<span style={{ color: RED }}>MAKERS</span>.PT
              </span>
              {isLive && (
                <span style={{ marginLeft: '16px', background: GREEN, color: PARCHMENT, fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', padding: '4px 10px', textTransform: 'uppercase' }}>
                  ● LIVE NOW
                </span>
              )}
              {status === 'SCHEDULED' && (
                <span style={{ marginLeft: '16px', border: `1px solid ${STONE}`, color: STONE, fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em', padding: '4px 10px', textTransform: 'uppercase' }}>
                  SCHEDULED
                </span>
              )}
            </div>

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                fontSize: title.length > 20 ? '72px' : '96px',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 0.88,
                color: INK,
                textTransform: 'uppercase',
              }}>
                {title}
              </div>

              {sub && (
                <div style={{ fontSize: '18px', fontWeight: 400, letterSpacing: '0.12em', color: STONE, textTransform: 'uppercase' }}>
                  {sub}
                </div>
              )}

              {date && (
                <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.14em', color: RED, textTransform: 'uppercase' }}>
                  {date}
                </div>
              )}
            </div>

            {/* Bottom label */}
            <div style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.22em', color: STONE, textTransform: 'uppercase' }}>
              LISBON STREET MARKETS · INDEPENDENT MAKERS
            </div>
          </div>

          {/* Right — dark panel */}
          <div style={{
            width: '280px',
            flexShrink: 0,
            background: INK,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            padding: '40px 32px',
          }}>
            {type === 'brand' && avatar ? (
              /* Brand avatar */
              <div style={{ width: '120px', height: '120px', border: `3px solid rgba(244,241,236,0.2)`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={avatar} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : type === 'brand' ? (
              /* Brand initials fallback */
              <div style={{ width: '120px', height: '120px', border: `3px solid rgba(244,241,236,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 900, color: 'rgba(244,241,236,0.3)', textTransform: 'uppercase' }}>
                {title.slice(0, 2)}
              </div>
            ) : (
              /* Market icon */
              <div style={{ fontSize: '64px', color: isLive ? GREEN : 'rgba(244,241,236,0.15)' }}>
                {isLive ? '●' : '◈'}
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(244,241,236,0.4)', textTransform: 'uppercase', marginBottom: '6px' }}>
                {type === 'brand' ? 'MAKER BRAND' : 'STREET MARKET'}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '0.14em', color: 'rgba(244,241,236,0.25)', textTransform: 'uppercase' }}>
                wearemakers.pt
              </div>
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div style={{ height: '4px', background: INK, width: '100%', flexShrink: 0 }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
