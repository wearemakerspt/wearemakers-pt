'use client'

import { useState } from 'react'
import { signInWithPassword, signInWithMagicLink } from '@/app/auth/actions'

interface Props {
  redirectTo?: string
}

export default function LoginForm({ redirectTo }: Props) {
  const [mode, setMode] = useState<'password' | 'magic'>('password')
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    if (mode === 'password') {
      await signInWithPassword(formData)
    } else {
      await signInWithMagicLink(formData)
    }
    // If we get here, the Server Action redirected, so this won't execute
    setPending(false)
  }

  return (
    <div>
      {/* Mode tabs */}
      <div className="grid grid-cols-2 border-2 border-ink mb-5 shadow-hard-xs">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`font-tag text-xs tracking-widest uppercase px-4 py-3 transition-colors border-r-2 border-ink ${
            mode === 'password' ? 'bg-ink text-parchment' : 'bg-parchment text-ink hover:bg-parchment-2'
          }`}
        >
          PASSWORD
        </button>
        <button
          type="button"
          onClick={() => setMode('magic')}
          className={`font-tag text-xs tracking-widest uppercase px-4 py-3 transition-colors ${
            mode === 'magic' ? 'bg-ink text-parchment' : 'bg-parchment text-ink hover:bg-parchment-2'
          }`}
        >
          MAGIC LINK
        </button>
      </div>

      <form action={handleSubmit}>
        {/* Hidden redirect target */}
        {redirectTo && (
          <input type="hidden" name="next" value={redirectTo} />
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="maker@wearemakers.pt"
            className="w-full bg-transparent border-b-2 border-dashed border-ink px-0 py-2 font-mono text-base text-ink placeholder:text-ink/25 focus:outline-none focus:border-ink focus:border-b-2 focus:border-solid transition-all"
          />
        </div>

        {/* Password — only for password mode */}
        {mode === 'password' && (
          <div className="mb-5">
            <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full bg-transparent border-b-2 border-dashed border-ink px-0 py-2 font-mono text-base text-ink placeholder:text-ink/25 focus:outline-none focus:border-ink focus:border-b-2 focus:border-solid transition-all"
            />
          </div>
        )}

        {mode === 'magic' && (
          <div className="mb-5 border-l-4 border-stamp pl-4">
            <p className="font-tag text-xs tracking-wide uppercase text-ink/45 leading-relaxed">
              We'll email you a one-click sign-in link. No password needed.
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-stamp text-parchment border-2 border-stamp font-tag font-bold text-xs tracking-widest uppercase px-5 py-4 shadow-hard btn-press hover:bg-ink hover:border-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed stamp-noise"
        >
          {pending
            ? 'ENTERING...'
            : mode === 'password'
            ? 'ENTER THE CIRCUIT →'
            : 'SEND MAGIC LINK →'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-ink/15" />
        <span className="font-tag text-xs tracking-widest uppercase text-ink/30">OR</span>
        <div className="flex-1 h-px bg-ink/15" />
      </div>

      {/* Instagram OAuth placeholder */}
      <button
        type="button"
        disabled
        className="w-full bg-parchment text-ink border-2 border-ink font-tag font-bold text-xs tracking-widest uppercase px-5 py-4 shadow-hard-xs opacity-40 cursor-not-allowed"
      >
        CONTINUE WITH INSTAGRAM (COMING SOON)
      </button>
    </div>
  )
}
