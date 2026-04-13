import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import type { AuthUser } from '@/types/database'

interface Props {
  user: AuthUser | null
  liveCount?: number
}

export default function SiteHeader({ user, liveCount = 0 }: Props) {
  const role = user?.profile?.role

  return (
    <header id="masthead" style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 200 }}>
      {/* Logo — always visible */}
      <Link href="/" className="mh-logo">
        <span className="mh-logo-text">
          WEARE<span className="mh-logo-pt">MAKERS.PT</span>
        </span>
      </Link>

      {/* Tagline — desktop only */}
      <div className="mh-tagline">
        Lisbon Street Markets · Independent Makers
      </div>

      {/* Right cells — hidden on mobile, shown on desktop */}
      <div className="mh-right mh-desktop-only">

        {/* Live counter */}
        <Link href="/" className="mh-cell live-cell">
          <span className="pdot" />
          {liveCount > 0 ? `${liveCount} LIVE` : 'LIVE'}
        </Link>

        <Link href="/markets" className="mh-cell">MARKETS</Link>
        <Link href="/brands" className="mh-cell">BRANDS</Link>
        <Link href="/journal" className="mh-cell">JOURNAL</Link>
        <Link href="/gems" className="mh-cell">GEMS</Link>
        <Link href="/circuit" className="mh-cell">MY CIRCUIT</Link>

        {/* Auth */}
        {user ? (
          <>
            <Link
              href={
                role === 'admin' ? '/dashboard/admin'
                : role === 'curator' ? '/dashboard/curator'
                : '/dashboard/maker'
              }
              className="mh-cell"
            >
              DASHBOARD
            </Link>
            <form action={signOut} style={{ display: 'flex' }}>
              <button type="submit" className="mh-cell inv">EXIT</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/welcome" className="mh-cell">JOIN</Link>
            <Link href="/auth/login" className="mh-cell inv">ACCESS →</Link>
          </>
        )}
      </div>

      {/* Mobile right — login/exit only */}
      <div className="mh-mobile-auth">
        {user ? (
          <form action={signOut} style={{ display: 'flex' }}>
            <button type="submit" className="mh-cell inv" style={{ fontSize: '10px', padding: '0 12px' }}>EXIT</button>
          </form>
        ) : (
          <Link href="/auth/login" className="mh-cell inv" style={{ fontSize: '10px', padding: '0 12px' }}>ACCESS →</Link>
        )}
      </div>
    </header>
  )
}
