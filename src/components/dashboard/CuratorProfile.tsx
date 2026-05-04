'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateCuratorProfile, addCuratorMember, removeCuratorMember, updateMemberPhoto, updateCuratorMember } from '@/app/dashboard/curator/actions'
import AvatarUpload from '@/components/dashboard/AvatarUpload'

interface Member { id: string; name: string; role: string | null; bio: string | null; email: string | null; instagram_handle: string | null; whatsapp: string | null; photo_url: string | null; sort_order: number }

interface Props {
  profile: {
    id: string
    display_name: string
    slug: string | null
    bio: string | null
    avatar_url: string | null
    instagram_handle: string | null
    organisation_url: string | null
    whatsapp: string | null
  }
  initialMembers: Member[]
}

export default function CuratorProfile({ profile, initialMembers }: Props) {
  const [isPending, startTransition] = useTransition()
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [memberError, setMemberError] = useState<string | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)

  async function handleMemberPhoto(memberId: string, file: File, userId: string) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) return
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${userId}/members/${memberId}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
    if (error) return
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await updateMemberPhoto(memberId, publicUrl)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, photo_url: publicUrl } : m))
  }

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const inputStyle = { width: '100%', background: 'var(--P)', border: '2px solid rgba(24,22,20,.2)', padding: '8px 10px', fontFamily: 'var(--MONO)', fontSize: '13px', color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', display: 'block', marginBottom: '4px' }

  function handleSaveProfile(fd: FormData) {
    setSaveError(null)
    setSaveSuccess(false)
    startTransition(async () => {
      const r = await updateCuratorProfile(fd)
      if (r?.error) { setSaveError(r.error) }
      else { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000) }
    })
  }

  function handleAddMember(fd: FormData) {
    setMemberError(null)
    startTransition(async () => {
      const r = await addCuratorMember(fd)
      if (r?.error) { setMemberError(r.error) }
      else {
        setAddingMember(false)
        // Optimistically add placeholder — page will revalidate
        const name = fd.get('name') as string
        const role = (fd.get('role') as string) || null
        const bio = (fd.get('bio') as string) || null
        const email = (fd.get('email') as string) || null
        const instagram_handle = (fd.get('instagram_handle') as string) || null
        const whatsapp = (fd.get('whatsapp') as string) || null
        setMembers(prev => [...prev, { id: crypto.randomUUID(), name, role, bio, email, instagram_handle, whatsapp, photo_url: null, sort_order: prev.length }])
      }
    })
  }

  function handleEditMember(memberId: string, fd: FormData) {
    setMemberError(null)
    startTransition(async () => {
      const r = await updateCuratorMember(memberId, fd)
      if (r?.error) { setMemberError(r.error) }
      else {
        setEditingMemberId(null)
        const name = fd.get('name') as string
        const role = (fd.get('role') as string) || null
        const bio = (fd.get('bio') as string) || null
        const email = (fd.get('email') as string) || null
        const instagram_handle = (fd.get('instagram_handle') as string) || null
        const whatsapp = (fd.get('whatsapp') as string) || null
        setMembers(prev => prev.map(m => m.id === memberId
          ? { ...m, name, role, bio, email, instagram_handle, whatsapp }
          : m
        ))
      }
    })
  }

  function handleRemoveMember(id: string) {
    if (!confirm('Remove this team member?')) return
    setMembers(prev => prev.filter(m => m.id !== id))
    startTransition(async () => { await removeCuratorMember(id) })
  }

  return (
    <div style={{ background: 'var(--P)', padding: '14px' }}>

      {/* Logo upload */}
      <div style={{ marginBottom: '16px' }}>
        <AvatarUpload
          currentUrl={profile.avatar_url}
          userId={profile.id}
          displayName={profile.display_name}
          onUpload={() => {}}
        />
        <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '-8px' }}>
          ORGANISATION LOGO — Square image, JPG or PNG, max 5MB
        </div>
      </div>

      {/* Profile form */}
      <form action={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>ORGANISATION NAME *</label>
            <input name="display_name" defaultValue={profile.display_name} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>INSTAGRAM</label>
            <input name="instagram_handle" defaultValue={profile.instagram_handle ?? ''} placeholder="@handle" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WEBSITE</label>
            <input name="organisation_url" defaultValue={profile.organisation_url ?? ''} placeholder="https://" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>WHATSAPP BUSINESS</label>
            <input name="whatsapp" defaultValue={profile.whatsapp ?? ''} placeholder="+351 9XX XXX XXX" style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>BIO / DESCRIPTION</label>
            <textarea name="bio" defaultValue={profile.bio ?? ''} rows={4}
              style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'var(--MONO)', lineHeight: 1.6 }} />
          </div>
        </div>

        {saveError && <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700 }}>✗ {saveError}</div>}
        {saveSuccess && <div style={{ ...T, fontSize: '10px', color: 'var(--GRN)', fontWeight: 700 }}>✓ SAVED</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="submit" disabled={isPending}
            style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '9px 18px', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}>
            {isPending ? 'SAVING…' : '✓ SAVE PROFILE'}
          </button>
          {profile.slug && (
            <Link href={`/curators/${profile.slug}`} target="_blank"
              style={{ ...T, fontSize: '10px', color: 'var(--RED)', textDecoration: 'none' }}>
              VIEW PUBLIC PAGE →
            </Link>
          )}
        </div>
      </form>

      {/* Divider */}
      <div style={{ borderTop: '2px solid var(--INK)', paddingTop: '16px', marginBottom: '14px' }}>
        <div style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--INK)', marginBottom: '12px' }}>
          TEAM MEMBERS
        </div>

        {memberError && <div style={{ ...T, fontSize: '10px', color: 'var(--RED)', fontWeight: 700, marginBottom: '8px' }}>✗ {memberError}</div>}

        {/* Member list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {members.length === 0 && (
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>No team members yet.</div>
          )}
          {members.map(m => (
            <div key={m.id} style={{ background: 'var(--P2)', border: '1px solid rgba(24,22,20,.1)' }}>
              {editingMemberId === m.id ? (
                <form action={(fd) => handleEditMember(m.id, fd)} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--INK)', marginBottom: '4px' }}>✎ EDITING — {m.name.toUpperCase()}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={labelStyle}>NAME *</label>
                      <input name="name" defaultValue={m.name} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>ROLE</label>
                      <input name="role" defaultValue={m.role ?? ''} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>EMAIL</label>
                      <input name="email" type="email" defaultValue={m.email ?? ''} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>INSTAGRAM</label>
                      <input name="instagram_handle" defaultValue={m.instagram_handle ?? ''} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>WHATSAPP</label>
                      <input name="whatsapp" defaultValue={m.whatsapp ?? ''} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={labelStyle}>BIO</label>
                      <textarea name="bio" defaultValue={m.bio ?? ''} rows={2} style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" disabled={isPending}
                      style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}>
                      {isPending ? 'SAVING…' : '✓ SAVE'}
                    </button>
                    <button type="button" onClick={() => setEditingMemberId(null)}
                      style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', background: 'transparent', border: '1px solid rgba(24,22,20,.2)', padding: '8px 12px', cursor: 'pointer' }}>
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px' }}>
                  {/* Photo */}
                  <label style={{ flexShrink: 0, cursor: 'pointer' }} title="Upload photo">
                    <div style={{ width: '44px', height: '44px', background: 'var(--INK)', border: '2px solid rgba(24,22,20,.2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' as const }}>
                      {m.photo_url
                        ? <img src={m.photo_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '14px', color: 'var(--RED)' }}>{m.name.slice(0,2).toUpperCase()}</span>
                      }
                    </div>
                    <div style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.35)', textAlign: 'center', marginTop: '2px' }}>PHOTO</div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleMemberPhoto(m.id, f, profile.id); e.target.value = '' }} />
                  </label>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', color: 'var(--INK)', lineHeight: 1 }}>{m.name}</div>
                    {m.role && <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginTop: '2px' }}>{m.role}</div>}
                    {m.bio && <div style={{ fontFamily: 'var(--MONO)', fontSize: '11px', color: 'rgba(24,22,20,.5)', marginTop: '4px', lineHeight: 1.5 }}>{m.bio}</div>}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {m.email && <span style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>{m.email}</span>}
                      {m.instagram_handle && <span style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>{m.instagram_handle}</span>}
                      {m.whatsapp && <span style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>{m.whatsapp}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button onClick={() => { setEditingMemberId(m.id); setMemberError(null) }} disabled={isPending}
                      style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(24,22,20,.2)', cursor: 'pointer', background: 'transparent', color: 'var(--INK)' }}>
                      EDIT
                    </button>
                    <button onClick={() => handleRemoveMember(m.id)} disabled={isPending}
                      style={{ ...T, fontSize: '8px', padding: '4px 8px', border: '1px solid rgba(200,41,26,.3)', cursor: 'pointer', background: 'transparent', color: 'var(--RED)' }}>
                      REMOVE
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add member form */}
        {addingMember ? (
          <form action={handleAddMember} style={{ padding: '12px', background: 'var(--P2)', border: '2px solid var(--INK)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>NAME *</label>
                <input name="name" required placeholder="João Silva" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>ROLE</label>
                <input name="role" placeholder="Market Director" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>EMAIL</label>
                <input name="email" type="email" placeholder="joao@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>INSTAGRAM</label>
                <input name="instagram_handle" placeholder="@handle" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>WHATSAPP</label>
                <input name="whatsapp" placeholder="+351 9XX XXX XXX" style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>BIO (OPTIONAL)</label>
                <textarea name="bio" rows={2} style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={isPending}
                style={{ ...T, fontSize: '10px', fontWeight: 700, color: 'var(--P)', background: 'var(--INK)', border: '2px solid var(--INK)', padding: '8px 14px', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}>
                {isPending ? 'ADDING…' : '+ ADD'}
              </button>
              <button type="button" onClick={() => { setAddingMember(false); setMemberError(null) }}
                style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', background: 'transparent', border: '1px solid rgba(24,22,20,.2)', padding: '8px 12px', cursor: 'pointer' }}>
                CANCEL
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setAddingMember(true)}
            style={{ ...T, fontSize: '10px', color: 'var(--INK)', background: 'transparent', border: '2px solid rgba(24,22,20,.3)', padding: '8px 14px', cursor: 'pointer' }}>
            + ADD TEAM MEMBER
          </button>
        )}
      </div>
    </div>
  )
}
