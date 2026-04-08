'use client'

import { useState } from 'react'
import { signUp } from '@/app/auth/actions'

export default function RegisterForm() {
  const [role, setRole] = useState<'maker' | 'curator'>('maker')
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    formData.set('role', role)
    await signUp(formData)
    setPending(false)
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Role selector */}
      <div>
        <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
          I am a *
        </label>
        <div className="grid grid-cols-2 border-2 border-ink shadow-hard-xs">
          <button
            type="button"
            onClick={() => setRole('maker')}
            className={`font-display font-black text-xl uppercase tracking-tight px-4 py-4 transition-colors border-r-2 border-ink ${
              role === 'maker'
                ? 'bg-ink text-parchment'
                : 'bg-parchment text-ink hover:bg-parchment-2'
            }`}
          >
            MAKER
            <span className="block font-tag font-normal text-xs tracking-wide mt-1 opacity-55">
              I sell at markets
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRole('curator')}
            className={`font-display font-black text-xl uppercase tracking-tight px-4 py-4 transition-colors ${
              role === 'curator'
                ? 'bg-ink text-parchment'
                : 'bg-parchment text-ink hover:bg-parchment-2'
            }`}
          >
            CURATOR
            <span className="block font-tag font-normal text-xs tracking-wide mt-1 opacity-55">
              I run markets
            </span>
          </button>
        </div>
      </div>

      {/* Display name */}
      <div>
        <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
          Brand / Display Name *
        </label>
        <input
          type="text"
          name="display_name"
          required
          placeholder="e.g. OAKWALL"
          className="w-full bg-transparent border-b-2 border-dashed border-ink px-0 py-2 font-mono text-base text-ink placeholder:text-ink/25 focus:outline-none focus:border-solid transition-all"
        />
      </div>

      {/* Instagram */}
      <div>
        <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
          Instagram Handle
        </label>
        <input
          type="text"
          name="instagram_handle"
          placeholder="@yourhandle"
          className="w-full bg-transparent border-b-2 border-dashed border-ink px-0 py-2 font-mono text-base text-ink placeholder:text-ink/25 focus:outline-none focus:border-solid transition-all"
        />
      </div>

      {/* Email */}
      <div>
        <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="maker@wearemakers.pt"
          className="w-full bg-transparent border-b-2 border-dashed border-ink px-0 py-2 font-mono text-base text-ink placeholder:text-ink/25 focus:outline-none focus:border-solid transition-all"
        />
      </div>

      {/* Password */}
      <div>
        <label className="font-tag text-xs tracking-widest uppercase text-ink/45 block mb-2">
          Password * (min. 8 characters)
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••••••"
          className="w-full bg-transparent border-b-2 border-dashed border-ink px-0 py-2 font-mono text-base text-ink placeholder:text-ink/25 focus:outline-none focus:border-solid transition-all"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink text-parchment border-2 border-ink font-tag font-bold text-xs tracking-widest uppercase px-5 py-4 shadow-hard btn-press hover:bg-stamp hover:border-stamp transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'SUBMITTING...' : 'APPLY FOR ACCESS →'}
        </button>
        <p className="font-tag text-xs tracking-wide uppercase text-ink/35 mt-3 text-center">
          Applications reviewed within 48h
        </p>
      </div>
    </form>
  )
}
