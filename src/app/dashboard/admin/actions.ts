'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', supabase: null, user: null }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Not authorized', supabase: null, user: null }
  return { error: null, supabase, user }
}

// ── Spaces ─────────────────────────────────────────────────

export async function createSpace(formData: FormData) {
  const { error, supabase, user } = await getAdminClient()
  if (error || !supabase) return { error }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required' }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const { error: e } = await supabase.from('spaces').insert({
    name, slug,
    address: (formData.get('address') as string)?.trim() || null,
    parish: (formData.get('parish') as string)?.trim() || null,
    city: (formData.get('city') as string)?.trim() || 'Lisbon',
    lat: parseFloat(formData.get('lat') as string) || 0,
    lng: parseFloat(formData.get('lng') as string) || 0,
    is_active: true,
    created_by: user!.id,
  })
  if (e) return { error: e.message }
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function toggleSpaceActive(spaceId: string, active: boolean) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('spaces').update({ is_active: active }).eq('id', spaceId)
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function deleteSpace(spaceId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('spaces').delete().eq('id', spaceId)
  revalidatePath('/dashboard/admin')
  return { success: true }
}

// ── Markets ────────────────────────────────────────────────

export async function adminSetMarketStatus(marketId: string, status: string) {
  const { error, supabase, user } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('markets').update({
    status,
    admin_override: true,
    open_reason: 'admin_override',
    opened_by: user!.id,
    opened_at: new Date().toISOString(),
  }).eq('id', marketId)
  revalidatePath('/dashboard/admin')
}

export async function adminCreateMarket(formData: FormData) {
  const { error, supabase, user } = await getAdminClient()
  if (error || !supabase) return { error }

  const spaceId = formData.get('space_id') as string
  const eventDate = formData.get('event_date') as string
  const eventDateEnd = (formData.get('event_date_end') as string) || null
  const startsAt = formData.get('starts_at') as string
  const endsAt = formData.get('ends_at') as string
  const curatorId = (formData.get('curator_id') as string) || null
  const status = (formData.get('status') as string) || 'scheduled'
  const customTitle = (formData.get('title') as string)?.trim() || null

  if (!spaceId || !eventDate || !startsAt || !endsAt) {
    return { error: 'Space, date and times are required' }
  }

  const { data: space } = await supabase.from('spaces').select('name').eq('id', spaceId).single()
  const title = customTitle || `${space?.name ?? 'Market'} — ${eventDate}`

  const { error: e } = await supabase.from('markets').insert({
    space_id: spaceId,
    curator_id: curatorId,
    title,
    event_date: eventDate,
    event_date_end: eventDateEnd || null,
    starts_at: startsAt,
    ends_at: endsAt,
    status,
    open_reason: status === 'live' ? 'admin_override' : null,
    opened_by: status === 'live' ? user!.id : null,
    opened_at: status === 'live' ? new Date().toISOString() : null,
    admin_override: status === 'live',
    checkin_threshold: 3,
  })
  if (e) return { error: e.message }
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function adminAssignCurator(marketId: string, curatorId: string | null) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('markets').update({ curator_id: curatorId || null }).eq('id', marketId)
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function adminDeleteMarket(marketId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('markets').delete().eq('id', marketId)
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function adminCancelMarket(marketId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }

  // Fetch market + saved visitors emails before cancelling
  const { data: market } = await supabase
    .from('markets')
    .select('title, event_date, space:spaces(name)')
    .eq('id', marketId)
    .single()

  const { data: savedVisitors } = await supabase
    .from('saved_markets')
    .select('visitor:profiles!saved_markets_visitor_id_fkey(id)')
    .eq('market_id', marketId)

  await supabase.from('markets').update({ status: 'cancelled' }).eq('id', marketId)
  revalidatePath('/dashboard/admin')
  revalidatePath('/markets')

  // Send cancellation emails fire-and-forget
  if (market && savedVisitors?.length) {
    const visitorIds = savedVisitors.map((s: any) => s.visitor?.id).filter(Boolean)
    if (visitorIds.length) {
      supabase
        .from('profiles')
        .select('id')
        .in('id', visitorIds)
        .then(async ({ data: visitors }) => {
          // Get emails from auth.users via service role
          const { createClient: sc } = await import('@supabase/supabase-js')
          const serviceClient = sc(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
          const emails: string[] = []
          for (const v of visitors ?? []) {
            const { data } = await serviceClient.auth.admin.getUserById(v.id)
            if (data?.user?.email) emails.push(data.user.email)
          }
          if (emails.length) {
            const { sendMarketCancelledEmails } = await import('@/lib/email')
            await sendMarketCancelledEmails(emails, {
              title: market.title,
              event_date: market.event_date,
              space_name: (market.space as any)?.name ?? '',
              id: marketId,
            })
          }
        }).catch(() => {})
    }
  }

  return { success: true }
}

export async function adminUpdateMarket(marketId: string, formData: FormData) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }

  const title = (formData.get('title') as string)?.trim()
  const spaceId = (formData.get('space_id') as string) || null
  const eventDate = formData.get('event_date') as string
  const eventDateEnd = (formData.get('event_date_end') as string) || null
  const startsAt = formData.get('starts_at') as string
  const endsAt = formData.get('ends_at') as string
  const curatorId = (formData.get('curator_id') as string) || null

  if (!title || !eventDate || !startsAt || !endsAt) {
    return { error: 'Title, date and times are required' }
  }

  const { error: e } = await supabase.from('markets').update({
    title,
    space_id: spaceId || undefined,
    event_date: eventDate,
    event_date_end: eventDateEnd || null,
    starts_at: startsAt,
    ends_at: endsAt,
    curator_id: curatorId || null,
    updated_at: new Date().toISOString(),
  }).eq('id', marketId)

  if (e) return { error: e.message }
  revalidatePath('/dashboard/admin')
  revalidatePath('/markets')
  return { success: true }
}

// ── Makers ─────────────────────────────────────────────────

export async function toggleVerifiedBadge(makerId: string, verified: boolean) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').update({
    is_verified: verified,
    verified_since: verified ? new Date().toISOString() : null,
  }).eq('id', makerId)
  revalidatePath('/dashboard/admin')
}

export async function toggleMakerActive(makerId: string, active: boolean) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').update({ is_active: active }).eq('id', makerId)
  revalidatePath('/dashboard/admin')
}

export async function deleteMaker(makerId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').delete().eq('id', makerId)
  revalidatePath('/dashboard/admin')
}

export async function approveMaker(makerId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').update({
    is_approved: true,
    is_active: true,
  }).eq('id', makerId)
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function rejectMaker(makerId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').delete().eq('id', makerId)
  revalidatePath('/dashboard/admin')
  return { success: true }
}

// ── Curators ───────────────────────────────────────────────

export async function deleteCurator(curatorId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').delete().eq('id', curatorId)
  revalidatePath('/dashboard/admin')
}

export async function assignCuratorToSpace(curatorId: string, spaceId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('markets').update({ curator_id: curatorId })
    .eq('space_id', spaceId)
    .is('curator_id', null)
  revalidatePath('/dashboard/admin')
}

export async function approveCurator(curatorId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').update({
    is_approved: true,
    is_active: true,
  }).eq('id', curatorId)
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function rejectCurator(curatorId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').delete().eq('id', curatorId)
  revalidatePath('/dashboard/admin')
  return { success: true }
}

// ── Visitors ───────────────────────────────────────────────

export async function deleteVisitor(visitorId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('profiles').delete().eq('id', visitorId)
  revalidatePath('/dashboard/admin')
}

export async function downloadVisitorEmails() {
  return { success: true }
}

// ── Gems ───────────────────────────────────────────────────

export async function approveGem(gemId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('gems').update({ is_approved: true }).eq('id', gemId)
  revalidatePath('/dashboard/admin')
}

export async function rejectGem(gemId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('gems').delete().eq('id', gemId)
  revalidatePath('/dashboard/admin')
}

export async function adminCreateGem(formData: FormData) {
  const { error, supabase, user } = await getAdminClient()
  if (error || !supabase) return { error }

  const name = (formData.get('name') as string)?.trim()
  const spaceId = formData.get('space_id') as string
  const category = formData.get('category') as string
  const description = (formData.get('description') as string)?.trim()
  const address = (formData.get('address') as string)?.trim()
  const lat = parseFloat(formData.get('lat') as string)
  const lng = parseFloat(formData.get('lng') as string)

  if (!name || !spaceId || !category) return { error: 'Name, space and category are required' }

  const { error: e } = await supabase.from('gems').insert({
    name,
    near_space_id: spaceId,
    category,
    description: description || null,
    address: address || null,
    lat: lat || 0,
    lng: lng || 0,
    vetted_by: user!.id,
    is_approved: true,
  })
  if (e) return { error: e.message }
  revalidatePath('/dashboard/admin')
  return { success: true }
}

// ── WAM Top 20 ─────────────────────────────────────────────

export async function setTop20(makerId: string, position: number) {
  const { error, supabase, user } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('wam_top20').upsert({
    position,
    maker_id: makerId,
    pinned_by: user!.id,
    pinned_at: new Date().toISOString(),
  }, { onConflict: 'position' })
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function removeTop20(position: number) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('wam_top20').delete().eq('position', position)
  revalidatePath('/dashboard/admin')
}

// ── Push Notifications ─────────────────────────────────────

export async function sendAdminPush(title: string, body: string, url: string) {
  const { error } = await getAdminClient()
  if (error) return { error, sent: 0 }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearemakers.pt'
  try {
    const res = await fetch(`${SITE_URL}/api/push/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url }),
    })
    const data = await res.json()
    return { sent: data.sent ?? 0 }
  } catch {
    return { sent: 0 }
  }
}

// ── Journal Articles ───────────────────────────────────────

export async function createArticle(formData: FormData) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }

  const title = (formData.get('title') as string)?.trim()
  if (!title) return { error: 'Title is required' }

  const slug = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const tagsRaw = (formData.get('tags') as string)?.trim()
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const isPublished = formData.get('is_published') === 'on'

  const { error: e } = await supabase.from('journal_articles').insert({
    slug,
    title,
    kicker: (formData.get('kicker') as string)?.trim() || null,
    dek: (formData.get('dek') as string)?.trim() || null,
    lede: (formData.get('lede') as string)?.trim() || null,
    body_md: (formData.get('body_md') as string)?.trim() || null,
    pull_quote: (formData.get('pull_quote') as string)?.trim() || null,
    author_name: (formData.get('author_name') as string)?.trim() || 'WAM Editorial',
    cover_image_url: (formData.get('cover_image_url') as string)?.trim() || null,
    tags,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
    seo_title: (formData.get('seo_title') as string)?.trim() || null,
    seo_description: (formData.get('seo_description') as string)?.trim() || null,
  })

  if (e) return { error: e.message }
  revalidatePath('/dashboard/admin')
  revalidatePath('/journal')
  return { success: true }
}

export async function updateArticle(articleId: string, formData: FormData) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }

  const title = (formData.get('title') as string)?.trim()
  if (!title) return { error: 'Title is required' }

  const tagsRaw = (formData.get('tags') as string)?.trim()
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const isPublished = formData.get('is_published') === 'on'

  const { data: current } = await supabase
    .from('journal_articles')
    .select('is_published, published_at')
    .eq('id', articleId)
    .single()

  const { error: e } = await supabase.from('journal_articles').update({
    title,
    kicker: (formData.get('kicker') as string)?.trim() || null,
    dek: (formData.get('dek') as string)?.trim() || null,
    lede: (formData.get('lede') as string)?.trim() || null,
    body_md: (formData.get('body_md') as string)?.trim() || null,
    pull_quote: (formData.get('pull_quote') as string)?.trim() || null,
    author_name: (formData.get('author_name') as string)?.trim() || 'WAM Editorial',
    cover_image_url: (formData.get('cover_image_url') as string)?.trim() || null,
    tags,
    is_published: isPublished,
    published_at: isPublished && !current?.published_at
      ? new Date().toISOString()
      : current?.published_at ?? null,
    seo_title: (formData.get('seo_title') as string)?.trim() || null,
    seo_description: (formData.get('seo_description') as string)?.trim() || null,
    updated_at: new Date().toISOString(),
  }).eq('id', articleId)

  if (e) return { error: e.message }
  revalidatePath('/dashboard/admin')
  revalidatePath('/journal')
  return { success: true }
}

export async function deleteArticle(articleId: string) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }
  await supabase.from('journal_articles').delete().eq('id', articleId)
  revalidatePath('/dashboard/admin')
  revalidatePath('/journal')
  return { success: true }
}

export async function toggleArticlePublished(articleId: string, publish: boolean) {
  const { error, supabase } = await getAdminClient()
  if (error || !supabase) return { error }

  const { data: current } = await supabase
    .from('journal_articles')
    .select('published_at')
    .eq('id', articleId)
    .single()

  await supabase.from('journal_articles').update({
    is_published: publish,
    published_at: publish && !current?.published_at
      ? new Date().toISOString()
      : current?.published_at ?? null,
    updated_at: new Date().toISOString(),
  }).eq('id', articleId)

  revalidatePath('/dashboard/admin')
  revalidatePath('/journal')
  return { success: true }
}
