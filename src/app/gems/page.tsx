import type { Metadata } from 'next'
import { getAllGems } from '@/lib/queries/markets'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'
import GemsClient from '@/components/gems/GemsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hidden Gems — WEAREMAKERS.PT',
  description: "Places recommended by Lisbon's independent makers. The best coffee, food, studios and shops near the street markets.",
  alternates: { canonical: '/gems' },
}

const INK = '#1A1A1A', RED = '#E8001C', WHITE = '#F4F1EC', STONE = '#6B6560'
const B = '2px solid #0C0C0C'
const FM = "'Share Tech Mono',monospace", FH = "'Barlow Condensed',sans-serif", FB = "'Barlow',sans-serif"

export default async function GemsPage() {
  const [gems, user] = await Promise.all([getAllGems(), getCurrentUser()])

  return (
    <>
      <SiteHeader user={user} />
      <main style={{ background: WHITE, minHeight: '100dvh' }}>
        {/* Dark hero */}
        <div style={{ background: INK, padding: '56px 52px 48px', borderBottom: B }}>
          <div style={{ fontFamily: FM, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: RED, fontWeight: 700, marginBottom: '10px' }}>
            RECOMMENDED BY MAKERS · LISBON
          </div>
          <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(64px,8vw,112px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: WHITE, marginBottom: '20px' }}>
            HIDDEN<br />GEMS
          </h1>
          <p style={{ fontFamily: FB, fontWeight: 300, fontSize: '15px', color: 'rgba(244,241,236,0.5)', lineHeight: 1.7, maxWidth: '480px', margin: 0 }}>
            The best spots near each market — recommended by the independent makers who set up there every week.
          </p>
        </div>
        <GemsClient gems={gems} userId={user?.id ?? null} />
        <style>{`
          @media (max-width: 860px) {
            .gems-hero { padding: 40px 24px 32px !important; }
          }
        `}</style>
      </main>
    </>
  )
}
