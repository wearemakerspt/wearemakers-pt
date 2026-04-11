'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/',
    label: 'LIVE',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="4" fill={active ? '#c8291a' : 'currentColor'} />
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity={active ? 1 : 0.4} />
      </svg>
    ),
  },
  {
    href: '/markets',
    label: 'MARKETS',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="8" width="18" height="12" rx="0" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0} />
        <path d="M2 8 L11 2 L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <rect x="8" y="13" width="6" height="7" fill="currentColor" opacity={active ? 0.5 : 0.3} />
      </svg>
    ),
  },
  {
    href: '/brands',
    label: 'BRANDS',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
        <rect x="12" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
        <rect x="3" y="12" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
        <rect x="12" y="12" width="7" height="7" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
      </svg>
    ),
  },
  {
    href: '/gems',
    label: 'GEMS',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polygon points="11,2 20,8 17,19 5,19 2,8" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} strokeLinejoin="round" />
        <circle cx="11" cy="11" r="2" fill={active ? '#c8291a' : 'currentColor'} opacity={active ? 1 : 0.5} />
      </svg>
    ),
  },
  {
    href: '/circuit',
    label: 'CIRCUIT',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 19C11 19 3 13.5 3 8.5C3 5.46 5.46 3 8.5 3C9.96 3 11 4 11 4C11 4 12.04 3 13.5 3C16.54 3 19 5.46 19 8.5C19 13.5 11 19 11 19Z"
          stroke="currentColor" strokeWidth="1.5"
          fill={active ? '#c8291a' : 'none'}
          fillOpacity={active ? 0.8 : 0}
        />
      </svg>
    ),
  },
]

// Pages where the tab bar should NOT show
const HIDDEN_ON = ['/dashboard', '/auth', '/pitch', '/espacos', '/welcome']

export default function MobileTabBar() {
  const pathname = usePathname()

  // Hide on dashboard, auth, and acquisition pages
  if (HIDDEN_ON.some(prefix => pathname.startsWith(prefix))) return null

  return (
    <>
      {/* Spacer so content isn't hidden behind tab bar */}
      <div style={{ height: '64px', display: 'block' }} className="mobile-tab-spacer" />

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9000,
          background: '#181614',
          borderTop: '3px solid #181614',
          display: 'flex',
          height: '64px',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        className="mobile-tab-bar"
      >
        {TABS.map(tab => {
          const active = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                textDecoration: 'none',
                color: active ? '#f0ece0' : 'rgba(240,236,224,0.35)',
                borderRight: '1px solid rgba(240,236,224,0.06)',
                transition: 'color 0.1s',
                paddingTop: '4px',
              }}
            >
              {tab.icon(active)}
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '8px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                lineHeight: 1,
                color: active ? '#c8291a' : 'rgba(240,236,224,0.3)',
                fontWeight: active ? 700 : 400,
              }}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* CSS — only show on mobile */}
      <style>{`
        .mobile-tab-bar { display: none; }
        .mobile-tab-spacer { display: none; }
        @media (max-width: 767px) {
          .mobile-tab-bar { display: flex !important; }
          .mobile-tab-spacer { display: block !important; }
        }
      `}</style>
    </>
  )
}
