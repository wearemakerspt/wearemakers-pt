'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',        label: 'LIVE',    live: true },
  { href: '/markets', label: 'MARKETS', live: false },
  { href: '/brands',  label: 'BRANDS',  live: false },
  { href: '/journal', label: 'JOURNAL', live: false },
  { href: '/gems',    label: 'GEMS',    live: false },
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
                className={`wam-tab${active ? ' wam-tab-active' : ''}${tab.live ? ' wam-tab-live' : ''}`}
              >
                {tab.live && <span className="wam-live-dot">●</span>}
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
