'use client'
import { useState, useTransition } from 'react'
import { adminCreateProfile } from '@/app/dashboard/admin/actions'

export default function AdminCreateProfile({ spaces, curators }: { spaces: any[]; curators: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState<string>('maker')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = { width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '7px 10px', fontFamily: 'var(--MONO)', fontSize: '13px', color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '4px', display: 'block' as const }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>
      <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'var(--GRY)', marginBottom: '14px', padding: '10px 12px', background: 'rgba(24,22,20,.04)', border: '1px solid rgba(24,22,20,.1)' }}>
        Creates an account directly — bypasses self-registration. Profile is auto-approved. A welcome email is NOT sent. Share credentials with the user manually.
      </div>

      <form
        action={(fd) => {
          setError(null)
          setSuccess(null)
          startTransition(async () => {
            const r = await adminCreateProfile(fd)
            if (r?.error) {
              setError(r.error)
            } else {
              setSuccess(`✓ ${r.role?.toUpperCase()} profile created for ${r.displayName} (${r.email})`)
              // Reset form
              const form = document.getElementById('admin-create-profile-form') as HTMLFormElement
              form?.reset()
              setRole('maker')
            }
          })
        }}
        id="admin-create-profile-form"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>

          {/* Role selector */}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>ROLE *</label>
            <div style={{ display: 'flex', gap: 0, border: '2px solid var(--INK)', overflow: 'hidden' }}>
              {['maker', 'curator', 'visitor'].map((r, i, arr) => (
                <label key={r} style={{ flex: 1, cursor: 'pointer' }}>
                  <input
                    type="radio" name="role" value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ ...T, fontSize: '10px', fontWeight: 700, padding: '8px', textAlign: 'center', background: role === r ? 'var(--INK)' : 'transparent', color: role === r ? 'var(--P)' : 'var(--INK)', borderRight: i < arr.length - 1 ? '1px solid rgba(24,22,20,.2)' : 'none' }}>
                    {r.toUpperCase()}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle}>DISPLAY NAME *</label>
            <input name="display_name" required placeholder="e.g. Cerâmica Lisboa" style={inputStyle} />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>EMAIL *</label>
            <input name="email" type="email" required placeholder="hello@example.com" style={inputStyle} />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>PASSWORD * (min 8 chars)</label>
            <input name="password" type="password" required minLength={8} placeholder="········" style={inputStyle} />
          </div>

          {/* Instagram */}
          <div>
            <label style={labelStyle}>INSTAGRAM HANDLE</label>
            <input name="instagram_handle" placeholder="@handle (without @)" style={inputStyle} />
          </div>

          {/* Curator-only fields */}
          {role === 'curator' && (
            <>
              <div>
                <label style={labelStyle}>WEBSITE URL</label>
                <input name="organisation_url" type="url" placeholder="https://..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>WHATSAPP</label>
                <input name="whatsapp" placeholder="+351 9xx xxx xxx" style={inputStyle} />
              </div>
            </>
          )}

        </div>

        {error && (
          <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700, marginBottom: '10px', padding: '8px 10px', background: 'rgba(200,41,26,.06)', border: '1px solid rgba(200,41,26,.3)' }}>
            ✗ {error}
          </div>
        )}

        {success && (
          <div style={{ ...T, fontSize: '9px', color: 'var(--GRN)', fontWeight: 700, marginBottom: '10px', padding: '8px 10px', background: 'rgba(26,92,48,.06)', border: '1px solid var(--GRN)' }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '9px 18px', cursor: 'pointer' }}
        >
          {isPending ? 'CREATING...' : 'CREATE PROFILE →'}
        </button>
      </form>
    </div>
  )
}
