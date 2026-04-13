'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  currentUrl: string | null
  userId: string
  onUpload: (url: string | null) => void
}

export default function FeaturedPhotoUpload({ currentUrl, userId, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const T = { fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Images only (JPG, PNG, WebP)'); return }
    if (file.size > 8 * 1024 * 1024) { setError('Max 8MB per photo'); return }
    setError(null)
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/featured.${ext}`
      const supabase = createClient()
      const { error: upErr } = await supabase.storage
        .from('brand-photos')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('brand-photos').getPublicUrl(path)
      const url = data.publicUrl + '?t=' + Date.now()
      setPreview(url)
      onUpload(url)
      // Save to profiles.featured_photo_url
      await supabase.from('profiles').update({ featured_photo_url: url }).eq('id', userId)
    } catch (e: any) {
      setError(e.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setPreview(null)
    onUpload(null)
    const supabase = createClient()
    await supabase.from('profiles').update({ featured_photo_url: null }).eq('id', userId)
  }

  return (
    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed rgba(24,22,20,.15)' }}>
      <div style={{ ...T, color: 'rgba(24,22,20,.45)', marginBottom: '10px' }}>
        FEATURED PHOTO — SHOWN ON BRAND CARD GRID
      </div>
      <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'rgba(24,22,20,.4)', marginBottom: '12px', lineHeight: 1.5 }}>
        Landscape or square image. Appears as the main photo on the /brands page. Different from your logo.
      </div>

      {preview ? (
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: '180px', height: '120px', flexShrink: 0, overflow: 'hidden', border: '2px solid var(--INK)' }}>
            <img src={preview} alt="Featured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              style={{ ...T, fontWeight: 700, padding: '8px 14px', background: 'var(--INK)', color: 'var(--P)', border: '2px solid var(--INK)', cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}
            >
              {uploading ? 'UPLOADING...' : 'CHANGE PHOTO'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              style={{ ...T, padding: '8px 14px', background: 'transparent', color: 'rgba(24,22,20,.4)', border: '1px solid rgba(24,22,20,.2)', cursor: 'pointer' }}
            >
              REMOVE
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ width: '180px', height: '120px', border: '2px dashed rgba(24,22,20,.25)', background: 'rgba(24,22,20,.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
        >
          <span style={{ fontSize: '28px', opacity: 0.3 }}>◻</span>
          <span style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>{uploading ? 'UPLOADING...' : '+ ADD PHOTO'}</span>
        </button>
      )}

      {error && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', marginTop: '8px', fontWeight: 700 }}>✗ {error}</div>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
