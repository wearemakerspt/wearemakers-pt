'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Member {
  id: string
  name: string
  role: string | null
  photo_url: string | null
  bio: string | null
  sort_order: number
}

interface Props {
  brandId: string
  initialMembers: Member[]
}

const MAX_MEMBERS = 3

export default function BrandMembersEditor({ brandId, initialMembers }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newBio, setNewBio] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingPhotoMemberId, setPendingPhotoMemberId] = useState<string | null>(null)

  const T = { fontFamily: 'var(--TAG)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const input = { width: '100%', background: 'transparent', border: 'none', borderBottom: '1px dashed rgba(24,22,20,.3)', padding: '7px 0', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none' }

  async function handleAddMember() {
    if (!newName.trim()) { setError('Name is required'); return }
    setSaving(true); setError(null)
    try {
      const supabase = createClient()
      const { data, error: e } = await supabase
        .from('brand_members')
        .insert({ brand_id: brandId, name: newName.trim(), role: newRole.trim() || null, bio: newBio.trim() || null, sort_order: members.length })
        .select('id, name, role, photo_url, bio, sort_order')
        .single()
      if (e) throw e
      setMembers(prev => [...prev, data as Member])
      setNewName(''); setNewRole(''); setNewBio('')
      setAdding(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('brand_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  async function handlePhotoUpload(memberId: string, file: File) {
    if (!file.type.startsWith('image/')) return
    setUploadingFor(memberId)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${brandId}/member-${memberId}.${ext}`
      const { error: upErr } = await supabase.storage.from('brand-photos').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('brand-photos').getPublicUrl(path)
      const url = data.publicUrl + '?t=' + Date.now()
      await supabase.from('brand_members').update({ photo_url: url }).eq('id', memberId)
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, photo_url: url } : m))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploadingFor(null)
    }
  }

  async function handleFieldUpdate(memberId: string, field: 'name' | 'role' | 'bio', value: string) {
    const supabase = createClient()
    await supabase.from('brand_members').update({ [field]: value || null }).eq('id', memberId)
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, [field]: value || null } : m))
  }

  return (
    <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed rgba(24,22,20,.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ ...T, color: 'rgba(24,22,20,.45)' }}>THE PEOPLE — MEET THE TEAM</div>
        <span style={{ ...T, fontSize: '9px', color: members.length >= MAX_MEMBERS ? 'var(--RED)' : 'rgba(24,22,20,.3)' }}>
          {members.length}/{MAX_MEMBERS}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--MONO)', fontSize: '12px', color: 'rgba(24,22,20,.4)', marginBottom: '14px', lineHeight: 1.5 }}>
        Add up to {MAX_MEMBERS} people behind the brand. Shown on your public profile.
      </div>

      {error && <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', marginBottom: '10px', fontWeight: 700 }}>✗ {error}</div>}

      {/* Member list */}
      {members.map((member, i) => (
        <div key={member.id} style={{ display: 'flex', gap: '14px', padding: '12px 0', borderBottom: '1px dashed rgba(24,22,20,.1)', alignItems: 'flex-start' }}>
          {/* Photo */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{ width: '56px', height: '56px', border: '2px solid var(--INK)', overflow: 'hidden', background: 'rgba(24,22,20,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' as const }}
              onClick={() => { setPendingPhotoMemberId(member.id); fileInputRef.current?.click() }}
            >
              {member.photo_url
                ? <img src={member.photo_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '20px', color: 'rgba(24,22,20,.2)' }}>{member.name.slice(0, 1).toUpperCase()}</span>
              }
              {uploadingFor === member.id && (
                <div style={{ position: 'absolute' as const, inset: 0, background: 'rgba(24,22,20,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...T, fontSize: '7px', color: '#fff' }}>...</span>
                </div>
              )}
            </div>
            <div style={{ ...T, fontSize: '7px', color: 'rgba(24,22,20,.3)', textAlign: 'center' as const, marginTop: '4px' }}>TAP</div>
          </div>

          {/* Fields */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              defaultValue={member.name}
              placeholder="Name"
              onBlur={e => handleFieldUpdate(member.id, 'name', e.target.value)}
              style={{ ...input, fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em' }}
            />
            <input
              defaultValue={member.role ?? ''}
              placeholder="Role (e.g. Founder, Potter, Designer)"
              onBlur={e => handleFieldUpdate(member.id, 'role', e.target.value)}
              style={{ ...input, fontSize: '13px' }}
            />
            <input
              defaultValue={member.bio ?? ''}
              placeholder="One sentence bio (optional)"
              onBlur={e => handleFieldUpdate(member.id, 'bio', e.target.value)}
              style={{ ...input, fontSize: '13px', color: 'rgba(24,22,20,.6)' }}
            />
          </div>

          <button
            type="button"
            onClick={() => handleDelete(member.id)}
            style={{ flexShrink: 0, background: 'none', border: 'none', color: 'rgba(24,22,20,.3)', cursor: 'pointer', fontFamily: 'var(--TAG)', fontSize: '9px', padding: '4px', marginTop: '4px' }}
          >
            REMOVE
          </button>
        </div>
      ))}

      {/* Add member form */}
      {adding && members.length < MAX_MEMBERS && (
        <div style={{ padding: '14px', background: 'rgba(24,22,20,.03)', border: '1px dashed rgba(24,22,20,.15)', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '4px' }}>ADD TEAM MEMBER</div>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name *" style={input} />
          <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role (e.g. Founder, Ceramicist)" style={input} />
          <input value={newBio} onChange={e => setNewBio(e.target.value)} placeholder="One sentence bio (optional)" style={input} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleAddMember}
              disabled={saving || !newName.trim()}
              style={{ ...T, fontWeight: 700, padding: '8px 14px', background: 'var(--INK)', color: 'var(--P)', border: '2px solid var(--INK)', cursor: 'pointer', opacity: saving || !newName.trim() ? 0.5 : 1 }}
            >
              {saving ? 'SAVING...' : 'ADD MEMBER'}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setNewName(''); setNewRole(''); setNewBio('') }}
              style={{ ...T, padding: '8px 14px', background: 'transparent', color: 'rgba(24,22,20,.4)', border: '1px solid rgba(24,22,20,.15)', cursor: 'pointer' }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!adding && members.length < MAX_MEMBERS && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          style={{ ...T, fontWeight: 700, marginTop: '12px', padding: '8px 16px', background: 'transparent', color: 'rgba(24,22,20,.5)', border: '1px dashed rgba(24,22,20,.25)', cursor: 'pointer' }}
        >
          + ADD TEAM MEMBER
        </button>
      )}

      {/* Hidden file input for member photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0]
          if (f && pendingPhotoMemberId) handlePhotoUpload(pendingPhotoMemberId, f)
          setPendingPhotoMemberId(null)
        }}
      />
    </div>
  )
}
