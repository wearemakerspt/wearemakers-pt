import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type') ?? 'default'
    const title = searchParams.get('title') ?? 'WEAREMAKERS.PT'
    const sub = searchParams.get('sub') ?? ''
    const date = searchParams.get('date') ?? ''
    const status = searchParams.get('status') ?? ''
    const avatar = searchParams.get('avatar') ?? ''

    const isLive = status === 'LIVE NOW'

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            background: '#F4F1EC',
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Red top bar */}
          <div style={{ height: '8px', background: '#E8001C', width: '100%', display: 'flex' }} />

          {/* Body */}
          <div style={{ display: 'flex', flex: 1, padding: '56px 64px', gap: '48px', alignItems: 'stretch' }}>

            {/* Left */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

              {/* Logo row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.08em', color: '#1A1A1A', textTransform: 'uppercase', display: 'flex' }}>
                  WEARE<span style={{ color: '#E8001C' }}>MAKERS</span>.PT
                </div>
                {isLive && (
                  <div style={{ background: '#1a5c30', color: '#F4F1EC', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', padding: '4px 10px', textTransform: 'uppercase', display: 'flex' }}>
                    LIVE NOW
                  </div>
                )}
                {status === 'SCHEDULED' && (
                  <div style={{ border: '1px solid #6B6560', color: '#6B6560', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', padding: '4px 10px', textTransform: 'uppercase', display: 'flex' }}>
                    SCHEDULED
                  </div>
                )}
              </div>

              {/* Title block */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  fontSize: title.length > 18 ? '68px' : '92px',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: '0.88',
                  color: '#1A1A1A',
                  textTransform: 'uppercase',
                  display: 'flex',
                  flexWrap: 'wrap',
                }}>
                  {title}
                </div>
                {sub && (
                  <div style={{ fontSize: '18px', letterSpacing: '0.12em', color: '#6B6560', textTransform: 'uppercase', display: 'flex' }}>
                    {sub}
                  </div>
                )}
                {date && (
                  <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.16em', color: '#E8001C', textTransform: 'uppercase', display: 'flex' }}>
                    {date}
                  </div>
                )}
              </div>

              {/* Bottom label */}
              <div style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#6B6560', textTransform: 'uppercase', display: 'flex' }}>
                LISBON STREET MARKETS · INDEPENDENT MAKERS
              </div>
            </div>

            {/* Right — dark panel */}
            <div style={{
              width: '260px',
              background: '#1A1A1A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              padding: '40px 28px',
              flexShrink: 0,
            }}>
              {type === 'brand' && avatar ? (
                <img
                  src={avatar}
                  alt=""
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', border: '2px solid rgba(244,241,236,0.2)' }}
                />
              ) : (
                <div style={{ fontSize: '52px', color: isLive ? '#1a5c30' : 'rgba(244,241,236,0.12)', display: 'flex' }}>
                  {type === 'brand' ? title.slice(0, 2).toUpperCase() : '◈'}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(244,241,236,0.35)', textTransform: 'uppercase', display: 'flex' }}>
                  {type === 'brand' ? 'MAKER BRAND' : 'STREET MARKET'}
                </div>
                <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(244,241,236,0.2)', textTransform: 'uppercase', display: 'flex' }}>
                  wearemakers.pt
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ height: '5px', background: '#1A1A1A', width: '100%', display: 'flex' }} />
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch (e) {
    return new Response('OG image error', { status: 500 })
  }
}
