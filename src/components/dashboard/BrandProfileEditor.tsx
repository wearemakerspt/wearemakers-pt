'use client'

import { useState, useTransition } from 'react'
import { saveBrandProfile } from '@/app/dashboard/maker/actions'

interface Props {
  initialName: string
  initialBio: string | null
  initialInstagram: string | null
  initialSlug: string | null
}

const CATEGORIES = [
  'Ceramics', 'Leather', 'Textile', 'Paper', 'Jewellery',
  'Glass', 'Woodwork', 'Zines', 'Books', 'Art & Prints',
  'Food', 'Accessories', 'Other',
]

export default function BrandProfileEditor({ initialName, initialBio, initialInstagram, initialSlug }: Props) {
  const [name, setName] = useState(initialName)
  const [bio, setBio] = useState(initialBio ?? '')
  const [instagram, setInstagram] = useState(initialInstagram ?? '')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  async function handleSubmit(formData: FormData) {
    setError(null); setSaved(false)
    startTransition(async () => {
      const result = await saveBrandProfile(formData)
      if (result?.error) { setError(result.error) }
      else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    })
  }

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const fieldStyle = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dashed rgba(24,22,20,.3)', padding: '8px 0', fontFamily: 'var(--MONO)', fontSize: '16px', color: 'var(--INK)', outline: 'none', letterSpacing: '0.02em' }
  const labelStyle = { ...T, color: 'rgba(24,22,20,.45)', display: 'block', marginBottom: '6px' }

  return (
    <div style={{ background: 'var(--P)', padding: '16px' }}>
      <form action={handleSubmit}>

        {/* Brand name */}
        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed rgba(24,22,20,.15)' }}>
          <label style={labelStyle}>BRAND / DISPLAY NAME *</label>
          <input
            name="display_name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. OAKWALL"
            required
            style={{ ...fieldStyle, fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '24px', textTransform: 'uppercase', letterSpacing: '-0.01em' }}
          />
          {name && (
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', marginTop: '4px' }}>
              PUBLIC URL: wearemakers.pt/brands/{slug}
            </div>
          )}
        </div>

        {/* Bio */}
        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed rgba(24,22,20,.15)' }}>
          <label style={labelStyle}>BIO — DESCRIBE YOUR WORK (shown to visitors)</label>
          <textarea
            name="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            placeholder="Hand-thrown stoneware from a studio in Mouraria. Each piece is unique."
            style={{ ...fieldStyle, borderBottom: 'none', border: '1px dashed rgba(24,22,20,.3)', padding: '10px 12px', resize: 'vertical', lineHeight: 1.6 }}
          />
          <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)', marginTop: '4px', textAlign: 'right' }}>
            {bio.length} / 400
          </div>
        </div>

        {/* Instagram */}
        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed rgba(24,22,20,.15)' }}>
          <label style={labelStyle}>INSTAGRAM HANDLE</label>
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px dashed rgba(24,22,20,.3)' }}>
            <span style={{ fontFamily: 'var(--MONO)', fontSize: '16px', color: 'var(--RED)', paddingBottom: '8px', paddingTop: '8px', marginRight: '2px' }}>@</span>
            <input
              name="instagram_handle"
              value={instagram.replace('@', '')}
              onChange={e => setInstagram(e.target.value.replace('@', ''))}
              placeholder="yourbrand"
              style={{ ...fieldStyle, borderBottom: 'none', flex: 1 }}
            />
          </div>
        </div>

        {/* Slug hidden */}
        <input type="hidden" name="slug" value={slug} />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
          <button
            type="submit"
            disabled={isPending || !name}
            style={{
              ...T, fontWeight: 700, color: 'var(--P)', background: 'var(--INK)',
              border: '3px solid var(--INK)', padding: '11px 18px',
              cursor: isPending ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--SHD-SM)', opacity: isPending || !name ? 0.5 : 1,
            }}
          >
            {isPending ? 'SAVING...' : 'SAVE PROFILE →'}
          </button>

          {saved && (
            <span style={{ ...T, fontWeight: 700, color: 'var(--GRN)' }}>✓ PROFILE SAVED</span>
          )}
          {error && (
            <span style={{ ...T, fontWeight: 700, color: 'var(--RED)' }}>✗ {error}</span>
          )}
        </div>

        {/* Public profile link */}
        {initialSlug && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed rgba(24,22,20,.15)' }}>
            <a
              href={`/brands/${initialSlug}`}
              target="_blank"
              style={{ ...T, color: 'var(--RED)', textDecoration: 'none', fontWeight: 700 }}
            >
              VIEW PUBLIC PROFILE →
            </a>
          </div>
        )}
      </form>
    </div>
  )
}
