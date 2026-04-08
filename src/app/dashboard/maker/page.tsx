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
import BrandProfileEditor from '@/components/dashboard/BrandProfileEditor'

export const metadata: Metadata = {
  title: 'Field Transmitter — Maker Dashboard',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function MakerDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login?next=/dashboard/maker')
  if (user.profile?.role !== 'maker' && user.profile?.role !== 'admin') redirect('/')

  const profile = user.profile!
  const { activeCheckins, recentAttendance, upcomingMarkets } = await getMakerDashboardData(user.id)
  const todayStr = new Date().toISOString().split('T')[0]
  const todayMarkets = upcomingMarkets.filter(um => um.market.event_date === todayStr)
  const isLive = activeCheckins.length > 0

  return (
    <>
      <SiteHeader user={user} liveCount={isLive ? 1 : 0} />

      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* ── Black header ── */}
        <div style={{ background: 'var(--INK)', borderBottom: '3px solid var(--INK)', padding: '16px 16px 14px' }}>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--RED)', marginBottom: '10px' }}>
            MAKER DASHBOARD · FIELD TRANSMITTER · WO#WM-2026-{profile.id.slice(0, 6).toUpperCase()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {/* Avatar */}
            <div style={{ width: '64px', height: '64px', flexShrink: 0, border: '3px solid rgba(240,236,224,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(240,236,224,.08)', overflow: 'hidden' }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '24px', color: 'var(--RED)' }}>{profile.display_name.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(32px,8vw,52px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.88, color: 'var(--P)' }}>
                  {profile.display_name.toUpperCase()}
                </h1>
                {profile.is_verified && (
                  <span style={{ fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--P)', border: '2px solid rgba(240,236,224,.3)', padding: '2px 8px' }}>
                    ✦ PRO
                  </span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--TAG)', fontSize: '11px', color: 'rgba(240,236,224,.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Maker · Lisbon
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid rgba(240,236,224,.1)', paddingTop: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'MARKETS ATTENDED', value: recentAttendance.length, sub: 'LAST 30 DAYS' },
              { label: 'UPCOMING', value: upcomingMarkets.length, sub: 'NEXT 60 DAYS' },
              { label: 'CONFIRMED', value: upcomingMarkets.filter(u => u.is_attending).length, sub: 'I WILL BE THERE' },
              { label: isLive ? 'LIVE' : 'OFFLINE', value: '', sub: isLive ? 'ON MAP NOW' : 'NOT VISIBLE' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: '24px', marginRight: '24px', borderRight: i < 3 ? '1px solid rgba(240,236,224,.1)' : 'none' }}>
                <div style={{ fontFamily: 'var(--MONO)', fontWeight: 800, fontSize: '28px', color: i === 3 && isLive ? 'var(--RED)' : 'var(--P)', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(240,236,224,.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px' }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: 'var(--TAG)', fontSize: '9px', color: 'rgba(240,236,224,.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Field Protocol header ── */}
        <div style={{ background: 'var(--P2)', borderBottom: '3px solid var(--INK)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--INK)', opacity: 0.4 }}>
            WORK ORDER — FIELD PROTOCOL
          </div>
          <div style={{ fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--INK)', opacity: 0.3 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        {/* ── Work order sections ── */}
        <div style={{ padding: '0' }}>

          {/* §1 Live Toggle */}
          <div className="wo" style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div className="wo-hdr" style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>§1 — TRANSMISSION STATUS</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-001</span>
            </div>
            <div style={{ padding: '0' }}>
              <LiveToggle initialIsActive={isLive} displayName={profile.display_name} />
            </div>
          </div>

          {/* §2 Field Notes */}
          <div className="wo" style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div className="wo-hdr" style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>§2 — FIELD NOTES / DAILY OFFER</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-002</span>
            </div>
            <div style={{ padding: '12px' }}>
              <FieldNotesEditor initialOffer={profile.digital_offer ?? ''} />
            </div>
          </div>

          {/* §3 Check-in panel */}
          {activeCheckins.length > 0 && (
            <div className="wo" style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
              <div className="wo-hdr" style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>§3 — ACTIVE CHECK-INS</span>
                <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-003</span>
              </div>
              <div style={{ padding: '0' }}>
                <CheckInPanel checkins={activeCheckins} todayMarkets={todayMarkets} />
              </div>
            </div>
          )}

          {/* §4 Upcoming agenda */}
          <div className="wo" style={{ margin: '12px 12px 0', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
            <div className="wo-hdr" style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>§4 — UPCOMING AGENDA</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-004</span>
            </div>
            <div style={{ padding: '0' }}>
              <UpcomingAgenda markets={upcomingMarkets} />
            </div>
          </div>

          {/* §5 Recent attendance */}
          {recentAttendance.length > 0 && (
            <div className="wo" style={{ margin: '12px 12px 12px', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)', background: 'var(--P2)' }}>
              <div className="wo-hdr" style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', fontFamily: 'var(--TAG)', fontWeight: 700, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '3px solid var(--INK)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>§5 — RECENT ATTENDANCE</span>
                <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-005</span>
              </div>
              <div style={{ padding: '0' }}>
                <RecentAttendance attendance={recentAttendance} />
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
