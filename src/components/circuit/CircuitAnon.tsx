'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ANON_KEYS, anonGet, anonRemove, type AnonBrand, type AnonGem, type AnonMarket } from '@/lib/anonCircuit'

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

const GEM_ICONS: Record<string, string> = {

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
}
function formatTime(t: string) { return t?.slice(0, 5) ?? '' }

export default function CircuitAnon() {
  const [brands, setBrands] = useState<AnonBrand[]>([])
  const [gems, setGems] = useState<AnonGem[]>([])
  const [markets, setMarkets] = useState<AnonMarket[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setBrands(anonGet<AnonBrand>(ANON_KEYS.brands))
    setGems(anonGet<AnonGem>(ANON_KEYS.gems))
    const today = new Date().toISOString().split('T')[0]
    setMarkets(
      anonGet<AnonMarket>(ANON_KEYS.markets)
        .filter(m => m.event_date >= today)
        .sort((a, b) => a.event_date.localeCompare(b.event_date))
    )
    setMounted(true)
  }, [])

  function removeBrand(id: string) {
    anonRemove(ANON_KEYS.brands, id)
    setBrands(prev => prev.filter(b => b.id !== id))
  }
  function removeGem(id: string) {
    anonRemove(ANON_KEYS.gems, id)
    setGems(prev => prev.filter(g => g.id !== id))
  }
  function removeMarket(id: string) {
    anonRemove(ANON_KEYS.markets, id)
    setMarkets(prev => prev.filter(m => m.id !== id))
  }

  const total = brands.length + gems.length + markets.length
  const isEmpty = total === 0

  if (!mounted) return null

  return (
    <div>
      {/* Stats strip */}
      <div style={{ padding: '20px 52px', borderBottom: Bsm, display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        {[
          { label: 'BRANDS', value: brands.length },
          { label: 'MARKETS', value: markets.length, sub: 'UPCOMING' },
          { label: 'GEMS', value: gems.length, sub: 'SAVED' },
        ].map((s, i) => (
          <div key={i} style={{ paddingRight: '28px', borderRight: i < 2 ? `1px solid rgba(12,12,12,0.1)` : 'none' }}>
            <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '36px', color: INK, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Register CTA banner */}
      <div style={{ padding: '16px 52px', background: INK, borderBottom: B, display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', color: RED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isEmpty ? 'START SAVING BRANDS & PLACES' : `${total} ITEM${total !== 1 ? 'S' : ''} SAVED LOCALLY`}
          </div>
          <div style={{ fontFamily: FB, fontSize: '13px', color: 'rgba(244,241,236,0.6)', lineHeight: 1.5 }}>
            {isEmpty
              ? 'Register free to save brands, get notified when they go live, and keep your Circuit across devices.'
              : 'Register free to sync your Circuit, get live notifications, and never lose your saved places.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <Link href="/auth/register" style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', color: WHITE, background: RED, border: `2px solid ${RED}`, padding: '10px 18px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'inline-block' }}>
            JOIN FREE →
          </Link>
          <Link href="/auth/login" style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', color: 'rgba(244,241,236,0.6)', background: 'transparent', border: `1px solid rgba(244,241,236,0.2)`, padding: '10px 18px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'inline-block' }}>
            SIGN IN
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div style={{ padding: '64px 52px' }}>
          <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(12,12,12,0.1)', marginBottom: '16px' }}>YOUR CIRCUIT IS EMPTY</div>
          <div style={{ fontFamily: FB, fontSize: '15px', color: STONE, lineHeight: 1.7, marginBottom: '28px', maxWidth: '480px' }}>
            Browse brands and tap the save button to build your personal list of Lisbon makers.
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/brands" style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', color: WHITE, background: INK, border: B, padding: '12px 22px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'inline-block' }}>BROWSE BRANDS →</Link>
            <Link href="/markets" style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', color: INK, background: 'transparent', border: B, padding: '12px 22px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'inline-block' }}>SEE MARKETS →</Link>
          </div>
        </div>
      )}

      {/* Saved brands */}
      {brands.length > 0 && (
        <div>
          <div className="section-rule" style={{ padding: '0 52px' }}>
            <span className="section-rule-title">SAVED BRANDS</span>
            <span className="section-rule-link">{brands.length} SAVED</span>
          </div>
          {brands.map(brand => (
            <div key={brand.id} className="circuit-brand-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 52px', borderBottom: Bsm, background: WHITE, transition: 'background .15s' }}>
              <Link href={`/brands/${brand.slug ?? brand.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ width: '52px', height: '52px', background: INK, border: B, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FH, fontWeight: 900, fontSize: '18px', color: RED, position: 'relative', overflow: 'hidden' }}>
                  {brand.avatar_url
                    ? <img src={brand.avatar_url} alt={brand.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : brand.display_name.slice(0, 2).toUpperCase()}
                </div>
              </Link>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/brands/${brand.slug ?? brand.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1 }}>{brand.display_name}</div>
                </Link>
                {brand.category && <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '3px' }}>{brand.category}</div>}
              </div>
              <button
                onClick={() => removeBrand(brand.id)}
                style={{ fontFamily: FM, fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: STONE, background: 'transparent', border: Bsm, padding: '5px 10px', cursor: 'pointer', flexShrink: 0 }}
              >
                UNSAVE
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Saved markets */}
      {markets.length > 0 && (
        <div>
          <div className="section-rule" style={{ padding: '0 52px' }}>
            <span className="section-rule-title">MY MARKET DATES</span>
            <span className="section-rule-link">{markets.length} UPCOMING</span>
          </div>
          {markets.map(market => (
            <div key={market.id} className="circuit-market-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '0 52px', height: '72px', borderBottom: Bsm, background: WHITE, transition: 'background .15s' }}>
              <div style={{ flexShrink: 0, minWidth: '80px' }}>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '14px', color: INK, lineHeight: 1.2 }}>{formatDate(market.event_date)}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/markets/${market.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1 }}>{market.title}</div>
                </Link>
                <div style={{ fontFamily: FM, fontSize: '10px', color: STONE, marginTop: '3px' }}>
                  {formatTime(market.starts_at)}–{formatTime(market.ends_at)}
                  {market.space_name && <span> · {market.space_name}</span>}
                </div>
              </div>
              <button
                onClick={() => removeMarket(market.id)}
                style={{ fontFamily: FM, fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: STONE, background: 'transparent', border: Bsm, padding: '5px 10px', cursor: 'pointer', flexShrink: 0 }}
              >
                UNSAVE
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Saved gems */}
      {gems.length > 0 && (
        <div>
          <div className="section-rule" style={{ padding: '0 52px' }}>
            <span className="section-rule-title">◆ MY GEMS</span>
            <span className="section-rule-link">{gems.length} SAVED</span>
          </div>
          {gems.map(gem => {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${gem.name}${gem.address ? ', ' + gem.address : ''}, Lisbon`)}`
            return (
              <div key={gem.id} className="circuit-gem-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 52px', borderBottom: Bsm, background: WHITE, transition: 'background .15s' }}>
                <div style={{ width: '44px', height: '44px', flexShrink: 0, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {GEM_ICONS[gem.category] ?? '◈'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: INK, lineHeight: 1, marginBottom: '3px' }}>{gem.name}</div>
                  <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: STONE }}>
                    {gem.category.toUpperCase()}{gem.space_name ? ` · NEAR ${gem.space_name.toUpperCase()}` : ''}
                  </div>
                  {gem.description && <div style={{ fontFamily: FB, fontSize: '13px', color: STONE, fontStyle: 'italic', marginTop: '3px' }}>{gem.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK, border: Bsm, padding: '6px 14px', textDecoration: 'none' }}>
                    MAP →
                  </a>
                  <button
                    onClick={() => removeGem(gem.id)}
                    style={{ fontFamily: FM, fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: STONE, background: 'transparent', border: Bsm, padding: '5px 10px', cursor: 'pointer' }}
                  >
                    UNSAVE
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Discover links */}
      {!isEmpty && (
        <div style={{ padding: '24px 52px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/brands" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: INK, background: WHITE, border: B, padding: '10px 18px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'inline-block' }}>DISCOVER BRANDS →</Link>
          <Link href="/markets" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: STONE, background: 'transparent', border: `1px solid rgba(12,12,12,0.2)`, padding: '10px 18px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'inline-block' }}>SEE MARKETS →</Link>
          <Link href="/gems" style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: STONE, background: 'transparent', border: `1px solid rgba(12,12,12,0.2)`, padding: '10px 18px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'inline-block' }}>DISCOVER GEMS →</Link>
        </div>
      )}
    </div>
  )
}
