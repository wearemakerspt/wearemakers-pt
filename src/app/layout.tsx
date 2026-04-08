import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wearemakers.pt'
  ),
  title: {
    default: 'WEAREMAKERS.PT — Lisbon Street Markets 2026',
    template: '%s | WEAREMAKERS.PT',
  },
  description:
    'Find independent makers, artisans and creators at Lisbon street markets. Live. Today. Around the corner.',
  openGraph: {
    siteName: 'WEAREMAKERS.PT',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c8291a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="WEAREMAKERS" />

        {/* Fonts — preconnect first, then load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,700;0,900;1,900&family=JetBrains+Mono:ital,wght@0,400;0,700;0,800;1,400&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
