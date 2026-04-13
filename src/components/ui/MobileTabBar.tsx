'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/',
    label: 'LIVE',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4.5" fill={active ? '#c8291a' : 'rgba(240,236,224,0.5)'} />
        <circle cx="12" cy="12" r="9" stroke={active ? '#c8291a' : 'rgba(240,236,224,0.25)'} strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="12" r="6" stroke={active ? 'rgba(200,41,26,0.35)' : 'rgba(240,236,224,0.12)'} strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    href: '/markets',
    label: 'MARKETS',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="9" width="18" height="12" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.4)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.08)' : 'none'} />
        <path d="M3 9 L12 3 L21 9" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.4)'} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <rect x="9" y="14" width="6" height="7" fill={active ? 'rgba(240,236,224,0.4)' : 'rgba(240,236,224,0.15)'} />
      </svg>
    ),
  },
  {
    href: '/brands',
    label: 'BRANDS',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.4)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.1)' : 'none'} />
        <rect x="13" y="3" width="8" height="8" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.4)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.1)' : 'none'} />
        <rect x="3" y="13" width="8" height="8" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.4)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.1)' : 'none'} />
        <rect x="13" y="13" width="8" height="8" stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.4)'} strokeWidth="1.5" fill={active ? 'rgba(240,236,224,0.1)' : 'none'} />
      </svg>
    ),
  },
  {
    href: '/gems',
    label: 'GEMS',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 21,8 18,20 6,20 3,8"
          stroke={active ? '#f0ece0' : 'rgba(240,236,224,0.4)'}
          strokeWidth="1.5"
          fill={active ? 'rgba(240,236,224,0.08)' : 'none'}
          strokeLinejoin="round"
        />
        <circle cx="12" cy="11" r="3" fill={active ? '#c8291a' : 'rgba(240,236,224,0.3)'} />
      </svg>
    ),
  },
  {
    href: '/circuit',
    label: 'MY CIRCUIT',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C12 21 4 14.5 4 9C4 5.69 6.69 3 10 3C11.2 3 12 3.8 12 3.8C12 3.8 12.8 3 14 3C17.31 3 20 5.69 20 9C20 14.5 12 21 12 21Z"
          stroke={active ? '#c8291a' : 'rgba(240,236,224,0.4)'}
          strokeWidth="1.5"
          fill={active ? '#c8291a' : 'none'}
          fillOpacity={active ? 0.8 : 0}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

const HIDDEN_PREFIXES = ['/dashboard', '/auth', '/pitch', '/espacos', '/welcome']

export default function MobileTabBar() {
  const pathname = usePathname()
  const hidden = HIDDEN_PREFIXES.some(p => pathname.startsWith(p))
  if (hidden) return null

  return (
    <>
      <nav className="wam-mobile-nav">
        <div className="wam-mobile-nav-inner">
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
                <span className="wam-tab-icon">{tab.icon(active)}</span>
                <span className="wam-tab-label">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="wam-nav-spacer" />
    </>
  )
}
