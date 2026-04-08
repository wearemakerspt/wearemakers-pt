import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

/**
 * Dashboard layout — no additional chrome beyond what each
 * dashboard page provides. The `SiteHeader` is rendered inside
 * each page (it needs the auth user, which is fetched per-page).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
