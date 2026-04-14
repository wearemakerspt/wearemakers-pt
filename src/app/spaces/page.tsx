import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Market Spaces — WEAREMAKERS.PT',
  description: 'Permanent locations for Lisbon street markets.',
  alternates: { canonical: '/spaces' },
}

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', PAPER = '#EDE9E2', STONE = '#6B6560'
const B = '2px solid #0C0C0C', Bsm = '1px solid rgba(12,12,12,0.15)'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

export default async function SpacesPage() {
  const [user, supabase] = await Promise.all([getCurrentUser(), createClient()])
  const sb = await supabase
  const { data: spaces } = await sb
    .from('spaces')
    .select('id, name, slug, address, parish, city, description')
    .eq('is_active', true)
    .order('name')

  return (
    <>
      <SiteHeader user={user} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>

        <style>{`
          .space-row:hover { background: #d8d2c4 !important; }
          @media (max-width: 860px) {
            .spaces-hero { padding: 40px 24px 32px !important; flex-direction: column !important; align-items: flex-start !important; }
            .space-row { padding: 0 24px !important; }
          }
        `}</style>

        {/* Page hero */}
        <div className="spaces-hero" style={{ borderBottom: B, padding: '56px 52px 48px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: STONE, marginBottom: '8px' }}>
              {spaces?.length ?? 0} PERMANENT LOCATIONS
            </div>
            <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(64px,8vw,112px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: INK }}>
              MARKET<br />SPACES
            </h1>
          </div>
          <div style={{ fontFamily: FM, fontSize: '9.5px', letterSpacing: '0.14em', color: STONE, maxWidth: '240px', lineHeight: 1.7, textTransform: 'uppercase' }}>
            Permanent locations where Lisbon's independent makers set up their stalls.
          </div>
        </div>

        {/* Space list */}
        {(spaces ?? []).map((space, i) => (
          <Link
            key={space.id}
            href={`/spaces/${space.slug}`}
            className="space-row"
            style={{
              textDecoration: 'none', display: 'grid',
              gridTemplateColumns: '100px 1fr auto',
              alignItems: 'center', padding: '0 52px', height: '72px',
              borderBottom: Bsm,
              background: i % 2 === 0 ? WHITE : PAPER,
              transition: 'background .15s', gap: '24px',
            }}
          >
            <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '32px', color: 'rgba(12,12,12,0.1)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div>
              <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.04em', color: INK }}>{space.name}</div>
              <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.08em', color: STONE, textTransform: 'uppercase' }}>
                {space.parish ?? ''}{space.address ? ` · ${space.address}` : ''}
              </div>
            </div>
            <div style={{ fontFamily: FM, fontSize: '10px', fontWeight: 700, color: RED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              VIEW →
            </div>
          </Link>
        ))}

        {(!spaces || spaces.length === 0) && (
          <div style={{ padding: '64px 40px', textAlign: 'center' }}>
            <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: STONE }}>No spaces listed yet.</div>
          </div>
        )}
      </main>
    </>
  )
}
