'use client'
import { useState, useTransition } from 'react'
import {
  createArticle,
  updateArticle,
  deleteArticle,
  toggleArticlePublished,
} from '@/app/dashboard/admin/actions'

interface Article {
  id: string
  slug: string
  title: string
  kicker: string | null
  dek: string | null
  lede: string | null
  body_md: string | null
  pull_quote: string | null
  author_name: string | null
  cover_image_url: string | null
  tags: string[] | null
  is_published: boolean
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  created_at: string
}

interface Props {
  articles: Article[]
}

const EMPTY_FORM = {
  title: '',
  kicker: 'NEIGHBORHOOD LOOPS',
  dek: '',
  lede: '',
  body_md: '',
  pull_quote: '',
  author_name: 'WAM Editorial',
  cover_image_url: '',
  tags: '',
  seo_title: '',
  seo_description: '',
  is_published: false,
}

export default function AdminJournal({ articles: initial }: Props) {
  const [articles, setArticles] = useState(initial)
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const T = { fontFamily: 'var(--TAG)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' as const }
  const input = { width: '100%', background: 'var(--P)', border: '2px solid var(--INK)', padding: '9px 12px', fontFamily: 'var(--MONO)', fontSize: '14px', color: 'var(--INK)', outline: 'none', boxSizing: 'border-box' as const }
  const label = { ...T, fontSize: '9px', color: 'rgba(24,22,20,.45)', marginBottom: '5px', display: 'block' }

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setError(null)
    setSuccess(null)
    setMode('create')
  }

  function openEdit(a: Article) {
    setForm({
      title: a.title ?? '',
      kicker: a.kicker ?? 'NEIGHBORHOOD LOOPS',
      dek: a.dek ?? '',
      lede: a.lede ?? '',
      body_md: a.body_md ?? '',
      pull_quote: a.pull_quote ?? '',
      author_name: a.author_name ?? 'WAM Editorial',
      cover_image_url: a.cover_image_url ?? '',
      tags: (a.tags ?? []).join(', '),
      seo_title: a.seo_title ?? '',
      seo_description: a.seo_description ?? '',
      is_published: a.is_published,
    })
    setEditingId(a.id)
    setError(null)
    setSuccess(null)
    setMode('edit')
  }

  function handleTogglePublish(id: string, current: boolean) {
    startTransition(async () => {
      await toggleArticlePublished(id, !current)
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_published: !current } : a))
    })
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteArticle(id)
      setArticles(prev => prev.filter(a => a.id !== id))
    })
  }

  function handleSubmit(fd: FormData) {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      if (mode === 'create') {
        const result = await createArticle(fd)
        if (result?.error) { setError(result.error); return }
        setSuccess('Article created successfully.')
        setMode('list')
      } else if (mode === 'edit' && editingId) {
        const result = await updateArticle(editingId, fd)
        if (result?.error) { setError(result.error); return }
        setSuccess('Article updated.')
        setMode('list')
      }
    })
  }

  // ── List view ──────────────────────────────────────────────
  if (mode === 'list') {
    return (
      <div>
        <div style={{ padding: '12px 14px', borderBottom: '2px solid rgba(24,22,20,.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)' }}>
            {articles.length} ARTICLE{articles.length !== 1 ? 'S' : ''} · {articles.filter(a => a.is_published).length} PUBLISHED
          </div>
          <button
            onClick={openCreate}
            style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: 'var(--RED)', border: '2px solid var(--RED)', padding: '8px 14px', cursor: 'pointer' }}
          >
            + NEW ARTICLE
          </button>
        </div>

        {success && (
          <div style={{ padding: '10px 14px', background: 'rgba(26,92,48,.08)', borderBottom: '2px solid rgba(26,92,48,.2)', ...T, fontSize: '9px', color: 'var(--GRN)', fontWeight: 700 }}>
            ✓ {success}
          </div>
        )}

        {articles.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '28px', textTransform: 'uppercase', color: 'rgba(24,22,20,.1)', marginBottom: '8px' }}>NO ARTICLES YET</div>
            <div style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.3)' }}>Create your first Neighbourhood Loop article.</div>
          </div>
        )}

        {articles.map((a, i) => (
          <div key={a.id} style={{ padding: '12px 14px', borderBottom: '2px solid rgba(24,22,20,.08)', background: i % 2 === 0 ? 'var(--P)' : 'var(--P2)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--INK)', lineHeight: 1 }}>
                  {a.title}
                </div>
                <span style={{ ...T, fontSize: '8px', padding: '2px 6px', background: a.is_published ? 'var(--GRN)' : 'rgba(24,22,20,.12)', color: a.is_published ? '#fff' : 'rgba(24,22,20,.5)', fontWeight: 700 }}>
                  {a.is_published ? 'LIVE' : 'DRAFT'}
                </span>
              </div>
              {a.dek && (
                <div style={{ fontFamily: 'var(--MONO)', fontSize: '13px', color: 'rgba(24,22,20,.5)', lineHeight: 1.4, marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                  {a.dek}
                </div>
              )}
              <div style={{ ...T, fontSize: '8px', color: 'rgba(24,22,20,.3)' }}>
                {a.kicker && `${a.kicker} · `}
                {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                {a.author_name && ` · ${a.author_name.toUpperCase()}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={() => openEdit(a)}
                style={{ ...T, fontSize: '9px', padding: '5px 10px', border: '1px solid rgba(24,22,20,.2)', background: 'transparent', color: 'var(--INK)', cursor: 'pointer' }}
              >
                EDIT
              </button>
              <button
                onClick={() => handleTogglePublish(a.id, a.is_published)}
                disabled={isPending}
                style={{ ...T, fontSize: '9px', padding: '5px 10px', border: `1px solid ${a.is_published ? 'rgba(24,22,20,.2)' : 'var(--GRN)'}`, background: 'transparent', color: a.is_published ? 'rgba(24,22,20,.5)' : 'var(--GRN)', cursor: 'pointer' }}
              >
                {a.is_published ? 'UNPUBLISH' : 'PUBLISH'}
              </button>
              <button
                onClick={() => handleDelete(a.id, a.title)}
                disabled={isPending}
                style={{ ...T, fontSize: '9px', padding: '5px 10px', border: '1px solid rgba(200,41,26,.3)', background: 'transparent', color: 'var(--RED)', cursor: 'pointer' }}
              >
                DEL
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── Create / Edit form ──────────────────────────────────────
  return (
    <div style={{ padding: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid rgba(24,22,20,.08)' }}>
        <div style={{ fontFamily: 'var(--LOGO)', fontWeight: 900, fontSize: '22px', textTransform: 'uppercase', color: 'var(--INK)' }}>
          {mode === 'create' ? 'NEW ARTICLE' : 'EDIT ARTICLE'}
        </div>
        <button
          onClick={() => { setMode('list'); setError(null) }}
          style={{ ...T, fontSize: '9px', padding: '6px 12px', border: '1px solid rgba(24,22,20,.2)', background: 'transparent', color: 'rgba(24,22,20,.5)', cursor: 'pointer' }}
        >
          ← BACK TO LIST
        </button>
      </div>

      {error && (
        <div style={{ ...T, fontSize: '9px', color: 'var(--RED)', fontWeight: 700, marginBottom: '12px', padding: '10px 12px', background: 'rgba(200,41,26,.06)', border: '2px solid var(--RED)' }}>
          ✗ {error}
        </div>
      )}

      <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Row 1: Title + Kicker */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <div>
            <label style={label}>TITLE *</label>
            <input name="title" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="The Intendente Loop" style={input} />
          </div>
          <div>
            <label style={label}>KICKER</label>
            <input name="kicker" value={form.kicker} onChange={e => setForm(p => ({ ...p, kicker: e.target.value }))} placeholder="NEIGHBORHOOD LOOPS" style={input} />
          </div>
        </div>

        {/* Dek */}
        <div>
          <label style={label}>DEK (subtitle shown on article card)</label>
          <input name="dek" value={form.dek} onChange={e => setForm(p => ({ ...p, dek: e.target.value }))} placeholder="A short description of the article..." style={input} />
        </div>

        {/* Lede */}
        <div>
          <label style={label}>LEDE (opening paragraph — larger treatment)</label>
          <textarea name="lede" value={form.lede} onChange={e => setForm(p => ({ ...p, lede: e.target.value }))} placeholder="The first paragraph that draws readers in..." rows={3} style={{ ...input, resize: 'vertical' as const, lineHeight: 1.6 }} />
        </div>

        {/* Body */}
        <div>
          <label style={label}>BODY (Markdown — use ## for section headers)</label>
          <textarea name="body_md" value={form.body_md} onChange={e => setForm(p => ({ ...p, body_md: e.target.value }))} placeholder="## Section header&#10;&#10;Write the full article here in Markdown..." rows={16} style={{ ...input, resize: 'vertical' as const, lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }} />
        </div>

        {/* Pull quote */}
        <div>
          <label style={label}>PULL QUOTE (optional — highlighted excerpt)</label>
          <input name="pull_quote" value={form.pull_quote} onChange={e => setForm(p => ({ ...p, pull_quote: e.target.value }))} placeholder='"A quote that captures the spirit of the piece."' style={input} />
        </div>

        {/* Row: Author + Cover image URL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={label}>AUTHOR NAME</label>
            <input name="author_name" value={form.author_name} onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))} placeholder="WAM Editorial" style={input} />
          </div>
          <div>
            <label style={label}>COVER IMAGE URL (optional)</label>
            <input name="cover_image_url" value={form.cover_image_url} onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))} placeholder="https://..." style={input} />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={label}>TAGS (comma separated)</label>
          <input name="tags" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="mouraria, makers, ceramics, market" style={input} />
        </div>

        {/* SEO */}
        <div style={{ padding: '12px', background: 'rgba(24,22,20,.03)', border: '1px dashed rgba(24,22,20,.15)' }}>
          <div style={{ ...T, fontSize: '9px', color: 'rgba(24,22,20,.4)', marginBottom: '10px' }}>SEO METADATA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={label}>SEO TITLE (leave blank to use article title)</label>
              <input name="seo_title" value={form.seo_title} onChange={e => setForm(p => ({ ...p, seo_title: e.target.value }))} placeholder="The Intendente Loop — WEAREMAKERS.PT" style={input} />
            </div>
            <div>
              <label style={label}>SEO DESCRIPTION (160 chars max)</label>
              <input name="seo_description" value={form.seo_description} onChange={e => setForm(p => ({ ...p, seo_description: e.target.value }))} placeholder="Discover the makers of Intendente..." style={input} />
              <div style={{ ...T, fontSize: '8px', color: form.seo_description.length > 160 ? 'var(--RED)' : 'rgba(24,22,20,.3)', marginTop: '4px' }}>
                {form.seo_description.length}/160
              </div>
            </div>
          </div>
        </div>

        {/* Publish toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: form.is_published ? 'rgba(26,92,48,.06)' : 'rgba(24,22,20,.03)', border: `1px solid ${form.is_published ? 'rgba(26,92,48,.2)' : 'rgba(24,22,20,.1)'}` }}>
          <input
            type="checkbox"
            name="is_published"
            id="is_published"
            checked={form.is_published}
            onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--GRN)' }}
          />
          <label htmlFor="is_published" style={{ ...T, fontSize: '10px', color: form.is_published ? 'var(--GRN)' : 'rgba(24,22,20,.5)', cursor: 'pointer', fontWeight: 700 }}>
            {form.is_published ? '● PUBLISH IMMEDIATELY — visible to all visitors' : '○ SAVE AS DRAFT — not visible to visitors'}
          </label>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button
            type="submit"
            disabled={isPending || !form.title.trim()}
            style={{ ...T, fontWeight: 700, fontSize: '10px', color: 'var(--P)', background: isPending ? 'rgba(24,22,20,.3)' : 'var(--INK)', border: '2px solid var(--INK)', padding: '11px 20px', cursor: isPending ? 'not-allowed' : 'pointer', opacity: !form.title.trim() ? 0.5 : 1 }}
          >
            {isPending ? 'SAVING...' : mode === 'create' ? 'CREATE ARTICLE →' : 'SAVE CHANGES →'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('list'); setError(null) }}
            style={{ ...T, fontSize: '10px', color: 'rgba(24,22,20,.4)', background: 'transparent', border: '1px solid rgba(24,22,20,.15)', padding: '11px 16px', cursor: 'pointer' }}
          >
            CANCEL
          </button>
        </div>

      </form>
    </div>
  )
}
