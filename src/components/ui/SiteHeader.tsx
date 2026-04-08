import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import type { AuthUser } from '@/types/database'

interface Props {
  user: AuthUser | null
  liveCount?: number
}

export default function SiteHeader({ user, liveCount = 0 }: Props) {
  return (
    <header
      className="flex items-stretch bg-parchment sticky top-0 z-40"
      style={{ borderBottom: '3px solid #181614', borderLeft: '4px solid #c8291a', height: '56px' }}
    >
      {/* Wordmark */}
      <Link
        href="/"
        className="flex items-center px-4 group transition-colors flex-shrink-0"
        style={{ borderRight: '3px solid #181614' }}
      >
        <span
          className="font-display font-black uppercase tracking-tight leading-none transition-colors"
          style={{ fontSize: 'clamp(18px,4vw,28px)', color: '#181614' }}
        >
          WEARE<span style={{ color: '#c8291a' }}>MAKERS.PT</span>
        </span>
      </Link>

      {/* Tagline — desktop only */}
      <div
        className="hidden lg:flex items-center px-4"
        style={{ borderRight: '1px solid rgba(24,22,20,.15)' }}
      >
        <span className="font-tag text-xs uppercase" style={{ letterSpacing: '0.16em', color: 'rgba(24,22,20,.35)' }}>
          Lisbon Street Markets · Independent Makers
        </span>
      </div>

      {/* Right cells */}
      <div className="flex items-stretch ml-auto">
        {/* Live counter — green */}
        <Link
          href="/"
          className="flex items-center gap-2 px-4 font-tag text-xs uppercase transition-colors hover:bg-ink hover:text-parchment"
          style={{ borderLeft: '3px solid #181614', letterSpacing: '0.14em', color: '#1a5c30' }}
        >
          <span
            className="animate-pulse-dot"
            style={{ width: '7px', height: '7px', background: '#1a5c30', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }}
          />
          {liveCount > 0 ? `${liveCount} LIVE` : 'LIVE'}
        </Link>

        {/* Markets */}
        <Link
          href="/markets"
          className="hidden sm:flex items-center px-4 font-tag text-xs uppercase transition-colors hover:bg-ink hover:text-parchment"
          style={{ borderLeft: '3px solid #181614', letterSpacing: '0.14em', color: '#181614' }}
        >
          MARKETS
        </Link>

        {/* Brands */}
        <Link
          href="/brands"
          className="hidden md:flex items-center px-4 font-tag text-xs uppercase transition-colors hover:bg-ink hover:text-parchment"
          style={{ borderLeft: '3px solid #181614', letterSpacing: '0.14em', color: '#181614' }}
        >
          BRANDS
        </Link>

        {/* Journal */}
        <Link
          href="/journal"
          className="hidden md:flex items-center px-4 font-tag text-xs uppercase transition-colors hover:bg-ink hover:text-parchment"
          style={{ borderLeft: '3px solid #181614', letterSpacing: '0.14em', color: '#181614' }}
        >
          JOURNAL
        </Link>

        {/* Auth */}
        {user ? (
          <div className="flex items-stretch">
            <Link
              href={`/dashboard/${user.profile?.role ?? 'maker'}`}
              className="flex items-center px-4 font-tag text-xs uppercase transition-colors hover:bg-ink hover:text-parchment"
              style={{ borderLeft: '3px solid #181614', letterSpacing: '0.14em', color: '#181614' }}
            >
              {user.profile?.display_name?.split(' ')[0].toUpperCase() ?? 'DASHBOARD'}
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="h-full flex items-center px-4 font-tag text-xs uppercase transition-colors hover:bg-stamp"
                style={{ borderLeft: '3px solid #181614', background: '#181614', color: '#f0ece0', letterSpacing: '0.14em' }}
              >
                EXIT
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="flex items-center px-4 font-tag text-xs uppercase transition-colors hover:bg-stamp"
            style={{ borderLeft: '3px solid #181614', background: '#181614', color: '#f0ece0', letterSpacing: '0.14em' }}
          >
            ACCESS →
          </Link>
        )}
      </div>
    </header>
  )
}
