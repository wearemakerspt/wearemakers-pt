'use client'

import { useState, useTransition } from 'react'
import { saveBrandProfile } from '@/app/dashboard/maker/actions'

interface Props {
  initialName: string
  initialBio: string | null
  initialInstagram: string | null
  initialSlug: string | null
  initialCategory?: string | null  // stored as JSON array string or single value
}

const CATEGORIES = [
  'Ceramics', 'Leather', 'Textile', 'Paper', 'Jewellery',
  'Glass', 'Woodwork', 'Zines', 'Books', 'Art & Prints',
  'Food', 'Accessories', 'Handmade',
  'Gifts for Him', 'Gifts for Her', 'Gifts Under €20',
  'Men's Accessories', 'T-shirts & Hoodies', 'Other',
]

export default function BrandProfileEditor({
  initialName, initialBio, initialInstagram, initialSlug, initialCategory
}: Props) {
  const [name, setName] = useState(initialName)
  const [bio, setBio] = useState(initialBio ?? '')
  const [instagram, setInstagram] = useState(initialInstagram ?? '')
  // Multi-select up to 3 categories
  const [categories, setCategories] = useState<string[]>(() => {
    if (!initialCategory) return []
    return initialCategory.split(',').map(c => c.trim()).filter(Boolean)
  })

  function toggleCategory(cat: string) {
    setCategories(prev => {
      if (prev.includes(cat)) return prev.filter(c => c !== cat)
      if (prev.length >= 3) return prev // max 3
      return [...prev, cat]
    })
  }
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
  const labelStyle = { ...T, color: 'rgba(24,22,20,.45)', display: 'block', marginBottom: '6px' }
  const fieldStyle = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dashed rgba(24,22,20,.3)', padding: '8px 0', fontFamily: 'var(--MONO)', fontSize: '16px', color: 'var(--INK)', outline: 'none' }
  const dividerStyle = { marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed rgba(24,22,20,.15)' }

  return (
    <div style={{ background: 'var(--P)', padding: '16px' }}>
      <form action={handleSubmit}>

        {/* Brand name */}
        <div style={dividerStyle}>
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

        {/* Categories — up to 3 */}
        <div style={dividerStyle}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={labelStyle}>CATEGORIES — WHAT DO YOU MAKE? (pick up to 3)</label>
            <span style={{ ...T, fontSize: '10px', color: categories.length >= 3 ? 'var(--RED)' : 'rgba(24,22,20,.3)' }}>
              {categories.length}/3
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CATEGORIES.map(cat => {
              const selected = categories.includes(cat)
              const disabled = !selected && categories.length >= 3
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  disabled={disabled}
                  style={{
                    ...T, fontSize: '10px', padding: '6px 12px',
                    border: `2px solid ${selected ? 'var(--INK)' : 'rgba(24,22,20,.2)'}`,
                    background: selected ? 'var(--INK)' : 'transparent',
                    color: selected ? 'var(--P)' : disabled ? 'rgba(24,22,20,.2)' : 'rgba(24,22,20,.5)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                  }}
                >
                  {selected ? `✓ ${cat}` : cat}
                </button>
              )
            })}
          </div>
          <input type="hidden" name="category" value={categories.join(',')} />
          {categories.length > 0 && (
            <div style={{ ...T, fontSize: '10px', color: 'var(--GRN)', marginTop: '8px', fontWeight: 700 }}>
              {categories.join(' · ')}
            </div>
          )}
          {categories.length >= 3 && (
            <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', marginTop: '4px' }}>
              MAX 3 CATEGORIES REACHED
            </div>
          )}
        </div>

        {/* Bio */}
        <div style={dividerStyle}>
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
        <div style={dividerStyle}>
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

        <input type="hidden" name="slug" value={slug} />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
          {saved && <span style={{ ...T, fontWeight: 700, color: 'var(--GRN)' }}>✓ PROFILE SAVED</span>}
          {error && <span style={{ ...T, fontWeight: 700, color: 'var(--RED)' }}>✗ {error}</span>}
        </div>

        {initialSlug && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed rgba(24,22,20,.15)' }}>
            <a href={`/brands/${initialSlug}`} target="_blank"
              style={{ ...T, color: 'var(--RED)', textDecoration: 'none', fontWeight: 700 }}>
              VIEW PUBLIC PROFILE →
            </a>
          </div>
        )}
      </form>
    </div>
  )
}
