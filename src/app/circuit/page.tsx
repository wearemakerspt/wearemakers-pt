import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/queries/auth'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/components/ui/SiteHeader'
import SaveBrandButton from '@/components/ui/SaveBrandButton'
import RealtimeRefresh from '@/components/ui/RealtimeRefresh'

export const metadata: Metadata = {
  title: 'My Circuit — WEAREMAKERS.PT',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CircuitPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()

  let savedBrands: any[] = []

  if (user) {
    const { data } = await supabase
      .from('saved_brands')
      .select(`
        brand_id,
        saved_at,
        brand:profiles (
          id, display_name, slug, bio, bio_i18n,
          instagram_handle, is_verified, digital_offer, is_active,
          attendance (
            id, checked_out_at,
            market:markets (
              id, event_date, starts_at, ends_at, status,
              space:spaces ( name, parish )
            )
          )
        )
      `)
      .eq('visitor_id', user.id)
      .order('saved_at', { ascending: false })

    savedBrands = (data ?? []).map((row: any) => {
      const brand = row.brand
      const today = new Date().toISOString().split('T')[0]
      const liveCheckin = (brand.attendance ?? []).find((a: any) =>
        !a.checked_out_at &&
        a.market?.event_date === today &&
        ['live', 'community_live'].includes(a.market?.status)
      )
      return {
        ...brand,
        is_live: !!liveCheckin,
        live_market_name: liveCheckin?.market?.space?.name ?? null,
        saved_at: row.saved_at,
      }
    })
  }

  const liveNow = savedBrands.filter(b => b.is_live)
  const notLive = savedBrands.filter(b => !b.is_live)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  return (
    <>
      <RealtimeRefresh />
      <SiteHeader user={user} liveCount={liveNow.length} />

      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* Header */}
        <div style={{ background: 'var(--INK)', borderBottom: '3px solid var(--INK)', padding: '20px 16px' }}>
          <div style={{ ...T, color: 'var(--RED)', marginBottom: '8px' }}>MY CIRCUIT</div>
          <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(40px,10vw,64px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: 'var(--P)', marginBottom: '10px' }}>
            SAVED<br /><em style={{ color: 'var(--RED)' }}>BRANDS.</em>
          </h1>
          <div style={{ ...T, fontSize: '10px', color: 'rgba(240,236,224,.35)' }}>
            {savedBrands.length} BRAND{savedBrands.length !== 1 ? 'S' : ''} SAVED
            {liveNow.length > 0 && <span style={{ color: 'var(--RED)', fontWeight: 700, marginLeft: '10px' }}>● {liveNow.length} LIVE NOW</span>}
          </div>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.2)', marginTop: '6px' }}>
            BRANDS · MARKETS · GEMS — COMING SOON
          </div>
        </div>

        {/* Not logged in */}
        {!user && (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '16px' }}>
              SIGN IN TO SEE YOUR CIRCUIT
            </div>
            <div style={{ fontFamily: 'var(--MONO)', fontSize: '16px', color: 'rgba(24,22,20,.45)', lineHeight: 1.6, marginBottom: '24px' }}>
              Create an account to save brands and get notified when they go live.
            </div>
            <Link href="/auth/register"
              style={{ ...T, fontWeight: 700, fontSize: '12px', color: 'var(--P)', background: 'var(--RED)', border: '3px solid var(--RED)', padding: '14px 24px', textDecoration: 'none', display: 'inline-block', boxShadow: 'var(--SHD)' }}>
              JOIN WEAREMAKERS.PT →
            </Link>
          </div>
        )}

        {/* Empty circuit */}
        {user && savedBrands.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '32px', textTransform: 'uppercase', color: 'rgba(24,22,20,.15)', marginBottom: '16px' }}>
              YOUR CIRCUIT IS EMPTY
            </div>
            <div style={{ fontFamily: 'var(--MONO)', fontSize: '16px', color: 'rgba(24,22,20,.45)', lineHeight: 1.6, marginBottom: '24px' }}>
              Browse brands and tap ♡ SAVE to add them here. You'll be notified when they go live at a market.
            </div>
            <Link href="/brands"
              style={{ ...T, fontWeight: 700, fontSize: '12px', color: 'var(--INK)', background: 'var(--P)', border: '3px solid var(--INK)', padding: '14px 24px', textDecoration: 'none', display: 'inline-block', boxShadow: 'var(--SHD)' }}>
              BROWSE BRANDS →
            </Link>
          </div>
        )}

        {/* Live now section */}
        {liveNow.length > 0 && (
          <section>
            <div style={{ padding: '14px 16px 10px', borderBottom: '3px solid var(--INK)', background: 'rgba(200,41,26,.04)' }}>
              <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700, marginBottom: '4px' }}>● ACTIVE RIGHT NOW</div>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '36px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: 'var(--INK)' }}>
                LIVE TODAY
              </div>
            </div>
            {liveNow.map(brand => (
              <BrandRow key={brand.id} brand={brand} userId={user?.id ?? null} initialSaved={true} />
            ))}
          </section>
        )}

        {/* Not live section */}
        {notLive.length > 0 && (
          <section>
            <div style={{ padding: '14px 16px 10px', borderBottom: '3px solid var(--INK)', opacity: 0.5 }}>
              <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>NOT HERE TODAY</div>
              <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '36px', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.9, color: 'var(--INK)' }}>
                TRACKED
              </div>
            </div>
            {notLive.map(brand => (
              <BrandRow key={brand.id} brand={brand} userId={user?.id ?? null} initialSaved={true} />
            ))}
          </section>
        )}

      </main>
    </>
  )
}

function BrandRow({ brand, userId, initialSaved }: { brand: any; userId: string | null; initialSaved: boolean }) {
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const initials = brand.display_name.slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderBottom: '2px solid rgba(24,22,20,.1)', background: brand.is_live ? 'rgba(200,41,26,.03)' : 'transparent' }}>
      {/* Avatar */}
      <Link href={`/brands/${brand.slug ?? brand.id}`} style={{ textDecoration: 'none' }}>
        <div style={{ width: '56px', height: '56px', flexShrink: 0, background: 'var(--INK)', border: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', color: 'var(--RED)', position: 'relative', overflow: 'hidden' }}>
          {brand.avatar_url
            ? <img src={brand.avatar_url} alt={brand.display_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
          {brand.is_live && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--GRN)', ...T, fontSize: '7px', color: '#fff', padding: '2px 4px', textAlign: 'center' }}>LIVE</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={`/brands/${brand.slug ?? brand.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1, marginBottom: '3px' }}>
            {brand.display_name}
          </div>
        </Link>
        {brand.is_live && brand.live_market_name && (
          <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700, marginBottom: '2px' }}>
            ● LIVE AT {brand.live_market_name.toUpperCase()}
          </div>
        )}
        {(brand.bio_i18n as any)?._category && (
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>
            {(brand.bio_i18n as any)._category.split(',')[0].trim()}
          </div>
        )}
      </div>

      {/* Save button */}
      <SaveBrandButton
        brandId={brand.id}
        brandName={brand.display_name}
        initialSaved={initialSaved}
        userId={userId}
        size="sm"
      />
    </div>
  )
}
