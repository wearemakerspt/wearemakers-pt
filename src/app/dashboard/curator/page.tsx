import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/queries/auth'
import { getCuratorDashboardData } from '@/lib/queries/curator'
import SiteHeader from '@/components/ui/SiteHeader'
import CreateMarketForm from '@/components/dashboard/CreateMarketForm'
import MarketLedger from '@/components/dashboard/MarketLedger'
import SpotlightPins from '@/components/dashboard/SpotlightPins'
import ActivityLog from '@/components/dashboard/ActivityLog'
import PromoKit from '@/components/dashboard/PromoKit'
import PendingApproval from '@/components/dashboard/PendingApproval'

export const metadata: Metadata = {
  title: 'Command Center — Curator Dashboard',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CuratorDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login?next=/dashboard/curator')
  if (!['curator', 'admin'].includes(user.profile?.role ?? '')) redirect('/')

  const profile = user.profile!

  // ── Approval gate ──────────────────────────────────────────
  // Admins bypass. Curators must be approved before accessing dashboard.
  if (profile.role !== 'admin' && !profile.is_approved) {
    return (
      <PendingApproval
        role="curator"
        displayName={profile.display_name ?? 'Curator'}
      />
    )
  }

  const { ownMarkets, spaces, featuredSlots, recentActivityLog, searchableMakers } =
    await getCuratorDashboardData(user.id)

  const today = new Date().toISOString().split('T')[0]
  const liveNow = ownMarkets.filter(m => m.status === 'live' || m.status === 'community_live')
  const todayMarkets = ownMarkets.filter(m => m.event_date === today)
  const totalCheckins = ownMarkets.reduce((sum, m) => sum + m.checkin_count, 0)
  const featuredCount = featuredSlots.filter(s => s.pinned !== null).length

  const liveMakers = liveNow.flatMap(m => m.attending_makers)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  return (
    <>
      <SiteHeader user={user} liveCount={liveNow.length} />

      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* ── Black command header ── */}
        <div style={{ background: 'var(--INK)', borderBottom: '3px solid var(--INK)', padding: '16px 16px 14px' }}>
          <div style={{ ...T, color: 'var(--RED)', marginBottom: '10px' }}>
            CURATOR COMMAND CENTER · INTERNAL USE ONLY · REF: MCL-2026-{profile.id.slice(-6).toUpperCase()}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(32px,8vw,52px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.88, color: 'var(--P)', marginBottom: '6px' }}>
                {profile.display_name.toUpperCase()}
              </h1>
              <div style={{ ...T, fontSize: '10px', color: 'rgba(240,236,224,.4)' }}>
                Curator · Lisbon ·{' '}
                {liveNow.length > 0
                  ? <span style={{ color: 'var(--RED)', fontWeight: 700 }}>{liveNow.length} MARKET{liveNow.length > 1 ? 'S' : ''} LIVE NOW</span>
                  : 'No markets live right now'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <CreateMarketForm spaces={spaces} />
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', border: '2px solid rgba(240,236,224,.1)', overflow: 'hidden', flexWrap: 'wrap' }}>
            {[
              { label: 'SCHEDULED', value: ownMarkets.length, sub: 'NEXT 60 DAYS' },
              { label: 'LIVE NOW', value: liveNow.length, sub: liveNow.length > 0 ? liveNow.map(m => m.space.name).join(' · ') : 'NONE ACTIVE', highlight: liveNow.length > 0 },
              { label: 'TODAY', value: todayMarkets.length, sub: todayMarkets.length > 0 ? todayMarkets.map(m => m.space.name).join(' · ') : 'NO MARKETS' },
              { label: 'TOTAL CHECK-INS', value: totalCheckins, sub: 'ALL MARKETS' },
              { label: "CURATOR'S CHOICE", value: `${featuredCount}/20`, sub: featuredCount === 20 ? 'SPOTLIGHT FULL' : 'SLOTS AVAILABLE' },
            ].map((stat, i) => (
              <div key={i} style={{ flex: 1, padding: '10px 14px', borderRight: '2px solid rgba(240,236,224,.1)', minWidth: '80px' }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '24px', lineHeight: 1, marginBottom: '4px', color: stat.highlight ? 'var(--RED)' : 'var(--P)' }}>
                  {typeof stat.value === 'number' ? String(stat.value).padStart(2, '0') : stat.value}
                </div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.3)', lineHeight: 1.4 }}>
                  {stat.label}<br />
                  <span style={{ opacity: 0.6, fontSize: '8px' }}>{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Field Protocol subheader ── */}
        <div style={{ background: 'var(--P2)', borderBottom: '3px solid var(--INK)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.35)' }}>
            COMMAND CENTER — CURATOR PROTOCOL · FP-CUR-001 through FP-CUR-005
          </div>
          <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.25)' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        {/* ── Dashboard body ── */}
        <div style={{ padding: '0' }}>

          {/* §1 Market Ledger */}
          <div style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--INK)' }}>
              <span style={{ ...T, fontWeight: 700 }}>§1 — MARKET LEDGER</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...T, fontSize: '10px', fontWeight: 700, color: liveNow.length > 0 ? 'var(--RED)' : 'rgba(240,236,224,.25)' }}>
                  {liveNow.length > 0 ? `${liveNow.length} LIVE` : `${ownMarkets.length} TOTAL`}
                </span>
                <span style={{ ...T, fontSize: '9px', opacity: 0.3 }}>FP-CUR-001</span>
              </div>
            </div>
            <div style={{ background: 'var(--P2)', padding: '8px 13px', borderBottom: '2px solid rgba(24,22,20,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)' }}>Click a market to see checked-in makers and verify attendance.</div>
              <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.25)' }}>CANCEL = RED CARD</div>
            </div>
            <MarketLedger markets={ownMarkets} />
          </div>

          {/* §2 Promo Kit */}
          <div style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--INK)' }}>
              <span style={{ ...T, fontWeight: 700 }}>§2 — PROMO KIT · INSTAGRAM STORIES</span>
              <span style={{ ...T, fontSize: '9px', opacity: 0.3 }}>FP-CUR-002</span>
            </div>
            <PromoKit liveMakers={liveMakers} liveMarkets={liveNow} />
          </div>

          {/* §3 Spotlight Pins */}
          <div style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--INK)' }}>
              <span style={{ ...T, fontWeight: 700 }}>§3 — SPOTLIGHT PINS · CURATOR'S CHOICE</span>
              <span style={{ ...T, fontSize: '9px', opacity: 0.3 }}>FP-CUR-003</span>
            </div>
            <SpotlightPins slots={featuredSlots} searchableMakers={searchableMakers} />
          </div>

          {/* §4 Activity Log */}
          <div style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--INK)' }}>
              <span style={{ ...T, fontWeight: 700 }}>§4 — ACTIVITY LOG</span>
              <span style={{ ...T, fontSize: '9px', opacity: 0.3 }}>FP-CUR-004</span>
            </div>
            <ActivityLog entries={recentActivityLog} />
          </div>

          {/* §5 Status key */}
          <div style={{ margin: '12px 12px 12px', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--INK)' }}>
              <span style={{ ...T, fontWeight: 700 }}>§5 — MARKET STATUS KEY</span>
              <span style={{ ...T, fontSize: '9px', opacity: 0.3 }}>FP-CUR-005</span>
            </div>
            <div style={{ background: 'var(--P)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { color: 'var(--RED)', label: 'LIVE', desc: 'Curator opened · on the map now · makers can check in' },
                { color: 'var(--GRN)', label: 'COMMUNITY', desc: `${ownMarkets[0]?.checkin_threshold ?? 3}+ maker check-ins · auto-flipped by database trigger` },
                { color: 'rgba(24,22,20,.3)', label: 'SCHEDULED', desc: 'Upcoming · visible to visitors · not yet open' },
                { color: 'rgba(24,22,20,.15)', label: 'SHADOW', desc: 'On annual calendar · not visible to visitors yet' },
                { color: 'var(--INK)', label: 'CANCELLED', desc: 'Rain / no-show · visitors notified automatically' },
              ].map(({ color, label, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', flexShrink: 0, background: color }} />
                  <div style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--INK)', width: '100px', flexShrink: 0 }}>{label}</div>
                  <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
