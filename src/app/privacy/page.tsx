import type { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/queries/auth'
import SiteHeader from '@/components/ui/SiteHeader'

export const metadata: Metadata = {
  title: 'Privacy Policy — WEAREMAKERS.PT',
  description: 'Privacy Policy for WEAREMAKERS.PT — how we handle your data.',
}

export default async function PrivacyPage() {
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
            PRIVACY POLICY
          </h1>
        </div>

        <div style={{ maxWidth: '720px', padding: '32px 16px 64px' }}>
          <p style={{ ...body, marginBottom: '24px' }}>
            Last updated: April 2026. WEAREMAKERS.PT is operated from Lisbon, Portugal and complies with GDPR.
          </p>

          <h2 style={h2}>1. What data we collect</h2>
          <p style={body}>When you register an account we collect your email address, display name, and role (visitor, maker, or curator). Makers additionally provide a brand bio, Instagram handle, and optionally a profile photo. We also collect data about how you use the platform — which brands you save, which markets you visit, and push notification subscriptions.</p>

          <h2 style={h2}>2. How we use your data</h2>
          <p style={body}>Your email address is used to authenticate your account and, if you opt in, to send push notifications when saved brands go live. Maker brand profiles are displayed publicly on the platform. Visitor email addresses collected through the brand save flow (if provided) are shared only with the specific maker whose brand you saved — they are never sold or shared with third parties.</p>

          <h2 style={h2}>3. Data storage</h2>
          <p style={body}>All data is stored on Supabase infrastructure hosted in the EU (Frankfurt, Germany). Profile photos are stored in Supabase Storage. We do not transfer your data outside the European Economic Area.</p>

          <h2 style={h2}>4. Push notifications</h2>
          <p style={body}>If you subscribe to push notifications, your browser's push subscription endpoint is stored securely and used only to deliver market notifications. You can revoke this permission at any time from your browser settings or from the Circuit page.</p>

          <h2 style={h2}>5. Cookies and local storage</h2>
          <p style={body}>We use browser localStorage to store your session preferences (such as whether you have completed the welcome flow) and, for anonymous users, which brands you have saved. We do not use advertising cookies or third-party tracking.</p>

          <h2 style={h2}>6. Translation</h2>
          <p style={body}>Maker bios written in Portuguese are automatically translated to English, Spanish, German, French, and Italian using the DeepL API. The bio text is transmitted to DeepL's servers for this purpose. DeepL is GDPR compliant and does not store or use your content for training.</p>

          <h2 style={h2}>7. Your rights</h2>
          <p style={body}>Under GDPR you have the right to access, correct, or delete your personal data at any time. To exercise these rights, contact us at <a href="mailto:info@wearemakers.pt" style={{ color: 'var(--RED)' }}>info@wearemakers.pt</a>. Account deletion removes all associated profile data, saved brands, and push subscriptions.</p>

          <h2 style={h2}>8. Contact</h2>
          <p style={body}>Data controller: WEAREMAKERS.PT, Lisbon, Portugal. Contact: <a href="mailto:info@wearemakers.pt" style={{ color: 'var(--RED)' }}>info@wearemakers.pt</a></p>

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '2px solid rgba(24,22,20,.1)' }}>
            <Link href="/terms" style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--RED)', marginRight: '24px' }}>TERMS OF SERVICE →</Link>
            <Link href="/" style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)' }}>← HOME</Link>
          </div>
        </div>
      </main>
    </>
  )
}
