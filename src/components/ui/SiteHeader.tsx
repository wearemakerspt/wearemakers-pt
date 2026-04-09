import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import type { AuthUser } from '@/types/database'

interface Props {
  user: AuthUser | null
  liveCount?: number
}

export default function SiteHeader({ user, liveCount = 0 }: Props) {
  return (
    <header id="masthead" style={{ display: 'flex' }}>
      {/* Logo */}
      <Link href="/" className="mh-logo">
        <span className="mh-logo-text">
          WEARE<span className="mh-logo-pt">MAKERS.PT</span>
        </span>
      </Link>

      {/* Tagline — desktop only */}
      <div className="mh-tagline">
        Lisbon Street Markets · Independent Makers
      </div>

      {/* Right cells */}
      <div className="mh-right">
        {/* Live counter */}
        <Link href="/" className="mh-cell live-cell">
          <span className="pdot" />
          {liveCount > 0 ? `${liveCount} LIVE` : 'LIVE'}
        </Link>

        {/* Markets */}
        <Link href="/markets" className="mh-cell">
          MARKETS
        </Link>

        {/* Circuit */}
        <Link href="/circuit" className="mh-cell">
          CIRCUIT
        </Link>

        {/* Brands */}
        <Link href="/brands" className="mh-cell" style={{ display: 'none' }}>
          BRANDS
        </Link>

        {/* Auth */}
        {user ? (
          <>
            <Link
              href={`/dashboard/${user.profile?.role === 'curator' ? 'curator' : 'maker'}`}
              className="mh-cell"
            >
              {user.profile?.display_name?.split(' ')[0].toUpperCase() ?? 'DASHBOARD'}
            </Link>
            <form action={signOut} style={{ display: 'flex' }}>
              <button type="submit" className="mh-cell inv">
                EXIT
              </button>
            </form>
          </>
        ) : (
          <Link href="/auth/login" className="mh-cell inv">
            ACCESS →
          </Link>
        )}
      </div>
    </header>
  )
}
