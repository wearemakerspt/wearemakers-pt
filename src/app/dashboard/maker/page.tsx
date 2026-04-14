import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/queries/auth'
import { getMakerDashboardData } from '@/lib/queries/maker'
import { getMakerAnalytics } from '@/lib/queries/analytics'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/components/ui/SiteHeader'
import LiveToggle from '@/components/dashboard/LiveToggle'
import FieldNotesEditor from '@/components/dashboard/FieldNotesEditor'
import CheckInPanel from '@/components/dashboard/CheckInPanel'
import UpcomingAgenda from '@/components/dashboard/UpcomingAgenda'
import RecentAttendance from '@/components/dashboard/RecentAttendance'
import BrandProfileEditor from '@/components/dashboard/BrandProfileEditor'
import FieldKit from '@/components/dashboard/FieldKit'
import PendingApproval from '@/components/dashboard/PendingApproval'
import GemSubmissionForm from '@/components/dashboard/GemSubmissionForm'
import MakerAnalytics from '@/components/dashboard/MakerAnalytics'
import MakerLeads from '@/components/dashboard/MakerLeads'

export const metadata: Metadata = {
  title: 'Field Transmitter — Maker Dashboard',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif"

// Section wrapper and header styles
const S: React.CSSProperties = {
  margin: '12px 12px 0',
  border: B,
  background: PAPER,
}
const SH: React.CSSProperties = {
  background: INK, color: WHITE,
  padding: '9px 14px',
  fontFamily: FM, fontWeight: 700, fontSize: '11px',
  letterSpacing: '0.2em', textTransform: 'uppercase',
  borderBottom: B,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}

export default async function MakerDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login?next=/dashboard/maker')
  if (user.profile?.role !== 'maker' && user.profile?.role !== 'admin') redirect('/')

  const profile = user.profile!

  if (profile.role !== 'admin' && !profile.is_approved) {
    return (
      <PendingApproval
        role="maker"
        displayName={profile.display_name ?? 'Maker'}
      />
    )
  }

  const supabase = await createClient()

  const [
    { activeCheckins, recentAttendance, upcomingMarkets },
    spacesRes,
    gemsRes,
    analytics,
    leadsRes,
    photosRes,
    membersRes,
  ] = await Promise.all([
    getMakerDashboardData(user.id),
    supabase.from('spaces').select('id, name, parish').eq('is_active', true).order('name'),
    supabase.from('gems')
      .select('id, name, category, description, is_approved, near_space_id')
      .eq('vetted_by', user.id)
      .order('is_approved', { ascending: false }),
    getMakerAnalytics(user.id),
    supabase.from('brand_followers')
      .select('email, opted_in_at')
      .eq('brand_id', user.id)
      .order('opted_in_at', { ascending: false }),
    supabase.from('brand_photos')
      .select('id, photo_url, caption, sort_order')
      .eq('brand_id', user.id)
      .order('sort_order'),
    supabase.from('brand_members')
      .select('id, name, role, photo_url, bio, sort_order')
      .eq('brand_id', user.id)
      .order('sort_order'),
  ])

  const spaces = (spacesRes.data ?? []) as { id: string; name: string; parish: string | null }[]
  const spaceMap = new Map(spaces.map(s => [s.id, s.name]))
  const existingGems = (gemsRes.data ?? []).map(g => ({
    ...g,
    space: { name: spaceMap.get(g.near_space_id) ?? '' },
  }))
  const leads = (leadsRes.data ?? []) as { email: string; opted_in_at: string }[]
  const photos = (photosRes.data ?? []) as { id: string; photo_url: string; caption: string; sort_order: number }[]
  const members = (membersRes.data ?? []) as { id: string; name: string; role: string | null; photo_url: string | null; bio: string | null; sort_order: number }[]

  const todayStr = new Date().toISOString().split('T')[0]
  const todayMarkets = upcomingMarkets.filter(um => um.market.event_date === todayStr)
  const isLive = activeCheckins.length > 0
  const isProfileComplete = !!(profile.bio && profile.slug && (profile.bio_i18n as any)?._category)
  const profileCompleteness = [
    !!profile.bio,
    !!(profile.bio_i18n as any)?._category,
    !!profile.instagram_handle,
    !!(profile.bio_i18n as any)?._price_range,
  ].filter(Boolean).length

  return (
    <>
      <SiteHeader user={user} liveCount={isLive ? 1 : 0} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        {/* ── Dark header ── */}
        <div style={{ background: INK, borderBottom: B, padding: '20px 16px 16px' }}>
          <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, marginBottom: '14px' }}>
            MAKER DASHBOARD · FIELD TRANSMITTER · WO#WM-2026-{profile.id.slice(-6).toUpperCase()}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ width: '64px', height: '64px', flexShrink: 0, border: '2px solid rgba(244,241,236,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(244,241,236,0.06)', overflow: 'hidden' }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: FH, fontWeight: 900, fontSize: '24px', color: RED }}>{profile.display_name.slice(0, 2).toUpperCase()}</span>
              }
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(32px,8vw,52px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.88, color: WHITE }}>
                  {profile.display_name.toUpperCase()}
                </h1>
                {profile.is_verified && (
                  <span style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: WHITE, border: '1px solid rgba(244,241,236,0.3)', padding: '2px 8px' }}>
                    ✦ PRO
                  </span>
                )}
              </div>
              <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Maker · Lisbon
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(244,241,236,0.1)', paddingTop: '14px', flexWrap: 'wrap' }}>
            {[
              { label: 'MARKETS ATTENDED', value: recentAttendance.length, sub: 'LAST 30 DAYS' },
              { label: 'UPCOMING', value: upcomingMarkets.length, sub: 'NEXT 60 DAYS' },
              { label: 'CONFIRMED', value: upcomingMarkets.filter(u => u.is_attending).length, sub: 'I WILL BE THERE' },
              { label: isLive ? 'LIVE' : 'OFFLINE', value: '', sub: isLive ? 'ON MAP NOW' : 'NOT VISIBLE' },
            ].map((s, i) => (
              <div key={i} style={{ paddingRight: '24px', marginRight: '24px', borderRight: i < 3 ? '1px solid rgba(244,241,236,0.1)' : 'none' }}>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '28px', color: i === 3 && isLive ? RED : WHITE, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '2px' }}>{s.label}</div>
                <div style={{ fontFamily: FM, fontSize: '10px', color: 'rgba(244,241,236,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Protocol subheader ── */}
        <div style={{ background: PAPER, borderBottom: B, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: STONE }}>WORK ORDER — FIELD PROTOCOL</div>
          <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: STONE }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
          </div>
        </div>

        <div style={{ padding: '0' }}>

          {/* Onboarding banner */}
          {!isProfileComplete && (
            <div style={{ margin: '12px 12px 0', border: `2px solid ${RED}`, background: 'rgba(232,0,28,.04)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ flexShrink: 0, fontFamily: FH, fontWeight: 900, fontSize: '32px', color: RED, lineHeight: 1 }}>!</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FM, fontWeight: 700, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: RED, marginBottom: '8px' }}>COMPLETE YOUR PROFILE TO GO LIVE</div>
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: '14px', color: STONE, lineHeight: 1.6, marginBottom: '12px' }}>
                    Visitors can't find you until your profile is complete. Fill in §0 below to appear on the platform.
                  </div>
                  <div style={{ height: '3px', background: 'rgba(12,12,12,0.1)', marginBottom: '10px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(profileCompleteness / 4) * 100}%`, background: profileCompleteness >= 3 ? '#1a5c30' : RED, transition: 'width .3s' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {[
                      { label: 'Bio — describe your work', done: !!profile.bio },
                      { label: 'Category — what do you make', done: !!(profile.bio_i18n as any)?._category },
                      { label: 'Instagram handle', done: !!profile.instagram_handle },
                      { label: 'Price range', done: !!(profile.bio_i18n as any)?._price_range },
                    ].map((item, i) => (
                      <div key={i} style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: item.done ? '#1a5c30' : STONE, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700 }}>{item.done ? '✓' : '○'}</span>
                        <span style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* §0 Brand Profile */}
          <div style={S}>
            <div style={SH}>
              <span>§0 — BRAND PROFILE</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-000</span>
            </div>
            <BrandProfileEditor
              initialName={profile.display_name}
              initialBio={profile.bio ?? null}
              initialInstagram={profile.instagram_handle ?? null}
              initialSlug={profile.slug ?? null}
              initialCategory={(profile.bio_i18n as any)?._category ?? null}
              initialPriceRange={(profile.bio_i18n as any)?._price_range ?? null}
              initialAvatarUrl={profile.avatar_url ?? null}
              initialFeaturedPhotoUrl={(profile as any).featured_photo_url ?? null}
              initialShopUrl={(profile as any).shop_url ?? null}
              initialWhatsapp={(profile as any).whatsapp ?? null}
              initialPhotos={photos}
              initialMembers={members}
              userId={profile.id}
            />
          </div>

          {/* §1 Transmission Status */}
          <div style={S}>
            <div style={SH}>
              <span>§1 — TRANSMISSION STATUS</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-001</span>
            </div>
            <LiveToggle initialIsActive={isLive} displayName={profile.display_name} activeCheckins={activeCheckins} todayMarkets={todayMarkets} />
          </div>

          {/* §2 Field Notes / Daily Offer */}
          <div style={S}>
            <div style={SH}>
              <span>§2 — FIELD NOTES / DAILY OFFER</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-002</span>
            </div>
            <FieldNotesEditor
              initialOffer={profile.digital_offer ?? ''}
              initialPrivateNotes={(profile.bio_i18n as any)?._private_notes ?? ''}
              initialOfferActive={(profile.bio_i18n as any)?._offer_active !== false}
            />
          </div>

          {/* §3 Active Check-ins (only when live) */}
          {activeCheckins.length > 0 && (
            <div style={S}>
              <div style={{ ...SH, background: '#1a5c30' }}>
                <span>§3 — ACTIVE CHECK-INS</span>
                <span style={{ opacity: 0.5, fontSize: '9px' }}>FP-003</span>
              </div>
              <CheckInPanel activeCheckins={activeCheckins} todayMarkets={todayMarkets} />
            </div>
          )}

          {/* §4 Upcoming Agenda */}
          <div style={S}>
            <div style={SH}>
              <span>§4 — UPCOMING AGENDA</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-004</span>
            </div>
            <UpcomingAgenda markets={upcomingMarkets} />
          </div>

          {/* §5 Recent Attendance */}
          <div style={S}>
            <div style={SH}>
              <span>§5 — RECENT ATTENDANCE</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-005</span>
            </div>
            <RecentAttendance attendance={recentAttendance} />
          </div>

          {/* §6 Field Kit */}
          <div style={S}>
            <div style={SH}>
              <span>§6 — FIELD KIT · STALL CARD</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-006</span>
            </div>
            <FieldKit
              displayName={profile.display_name}
              slug={profile.slug ?? null}
              category={(profile.bio_i18n as any)?._category ?? null}
              instagramHandle={profile.instagram_handle ?? null}
              priceRange={(profile.bio_i18n as any)?._price_range ?? null}
            />
          </div>

          {/* §7 Hidden Gems */}
          <div style={S}>
            <div style={SH}>
              <span>§7 — HIDDEN GEMS · SUBMIT A RECOMMENDATION</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-007</span>
            </div>
            <GemSubmissionForm spaces={spaces} existingGems={existingGems as any} />
          </div>

          {/* §8 Analytics */}
          <div style={S}>
            <div style={SH}>
              <span>§8 — REACH & ANALYTICS</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-008</span>
            </div>
            <MakerAnalytics byMarket={analytics.byMarket} summary={analytics.summary} />
          </div>

          {/* §9 Email Leads */}
          <div style={{ ...S, margin: '12px 12px 12px' }}>
            <div style={SH}>
              <span>§9 — EMAIL LEADS · YOUR AUDIENCE</span>
              <span style={{ opacity: 0.3, fontSize: '9px' }}>FP-009</span>
            </div>
            <MakerLeads leads={leads} brandName={profile.display_name} />
          </div>

        </div>
      </main>
    </>
  )
}
