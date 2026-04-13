'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Photo {
  id: string
  photo_url: string
  caption: string
  sort_order: number
}

interface Props {
  brandId: string
  initialPhotos: Photo[]
}

const MAX_PHOTOS = 12

export default function BrandGalleryUpload({ brandId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const T = { fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }

  async function handleFiles(files: FileList) {
    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) { setError(`Maximum ${MAX_PHOTOS} photos reached`); return }

    const toUpload = Array.from(files).slice(0, remaining)
    setError(null)
    setUploading(true)

    try {
      const supabase = createClient()
      const newPhotos: Photo[] = []

      for (const file of toUpload) {
        if (!file.type.startsWith('image/')) continue
        if (file.size > 8 * 1024 * 1024) { setError('Max 8MB per photo'); continue }

        const ext = file.name.split('.').pop()
        const filename = `${brandId}/gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: upErr } = await supabase.storage
          .from('brand-photos')
          .upload(filename, file, { upsert: false })

        if (upErr) { setError(upErr.message); continue }

        const { data } = supabase.storage.from('brand-photos').getPublicUrl(filename)

        const { data: row, error: dbErr } = await supabase
          .from('brand_photos')
          .insert({
            brand_id: brandId,
            photo_url: data.publicUrl,
            sort_order: photos.length + newPhotos.length,
          })
          .select('id, photo_url, caption, sort_order')
          .single()

        if (!dbErr && row) newPhotos.push(row as Photo)
      }

      setPhotos(prev => [...prev, ...newPhotos])
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(photo: Photo) {
    if (!confirm('Remove this photo?')) return
    const supabase = createClient()
    await supabase.from('brand_photos').delete().eq('id', photo.id)
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  async function handleCaptionChange(photoId: string, caption: string) {
    const supabase = createClient()
    await supabase.from('brand_photos').update({ caption }).eq('id', photoId)
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, caption } : p))
  }

  return (
    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed rgba(24,22,20,.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ ...T, color: 'rgba(24,22,20,.45)' }}>PHOTO GALLERY — SHOW YOUR WORK</div>
        <span style={{ ...T, fontSize: '9px', color: photos.length >= MAX_PHOTOS ? 'var(--RED)' : 'rgba(24,22,20,.3)' }}>
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'rgba(24,22,20,.4)', marginBottom: '12px', lineHeight: 1.5 }}>
        Upload up to {MAX_PHOTOS} photos of your products, craft and stall. Shown on your brand profile page.
      </div>

      {error && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', marginBottom: '10px', fontWeight: 700 }}>✗ {error}</div>}

      {/* Photo grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {photos.map(photo => (
          <div key={photo.id} style={{ position: 'relative' as const }}>
            <div style={{ aspectRatio: '1', overflow: 'hidden', border: '2px solid var(--INK)' }}>
              <img src={photo.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <button
              type="button"
              onClick={() => handleDelete(photo)}
              style={{ position: 'absolute' as const, top: '4px', right: '4px', background: 'rgba(24,22,20,.8)', color: '#fff', border: 'none', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
            <input
              type="text"
              placeholder="Caption (optional)"
              defaultValue={photo.caption ?? ''}
              onBlur={e => handleCaptionChange(photo.id, e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--MONO)', fontSize: '11px', color: 'var(--INK)', border: 'none', borderBottom: '1px dashed rgba(24,22,20,.2)', padding: '4px 0', background: 'transparent', outline: 'none', marginTop: '4px' }}
            />
          </div>
        ))}

        {/* Add photo slot */}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{ aspectRatio: '1', border: '2px dashed rgba(24,22,20,.2)', background: 'rgba(24,22,20,.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
          >
            <span style={{ fontSize: '24px', opacity: 0.3 }}>+</span>
            <span style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.3)' }}>{uploading ? 'UPLOADING...' : 'ADD PHOTO'}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.length) handleFiles(e.target.files) }}
      />
    </div>
  )
}
