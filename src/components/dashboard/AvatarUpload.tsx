'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  currentUrl: string | null
  userId: string
  displayName: string
  onUpload: (url: string) => void
}

export default function AvatarUpload({ currentUrl, userId, displayName, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const initials = displayName.slice(0, 2).toUpperCase()

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Save to profile
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      setPreview(publicUrl)
      onUpload(publicUrl)
    } catch (err: any) {
      setError(err.message || 'Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      {/* Avatar preview */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          width: '80px', height: '80px', flexShrink: 0,
          background: 'var(--INK)', border: '3px solid var(--INK)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {preview ? (
          <img src={preview} alt={displayName} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', color: 'var(--RED)', lineHeight: 1 }}>
            {initials}
          </span>
        )}
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(24,22,20,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...T, fontSize: '9px', color: 'var(--P)' }}>UPLOADING...</span>
          </div>
        )}
      </div>

      {/* Upload controls */}
      <div>
        <div style={{ ...T, fontWeight: 700, color: 'var(--INK)', marginBottom: '6px' }}>
          BRAND PHOTO
        </div>
        <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', marginBottom: '10px', lineHeight: 1.6 }}>
          Square image recommended. JPG or PNG. Max 5MB.<br />
          Appears on your brand card and profile.
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              ...T, fontWeight: 700, fontSize: '10px',
              color: 'var(--P)', background: 'var(--INK)',
              border: '2px solid var(--INK)', padding: '8px 14px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--SHD-SM)', opacity: uploading ? 0.5 : 1,
            }}
          >
            {uploading ? 'UPLOADING...' : preview ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient()
                await supabase.from('profiles').update({ avatar_url: null }).eq('id', userId)
                setPreview(null)
                onUpload('')
              }}
              style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 0' }}
            >
              REMOVE
            </button>
          )}
        </div>
        {error && (
          <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700, marginTop: '6px' }}>
            ✗ {error}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = '' // reset so same file can be re-selected
        }}
      />
    </div>
  )
}
