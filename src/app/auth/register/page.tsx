import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/queries/auth'
import RegisterForm from '@/components/auth/RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the Circuit',
  description: 'Apply to join WEAREMAKERS.PT as a Maker or Curator.',
  robots: { index: false, follow: false },
}

export default async function RegisterPage() {
  const user = await getCurrentUser()
  if (user) redirect('/')

  return (
    <main className="min-h-dvh bg-parchment flex flex-col items-center justify-center p-6">
      <div className="fixed inset-1 border-4 border-ink pointer-events-none z-50" />

      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="mb-8">
          <a
            href="/journal"
            className="font-display font-black text-4xl uppercase tracking-tight leading-none text-ink hover:text-stamp transition-colors"
          >
            WE ARE<span className="text-stamp">MAKERS.PT</span>
          </a>
          <p className="font-tag text-xs tracking-widest uppercase text-ink/40 mt-2">
            Lisbon Street Markets · Join the Circuit
          </p>
        </div>

        <div className="border-4 border-ink shadow-hard mb-8">
          <div className="bg-ink px-5 py-4">
            <p className="font-tag text-xs tracking-widest uppercase text-stamp">
              NEW ACCOUNT
            </p>
            <h1 className="font-display font-black text-5xl uppercase tracking-tight leading-none text-parchment mt-1">
              JOIN
            </h1>
          </div>

          <div className="bg-parchment p-5">
            <div className="mb-5 border-l-4 border-stamp pl-4">
              <p className="font-tag text-xs tracking-wide uppercase text-ink/50 leading-relaxed">
                Applications are reviewed by the Mercado Fora team within 48h.
                Makers and Curators only — visitors browse without an account.
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>

        <p className="font-tag text-xs tracking-wide uppercase text-center text-ink/40">
          Already have an account?{' '}
          <a
            href="/auth/login"
            className="text-ink border-b-2 border-ink/20 hover:border-stamp hover:text-stamp transition-colors"
          >
            Sign in →
          </a>
        </p>
      </div>
    </main>
  )
}
