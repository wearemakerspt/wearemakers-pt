import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/queries/auth'
import { getMakerDashboardData } from '@/lib/queries/maker'
import SiteHeader from '@/components/ui/SiteHeader'
import LiveToggle from '@/components/dashboard/LiveToggle'
import FieldNotesEditor from '@/components/dashboard/FieldNotesEditor'
import CheckInPanel from '@/components/dashboard/CheckInPanel'
import UpcomingAgenda from '@/components/dashboard/UpcomingAgenda'
import RecentAttendance from '@/components/dashboard/RecentAttendance'

export const metadata: Metadata = {
  title: 'Field Transmitter — Maker Dashboard',
  robots: { index: false, follow: false },
}

// No caching — always fresh for the dashboard
export const dynamic = 'force-dynamic'

export default async function MakerDashboardPage() {
  // ── Auth guard ──────────────────────────────────────────────
  const user = await getCurrentUser()

  if (!user) redirect('/auth/login?next=/dashboard/maker')
  if (user.profile?.role !== 'maker' && user.profile?.role !== 'admin') {
    redirect('/')
  }

  const profile = user.profile!

  // ── Data fetch — parallel ───────────────────────────────────
  const { activeCheckins, recentAttendance, upcomingMarkets } =
    await getMakerDashboardData(user.id)

  // Today's markets (for check-in panel)
  const todayStr = new Date().toISOString().split('T')[0]
  const todayMarkets = upcomingMarkets.filter(
    (um) => um.market.event_date === todayStr
  )

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      <SiteHeader user={user} />

      <main className="min-h-dvh bg-parchment">
        {/* ── Dashboard header — black, authoritative ── */}
        <div className="bg-ink border-b-[3px] border-ink">
          <div className="max-w-5xl mx-auto px-4 py-5">
            {/* Role + WO number */}
            <p className="font-tag text-xs tracking-[0.22em] uppercase text-stamp mb-3">
              MAKER DASHBOARD · FIELD TRANSMITTER · WO#WM-2026-
              {profile.id.slice(0, 6).toUpperCase()}
            </p>

            {/* Identity row */}
            <div className="flex items-end gap-5 flex-wrap">
              {/* Avatar */}
              <div className="w-16 h-16 flex-shrink-0 border-[3px] border-parchment/20 flex items-center justify-center bg-parchment/8">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-display font-black text-2xl text-stamp">
                    {profile.display_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="font-display font-black text-[clamp(36px,8vw,56px)] uppercase tracking-tight leading-none text-parchment">
                    {profile.display_name.toUpperCase()}
                  </h1>
                  {profile.is_verified && (
                    <span
                      className="font-tag font-bold text-xs tracking-widest uppercase text-parchment bg-ink border-[2px] border-parchment/30 px-3 py-1"
                      style={{ boxShadow: '2px 2px 0 0 #d32f2f' }}
                    >
                      ✦ PRO
                    </span>
                  )}
                  {profile.is_active && (
                    <span className="flex items-center gap-2 font-tag text-xs tracking-widest uppercase text-stamp font-bold">
                      <span
                        className="w-2 h-2 bg-stamp animate-pulse-dot flex-shrink-0"
                        style={{ borderRadius: '50%' }}
                      />
                      BROADCASTING
                    </span>
                  )}
                </div>
                <p className="font-tag text-xs tracking-[0.16em] uppercase text-parchment/40">
                  {profile.bio?.slice(0, 80) ?? profile.instagram_handle ?? 'Maker · Lisbon'}
                  {profile.instagram_handle && (
                    <span className="ml-3 text-stamp">{profile.instagram_handle}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex gap-0 mt-5 border-[2px] border-parchment/10 overflow-hidden">
              {[
                {
                  label: 'MARKETS ATTENDED',
                  value: recentAttendance.length,
                  sub: 'LAST 30 DAYS',
                },
                {
                  label: 'UPCOMING',
                  value: upcomingMarkets.filter(um => um.market.event_date > todayStr).length,
                  sub: 'NEXT 60 DAYS',
                },
                {
                  label: 'CONFIRMED',
                  value: upcomingMarkets.filter(um => um.is_attending && um.market.event_date > todayStr).length,
                  sub: 'I WILL BE THERE',
                },
                {
                  label: 'STATUS',
                  value: profile.is_active ? 'LIVE' : 'OFFLINE',
                  sub: profile.is_active ? 'ON MAP NOW' : 'NOT VISIBLE',
                  isStatus: true,
                  isLive: profile.is_active,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex-1 px-4 py-3 border-r-[2px] border-parchment/10 last:border-r-0"
                >
                  <p
                    className={`font-display font-black text-2xl leading-none mb-1 ${
                      stat.isStatus && stat.isLive ? 'text-stamp' : 'text-parchment'
                    }`}
                  >
                    {typeof stat.value === 'number'
                      ? String(stat.value).padStart(2, '0')
                      : stat.value}
                  </p>
                  <p className="font-tag text-xs tracking-widest uppercase text-parchment/30 leading-tight">
                    {stat.label}
                    <br />
                    <span className="opacity-60">{stat.sub}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Work Order body ── */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Technical manual sub-header */}
          <div className="flex items-center gap-4 mb-5 pb-4 border-b border-dashed border-ink">
            <div>
              <p className="font-tag text-xs tracking-[0.28em] uppercase text-ink/30">
                WORK ORDER — FIELD PROTOCOL
              </p>
              <p className="font-tag text-xs tracking-[0.14em] uppercase text-ink/20 mt-0.5">
                Document: FP-001 through FP-005 · Classification: MAKER USE ONLY
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-tag text-xs tracking-[0.14em] uppercase text-ink/20">
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }).toUpperCase()}
              </p>
            </div>
          </div>

          {/* ── Two-column grid on desktop ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-5">
              {/* §1 Live Toggle */}
              <LiveToggle
                initialIsActive={profile.is_active}
                displayName={profile.display_name}
              />

              {/* §2 Field Notes */}
              <FieldNotesEditor initialOffer={profile.digital_offer} />

              {/* §3 Check In */}
              <CheckInPanel
                activeCheckins={activeCheckins}
                todayMarkets={todayMarkets}
              />
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* §4 Upcoming Agenda */}
              <UpcomingAgenda
                markets={upcomingMarkets.filter(
                  (um) => um.market.event_date >= todayStr
                )}
              />

              {/* §5 Attendance Log */}
              <RecentAttendance attendance={recentAttendance} />

              {/* Profile quickview card */}
              <div style={{ border: '3px solid #1a1a1a' }}>
                <div className="flex items-center justify-between bg-ink px-4 py-3 border-b-[3px] border-ink">
                  <span className="font-tag text-xs tracking-[0.22em] uppercase text-parchment/60">
                    §6 — PUBLIC PROFILE
                  </span>
                  <span className="font-tag text-xs text-parchment/30">FP-006</span>
                </div>
                <div className="bg-parchment p-5 space-y-3">
                  <div>
                    <p className="font-tag text-xs tracking-widest uppercase text-ink/35 mb-1">
                      BIO
                    </p>
                    <p className="font-mono text-base text-ink leading-relaxed">
                      {profile.bio ?? (
                        <span className="italic text-ink/30">No bio set</span>
                      )}
                    </p>
                  </div>
                  {profile.digital_offer && (
                    <div className="border-[2px] border-dashed border-ink bg-parchment-2 p-3">
                      <p className="font-tag text-xs tracking-widest uppercase text-ink/35 mb-1">
                        TODAY&apos;S OFFER (LIVE)
                      </p>
                      <p className="font-mono text-base text-ink italic">
                        ✦ {profile.digital_offer}
                      </p>
                    </div>
                  )}
                  <div className="pt-2">
                    <a
                      href={profile.slug ? `/makers/${profile.slug}` : '#'}
                      className="font-tag font-bold text-xs tracking-widest uppercase text-ink border-[2px] border-ink px-4 py-2 inline-block hover:bg-ink hover:text-parchment transition-colors"
                      style={{ boxShadow: '3px 3px 0 0 #1a1a1a' }}
                    >
                      VIEW PUBLIC PROFILE →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
