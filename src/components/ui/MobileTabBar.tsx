'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/',
    label: 'LIVE',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="4" fill={active ? '#c8291a' : 'rgba(240,236,224,0.6)'} />
        <circle cx="11" cy="11" r="8" stroke={active ? '#c8291a' : 'rgba(240,236,224,0.3)'} strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    href: '/markets',
    label: 'MARKETS',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="8" width="18" height="12" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.35)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.1)' : 'none'} />
        <path d="M2 8 L11 2 L20 8" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.35)'} strokeWidth="1.5" fill="none" />
        <rect x="8" y="13" width="6" height="7" fill={active ? 'rgba(240,236,224,0.5)' : 'rgba(240,236,224,0.2)'} />
      </svg>
    ),
  },
  {
    href: '/brands',
    label: 'BRANDS',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="7" height="7" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.35)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.12)' : 'none'} />
        <rect x="12" y="3" width="7" height="7" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.35)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.12)' : 'none'} />
        <rect x="3" y="12" width="7" height="7" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.35)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.12)' : 'none'} />
        <rect x="12" y="12" width="7" height="7" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.35)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.12)' : 'none'} />
      </svg>
    ),
  },
  {
    href: '/gems',
    label: 'GEMS',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <polygon points="11,2 20,8 17,19 5,19 2,8" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.35)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.12)' : 'none'} strokeLinejoin="round" />
        <circle cx="11" cy="11" r="2.5" fill={active ? '#c8291a' : 'rgba(240,236,224,0.4)'} />
      </svg>
    ),
  },
  {
    href: '/circuit',
    label: 'CIRCUIT',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <path d="M11 19C11 19 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C9.96 3 11 4 11 4C11 4 12.04 3 13.5 3C16.54 3 19 5.46 19 8.5C19 13.5 11 19 11 19Z"
          stroke={active ? '#c8291a' : 'rgba(240,236,224,0.35)'}
          strokeWidth="1.5"
          fill={active ? '#c8291a' : 'none'}
          fillOpacity={active ? 0.7 : 0}
        />
      </svg>
    ),
  },
]

// Paths where tab bar should be hidden
const HIDDEN_PREFIXES = ['/dashboard', '/auth', '/pitch', '/espacos', '/welcome']

export default function MobileTabBar() {
  const pathname = usePathname()
  const hidden = HIDDEN_PREFIXES.some(p => pathname.startsWith(p))

  // Always render but use CSS to show/hide on mobile
  // hidden prop controls dashboard/auth pages
  if (hidden) return null

  return (
    <>
      <nav className="wam-mobile-nav">
        {TABS.map(tab => {
          const active = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`wam-tab${active ? ' wam-tab-active' : ''}`}
            >
              {tab.icon(active)}
              <span className="wam-tab-label">{tab.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer — prevents content hiding behind nav */}
      <div className="wam-nav-spacer" />
    </>
  )
}
