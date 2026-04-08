import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/queries/auth'
import { getCuratorDashboardData } from '@/lib/queries/curator'
import SiteHeader from '@/components/ui/SiteHeader'
import CreateMarketForm from '@/components/dashboard/CreateMarketForm'
import MarketLedger from '@/components/dashboard/MarketLedger'
import SpotlightPins from '@/components/dashboard/SpotlightPins'
import ActivityLog from '@/components/dashboard/ActivityLog'

export const metadata: Metadata = {
  title: 'Command Center — Curator Dashboard',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CuratorDashboardPage() {
  // ── Auth guard ──────────────────────────────────────────────
  const user = await getCurrentUser()

  if (!user) redirect('/auth/login?next=/dashboard/curator')
  if (!['curator', 'admin'].includes(user.profile?.role ?? '')) {
    redirect('/')
  }

  const profile = user.profile!

  // ── Data — parallel ─────────────────────────────────────────
  const { ownMarkets, spaces, featuredSlots, recentActivityLog, searchableMakers } =
    await getCuratorDashboardData(user.id)

  // ── Summary stats ────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]
  const liveNow = ownMarkets.filter(
    (m) => m.status === 'live' || m.status === 'community_live'
  )
  const todayMarkets = ownMarkets.filter((m) => m.event_date === today)
  const totalCheckins = ownMarkets.reduce((sum, m) => sum + m.checkin_count, 0)
  const featuredCount = featuredSlots.filter((s) => s.pinned !== null).length

  return (
    <>
      <SiteHeader user={user} />

      <main className="min-h-dvh bg-parchment">
        {/* ── Black command header ── */}
        <div className="bg-ink border-b-[3px] border-ink">
          <div className="max-w-6xl mx-auto px-4 py-5">
            {/* Classification */}
            <p className="font-tag text-xs tracking-[0.22em] uppercase text-stamp mb-3">
              CURATOR COMMAND CENTER · INTERNAL USE ONLY · REF: MCL-2026-
              {profile.id.slice(0, 6).toUpperCase()}
            </p>

            {/* Identity */}
            <div className="flex items-end gap-5 flex-wrap mb-5">
              <div>
                <h1 className="font-display font-black text-[clamp(36px,8vw,56px)] uppercase tracking-tight leading-none text-parchment mb-2">
                  {profile.display_name.toUpperCase()}
                </h1>
                <p className="font-tag text-xs tracking-[0.16em] uppercase text-parchment/40">
                  Curator · Lisbon ·{' '}
                  {liveNow.length > 0 ? (
                    <span className="text-stamp font-bold">
                      {liveNow.length} MARKET{liveNow.length > 1 ? 'S' : ''} LIVE NOW
                    </span>
                  ) : (
                    'No markets live right now'
                  )}
                </p>
              </div>

              {/* Add market — primary CTA in the header */}
              <div className="ml-auto">
                <CreateMarketForm spaces={spaces} />
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex gap-0 border-[2px] border-parchment/10 overflow-hidden">
              {[
                {
                  label: 'MARKETS SCHEDULED',
                  value: ownMarkets.length,
                  sub: 'NEXT 60 DAYS',
                },
                {
                  label: 'LIVE RIGHT NOW',
                  value: liveNow.length,
                  sub: liveNow.length > 0 ? liveNow.map((m) => m.space.name).join(' · ') : 'NONE ACTIVE',
                  highlight: liveNow.length > 0,
                },
                {
                  label: 'TODAY',
                  value: todayMarkets.length,
                  sub: todayMarkets.length > 0
                    ? todayMarkets.map((m) => m.space.name).join(' · ')
                    : 'NO MARKETS TODAY',
                },
                {
                  label: 'TOTAL CHECKINS',
                  value: totalCheckins,
                  sub: 'ACROSS ALL MARKETS',
                },
                {
                  label: "CURATOR'S CHOICE",
                  value: `${featuredCount}/3`,
                  sub: featuredCount === 3 ? 'SPOTLIGHT FULL' : 'SLOTS AVAILABLE',
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex-1 px-4 py-3 border-r-[2px] border-parchment/10 last:border-r-0 min-w-0"
                >
                  <p
                    className={`font-display font-black text-2xl leading-none mb-1 truncate ${
                      stat.highlight ? 'text-stamp' : 'text-parchment'
                    }`}
                  >
                    {typeof stat.value === 'number'
                      ? String(stat.value).padStart(2, '0')
                      : stat.value}
                  </p>
                  <p className="font-tag text-xs tracking-widest uppercase text-parchment/30 leading-tight">
                    {stat.label}
                    <br />
                    <span className="opacity-60 text-[10px] tracking-wider truncate block">{stat.sub}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Dashboard body ── */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Technical manual sub-header */}
          <div className="flex items-center gap-4 mb-5 pb-4 border-b border-dashed border-ink">
            <div>
              <p className="font-tag text-xs tracking-[0.28em] uppercase text-ink/30">
                COMMAND CENTER — CURATOR PROTOCOL
              </p>
              <p className="font-tag text-xs tracking-[0.14em] uppercase text-ink/20 mt-0.5">
                Document: FP-CUR-001 through FP-CUR-003 · Classification: CURATOR USE ONLY
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-tag text-xs tracking-[0.14em] uppercase text-ink/20">
                {new Date()
                  .toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                  .toUpperCase()}
              </p>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">

            {/* LEFT — Market Ledger (full width on mobile, 2/3 on desktop) */}
            <div className="space-y-5">
              {/* §1 Market Ledger */}
              <div style={{ border: '3px solid #1a1a1a' }}>
                <div className="flex items-center justify-between bg-ink px-4 py-3 border-b-[3px] border-ink">
                  <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
                    §1 — MARKET MANIFESTO
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-tag text-xs font-bold tracking-widest uppercase ${
                        liveNow.length > 0 ? 'text-stamp' : 'text-parchment/25'
                      }`}
                    >
                      {liveNow.length > 0
                        ? `${liveNow.length} LIVE`
                        : `${ownMarkets.length} TOTAL`}
                    </span>
                    <span className="font-tag text-xs text-parchment/30">FP-CUR-001</span>
                  </div>
                </div>

                {/* Instruction */}
                <div className="bg-parchment-2 px-4 py-2 border-b-[2px] border-ink/15 flex items-center justify-between">
                  <p className="font-tag text-xs tracking-wide uppercase text-ink/40">
                    Click a row to see checked-in makers and verify attendance.
                  </p>
                  <span className="font-tag text-xs tracking-widest uppercase text-ink/25">
                    ☂ CANCEL RAIN = RED CARD
                  </span>
                </div>

                <MarketLedger markets={ownMarkets} />
              </div>
            </div>

            {/* RIGHT — Spotlight + Activity */}
            <div className="space-y-5">
              {/* §2 Spotlight Pins */}
              <SpotlightPins
                slots={featuredSlots}
                searchableMakers={searchableMakers}
              />

              {/* §3 Activity Log */}
              <ActivityLog entries={recentActivityLog} />

              {/* Quick stats card */}
              <div style={{ border: '3px solid #1a1a1a' }}>
                <div className="bg-ink px-4 py-3 border-b-[3px] border-ink">
                  <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
                    §4 — MARKET STATUS KEY
                  </span>
                </div>
                <div className="bg-parchment p-4 space-y-2">
                  {[
                    { dot: 'bg-stamp', label: 'LIVE', desc: 'Curator opened · on the map now' },
                    { dot: 'bg-grove', label: 'COMMUNITY', desc: `${ownMarkets[0]?.checkin_threshold ?? 3}+ checkins · auto-flipped` },
                    { dot: 'bg-parchment-3 border border-ink/20', label: 'SCHEDULED', desc: 'Upcoming · not yet open' },
                    { dot: 'bg-ink/20 border border-dashed border-ink/20', label: 'UNCONFIRMED', desc: 'Shadow · needs confirmation' },
                    { dot: 'bg-ink', label: 'CANCELLED', desc: 'Rain / no-show · Red card issued' },
                  ].map(({ dot, label, desc }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className={`w-3 h-3 flex-shrink-0 ${dot}`} style={{ borderRadius: '2px' }} />
                      <span className="font-tag font-bold text-xs tracking-widest uppercase text-ink w-28 flex-shrink-0">
                        {label}
                      </span>
                      <span className="font-tag text-xs text-ink/40 tracking-wide">
                        {desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
