import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/queries/auth'
import LoginForm from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Access Circuit',
  description: 'Sign in to WEAREMAKERS.PT — Maker and Curator login.',
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams

  // Already logged in — skip to dashboard
  const user = await getCurrentUser()
  if (user) {
    redirect(next ?? '/')
  }

  return (
    <main className="min-h-dvh bg-parchment flex flex-col items-center justify-center p-6">
      {/* 4px viewport border */}
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
            Lisbon Street Markets · Maker & Curator Portal
          </p>
        </div>

        {/* Header */}
        <div className="border-4 border-ink shadow-hard mb-8">
          <div className="bg-ink px-5 py-4">
            <p className="font-tag text-xs tracking-widest uppercase text-stamp">
              ACCESS CIRCUIT
            </p>
            <h1 className="font-display font-black text-5xl uppercase tracking-tight leading-none text-parchment mt-1">
              SIGN IN
            </h1>
          </div>

          <div className="bg-parchment p-5">
            {error && (
              <div className="mb-4 border-l-4 border-stamp bg-red-50 px-4 py-3">
                <p className="font-tag text-xs tracking-wide uppercase text-stamp font-bold">
                  {decodeURIComponent(error)}
                </p>
              </div>
            )}

            <LoginForm redirectTo={next} />
          </div>
        </div>

        {/* Register link */}
        <p className="font-tag text-xs tracking-wide uppercase text-center text-ink/40">
          No account?{' '}
          <a
            href="/auth/register"
            className="text-ink border-b-2 border-ink/20 hover:border-stamp hover:text-stamp transition-colors"
          >
            Apply for access →
          </a>
        </p>
      </div>
    </main>
  )
}
