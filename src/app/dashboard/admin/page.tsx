import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/queries/auth'
import { createClient } from '@/lib/supabase/server'
import SiteHeader from '@/components/ui/SiteHeader'
import AdminSpaces from '@/components/dashboard/admin/AdminSpaces'
import AdminMakers from '@/components/dashboard/admin/AdminMakers'
import AdminCurators from '@/components/dashboard/admin/AdminCurators'
import AdminMarkets from '@/components/dashboard/admin/AdminMarkets'
import AdminVisitors from '@/components/dashboard/admin/AdminVisitors'
import AdminGems from '@/components/dashboard/admin/AdminGems'
import AdminPush from '@/components/dashboard/admin/AdminPush'
import AdminTop20 from '@/components/dashboard/admin/AdminTop20'

export const metadata: Metadata = {
  title: 'Admin — WEAREMAKERS.PT',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login?next=/dashboard/admin')
  if (user.profile?.role !== 'admin') redirect('/')

  const supabase = await createClient()

  const [
    spacesRes,
    makersRes,
    curatorsRes,
    marketsRes,
    visitorsRes,
    gemsRes,
    top20Res,
  ] = await Promise.all([
    supabase.from('spaces').select('*').order('name'),
    supabase.from('profiles')
      .select('id, display_name, slug, instagram_handle, is_verified, is_active, is_approved, applied_at, created_at, bio_i18n')
      .in('role', ['maker', 'admin'])
      .order('display_name'),
    supabase.from('profiles')
      .select('id, display_name, slug, instagram_handle, is_active, is_approved, applied_at, created_at')
      .in('role', ['curator'])
      .order('display_name'),
    supabase.from('markets')
      .select('*, space:spaces(name), curator:profiles(id, display_name)')
      .order('event_date', { ascending: false }),
    supabase.from('profiles')
      .select('id, display_name, created_at')
      .in('role', ['visitor'])
      .order('created_at', { ascending: false }),
    // No joins on gems — avoids RLS blocking nested profile select
    supabase.from('gems')
      .select('id, name, category, description, address, lat, lng, is_approved, vetted_by, near_space_id, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('wam_top20')
      .select('*, maker:profiles(id, display_name, slug, avatar_url, is_verified)')
      .order('position'),
  ])

  const spaces = spacesRes.data ?? []
  const makers = makersRes.data ?? []
  const curators = curatorsRes.data ?? []
  const markets = marketsRes.data ?? []
  const visitors = visitorsRes.data ?? []
  const top20 = top20Res.data ?? []

  // Manually enrich gems with space name and vetted_by name
  const rawGems = gemsRes.data ?? []
  const spaceMap = new Map(spaces.map((s: any) => [s.id, s.name]))
  const makerMap = new Map([...makers, ...curators].map((p: any) => [p.id, p.display_name]))
  const gems = rawGems.map((g: any) => ({
    ...g,
    space: { name: spaceMap.get(g.near_space_id) ?? '', id: g.near_space_id },
    vetted_by: { display_name: makerMap.get(g.vetted_by) ?? g.vetted_by?.slice(0, 8) ?? '' },
  }))

  const searchableMakers = makers
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const pendingMakers = makers.filter((m: any) => !m.is_approved)
  const pendingCurators = curators.filter((c: any) => !c.is_approved)
  const pendingGems = gems.filter((g: any) => !g.is_approved)

  return (
    <>
      <SiteHeader user={user} />
      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>

        {/* Header */}
        <div style={{ background: 'var(--INK)', borderBottom: '3px solid var(--INK)', padding: '16px' }}>
          <div style={{ ...T, color: 'var(--RED)', marginBottom: '8px' }}>
            ADMIN COMMAND CENTER · RESTRICTED ACCESS · REF: WAM-ADMIN-{user.profile.id.slice(-6).toUpperCase()}
          </div>
          <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(32px,8vw,52px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.88, color: 'var(--P)', marginBottom: '14px' }}>
            WAM ADMIN
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, border: '2px solid rgba(240,236,224,.1)', overflow: 'hidden' }}>
            {[
              { label: 'SPACES', value: spaces.length },
              { label: 'MAKERS', value: makers.length },
              { label: 'CURATORS', value: curators.length },
              { label: 'MARKETS', value: markets.length },
              { label: 'VISITORS', value: visitors.length },
              { label: 'PENDING', value: pendingMakers.length + pendingCurators.length, sub: 'APPROVALS' },
              { label: 'GEMS', value: pendingGems.length, sub: 'PENDING' },
            ].map((s, i, arr) => (
              <div key={i} style={{ padding: '8px 14px', borderRight: i < arr.length - 1 ? '1px solid rgba(240,236,224,.1)' : 'none', minWidth: '80px' }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', color: (s.sub === 'APPROVALS' || s.sub === 'PENDING') && s.value > 0 ? 'var(--RED)' : 'var(--P)', lineHeight: 1 }}>
                  {String(s.value).padStart(2, '0')}
                </div>
                <div style={{ ...T, fontSize: '9px', color: 'rgba(240,236,224,.3)', marginTop: '2px' }}>
                  {s.sub ?? s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px' }}>

          <Section num="§1" title="SPACES & LOCATIONS" ref_code="ADM-001">
            <AdminSpaces spaces={spaces} />
          </Section>

          <Section num="§2" title="MARKETS" ref_code="ADM-002">
            <AdminMarkets markets={markets} spaces={spaces} curators={curators} />
          </Section>

          <Section num="§3" title={`MAKERS${pendingMakers.length > 0 ? ` — ${pendingMakers.length} PENDING` : ''}`} ref_code="ADM-003">
            <AdminMakers makers={makers} />
          </Section>

          <Section num="§4" title={`CURATORS${pendingCurators.length > 0 ? ` — ${pendingCurators.length} PENDING` : ''}`} ref_code="ADM-004">
            <AdminCurators curators={curators} spaces={spaces} />
          </Section>

          <Section num="§5" title="VISITORS & EMAILS" ref_code="ADM-005">
            <AdminVisitors visitors={visitors} />
          </Section>

          <Section num="§6" title={`HIDDEN GEMS${pendingGems.length > 0 ? ` — ${pendingGems.length} PENDING` : ''}`} ref_code="ADM-006">
            <AdminGems gems={gems} spaces={spaces} />
          </Section>

          <Section num="§7" title="WAM TOP 20 — FEATURED MAKERS" ref_code="ADM-007">
            <AdminTop20 top20={top20} searchableMakers={searchableMakers} />
          </Section>

          <Section num="§8" title="PUSH NOTIFICATIONS" ref_code="ADM-008">
            <AdminPush />
          </Section>

        </div>
      </main>
    </>
  )
}

function Section({ num, title, ref_code, children }: { num: string; title: string; ref_code: string; children: React.ReactNode }) {
  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  return (
    <div style={{ marginBottom: '12px', border: '3px solid var(--INK)', boxShadow: 'var(--SHD-SM)' }}>
      <div style={{ background: 'var(--INK)', color: 'var(--P)', padding: '9px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--INK)' }}>
        <span style={{ ...T, fontWeight: 700 }}>{num} — {title}</span>
        <span style={{ ...T, fontSize: '9px', opacity: 0.3 }}>{ref_code}</span>
      </div>
      {children}
    </div>
  )
}
