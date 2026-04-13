import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const metadata: Metadata = {
  title: 'Terms of Service — WEAREMAKERS.PT',
  description: 'Terms of Service for WEAREMAKERS.PT — Lisbon street market discovery platform.',
}

export default async function TermsPage() {
  const user = await getCurrentUser()
  const T = { fontFamily: 'var(--TAG)', letterSpacing: '0.18em', textTransform: 'uppercase' as const }
  const body = { fontFamily: 'var(--MONO)', fontSize: '16px', color: 'rgba(24,22,20,.75)', lineHeight: 1.85 }
  const h2 = { fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '24px', textTransform: 'uppercase' as const, letterSpacing: '-0.01em', color: 'var(--INK)', margin: '32px 0 12px' }

  return (
    <>
      <SiteHeader user={user} />
      <main style={{ background: 'var(--P)', minHeight: '100dvh' }}>
        <div style={{ background: 'var(--INK)', padding: '24px 16px', borderBottom: '3px solid var(--INK)' }}>
          <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700, marginBottom: '8px' }}>LEGAL</div>
          <h1 style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: 'clamp(32px,8vw,52px)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.88, color: 'var(--P)' }}>
            TERMS OF SERVICE
          </h1>
        </div>

        <div style={{ maxWidth: '720px', padding: '32px 16px 64px' }}>
          <p style={{ ...body, marginBottom: '24px' }}>
            Last updated: April 2026. By using WEAREMAKERS.PT you agree to these terms.
          </p>

          <h2 style={h2}>1. What WEAREMAKERS.PT is</h2>
          <p style={body}>WEAREMAKERS.PT is a real-time discovery platform connecting independent makers and artisans at Lisbon street markets with visitors. The platform is free to use for visitors, makers, and market curators.</p>

          <h2 style={h2}>2. User accounts</h2>
          <p style={body}>You may browse the platform without an account. To save brands, receive push notifications, or access maker and curator dashboards, you must register an account. You are responsible for keeping your credentials secure. Maker and curator accounts are subject to approval by the WEAREMAKERS.PT team.</p>

          <h2 style={h2}>3. Content you submit</h2>
          <p style={body}>By submitting content to the platform — including brand profiles, market information, hidden gem recommendations, and field notes — you confirm the content is accurate and that you have the right to share it. WEAREMAKERS.PT reserves the right to remove content that is inaccurate, offensive, or otherwise inappropriate.</p>

          <h2 style={h2}>4. Push notifications</h2>
          <p style={body}>If you subscribe to push notifications, you consent to receive notifications when brands you have saved go live at a market. You can unsubscribe at any time from the Circuit page.</p>

          <h2 style={h2}>5. Third-party services</h2>
          <p style={body}>The platform uses Supabase for data storage and authentication, DeepL for automatic translation, and Open-Meteo for weather data. Google Maps links open in Google's own applications and are subject to Google's terms of service.</p>

          <h2 style={h2}>6. Limitation of liability</h2>
          <p style={body}>WEAREMAKERS.PT is provided as-is. We do not guarantee the accuracy of market schedules, maker check-in status, or hidden gem information. Market conditions change rapidly — always confirm directly with the market or maker before travelling.</p>

          <h2 style={h2}>7. Changes to these terms</h2>
          <p style={body}>We may update these terms from time to time. Continued use of the platform constitutes acceptance of any updated terms.</p>

          <h2 style={h2}>8. Contact</h2>
          <p style={body}>Questions about these terms: <a href="mailto:info@wearemakers.pt" style={{ color: 'var(--RED)' }}>info@wearemakers.pt</a></p>

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '2px solid rgba(24,22,20,.1)' }}>
            <Link href="/privacy" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--RED)', marginRight: '24px' }}>PRIVACY POLICY →</Link>
            <Link href="/" style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)' }}>← HOME</Link>
          </div>
        </div>
      </main>
    </>
  )
}
