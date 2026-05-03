'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ── Live Status ───────────────────────────────────────────────

export async function setLiveStatus(isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Field Notes / Daily Offer ─────────────────────────────────

export async function saveFieldNotes(formData: FormData) {
  const offer = (formData.get('offer') as string | null)?.trim() ?? null
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ digital_offer: offer || null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Check In ──────────────────────────────────────────────────

export async function checkInToMarket(formData: FormData) {
  const marketId = formData.get('market_id') as string
  const stallLabel = (formData.get('stall_label') as string | null)?.trim() || null

  if (!marketId) return { error: 'No market selected' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('attendance').upsert(
    {
      market_id: marketId,
      maker_id: user.id,
      stall_label: stallLabel,
      checked_out_at: null,
      checked_in_at: new Date().toISOString(),
    },
    { onConflict: 'market_id,maker_id', ignoreDuplicates: false }
  )

  if (error) return { error: error.message }

  // Push + email notifications (best-effort, fire and forget)
  ;(async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, slug')
        .eq('id', user.id)
        .single()

      const { data: market } = await supabase
        .from('markets')
        .select('title, space:spaces(name)')
        .eq('id', marketId)
        .single()

      if (!profile || !market) return
      const marketName = (market.space as any)?.name ?? market.title

      // Push notification
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makerId: user.id,
          marketName,
          brandName: profile.display_name,
          brandSlug: profile.slug,
        }),
      }).catch(() => {})

      // Email alert to saved visitors
      const { data: savedRows } = await supabase
        .from('saved_brands')
        .select('visitor_id')
        .eq('brand_id', user.id)
        .not('visitor_id', 'is', null)

      if (!savedRows?.length) return

      const visitorIds = savedRows.map((r: any) => r.visitor_id).filter(Boolean)
      const { createClient: sc } = await import('@supabase/supabase-js')
      const serviceClient = sc(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const emails: string[] = []
      for (const id of visitorIds) {
        const { data } = await serviceClient.auth.admin.getUserById(id)
        if (data?.user?.email) emails.push(data.user.email)
      }
      if (!emails.length) return

      const { sendCheckinAlertEmails } = await import('@/lib/email')
      await sendCheckinAlertEmails(
        emails,
        { display_name: profile.display_name, slug: profile.slug, id: user.id },
        { space_name: marketName, title: market.title }
      )
    } catch { /* best-effort */ }
  })()

  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Check Out ─────────────────────────────────────────────────

export async function checkOutOfMarket(attendanceId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('attendance')
    .update({ checked_out_at: new Date().toISOString() })
    .eq('id', attendanceId)
    .eq('maker_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Agenda Intent ─────────────────────────────────────────────

export async function toggleAttendanceIntent(formData: FormData) {
  const marketId = formData.get('market_id') as string
  const isAttending = formData.get('is_attending') === 'true'

  if (!marketId) return { error: 'No market ID' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (isAttending) {
    await supabase
      .from('attendance')
      .delete()
      .eq('market_id', marketId)
      .eq('maker_id', user.id)
      .is('checked_out_at', null)
  } else {
    const { data: market } = await supabase
      .from('markets')
      .select('event_date, starts_at')
      .eq('id', marketId)
      .single()

    if (!market) return { error: 'Market not found' }

    const intentTime = new Date(`${market.event_date}T${market.starts_at}`)

    await supabase.from('attendance').upsert(
      {
        market_id: marketId,
        maker_id: user.id,
        checked_in_at: intentTime.toISOString(),
        checked_out_at: intentTime.toISOString(),
        stall_label: 'INTENT',
      },
      { onConflict: 'market_id,maker_id', ignoreDuplicates: true }
    )
  }

  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Brand Profile ─────────────────────────────────────────────

async function translateBio(text: string): Promise<Record<string, string>> {
  const DEEPL_KEY = process.env.DEEPL_API_KEY
  if (!DEEPL_KEY || !text.trim()) return {}

  const langs = ['EN-GB', 'ES', 'DE', 'FR', 'IT']
  const keys = ['en', 'es', 'de', 'fr', 'it']
  const translations: Record<string, string> = {}

  try {
    await Promise.all(
      langs.map(async (lang, i) => {
        const res = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: [text], source_lang: 'PT', target_lang: lang }),
        })
        if (res.ok) {
          const data = await res.json()
          translations[keys[i]] = data.translations?.[0]?.text ?? ''
        }
      })
    )
  } catch { /* silent */ }

  return translations
}

export async function saveBrandProfile(formData: FormData) {
  const display_name = (formData.get('display_name') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim() || null
  const instagram_handle = (formData.get('instagram_handle') as string)?.trim() || null
  const shop_url = (formData.get('shop_url') as string)?.trim() || null
  const whatsapp = (formData.get('whatsapp') as string)?.trim() || null
  const slug = display_name
    ? display_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : null
  const category = (formData.get('category') as string | null)?.trim() || null

  if (!display_name) return { error: 'Brand name is required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('profiles')
    .select('bio_i18n')
    .eq('id', user.id)
    .single()

  const price_range = (formData.get('price_range') as string | null)?.trim() || null
  const bio_i18n = {
    ...(existing?.bio_i18n ?? {}),
    ...(category ? { _category: category } : {}),
    ...(price_range ? { _price_range: price_range } : {}),
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name,
      bio,
      instagram_handle,
      slug,
      bio_i18n,
      shop_url,
      whatsapp,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  if (bio) {
    const userId = user.id
    translateBio(bio).then(async (translations) => {
      if (Object.keys(translations).length === 0) return
      const { createClient: createBgClient } = await import('@/lib/supabase/server')
      const supabaseBg = await createBgClient()
      const { data: cur } = await supabaseBg.from('profiles').select('bio_i18n').eq('id', userId).single()
      const merged = { ...(cur?.bio_i18n ?? {}), ...translations }
      await supabaseBg.from('profiles').update({ bio_i18n: merged }).eq('id', userId)
    }).catch(() => {})
  }

  revalidatePath('/dashboard/maker')
  revalidatePath('/brands')
  return { success: true }
}

// ── Private Field Notes ───────────────────────────────────────

export async function savePrivateNotes(formData: FormData) {
  const notes = (formData.get('private_notes') as string | null)?.trim() ?? null
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('profiles')
    .select('bio_i18n')
    .eq('id', user.id)
    .single()

  const bio_i18n = { ...(existing?.bio_i18n ?? {}), _private_notes: notes ?? '' }

  const { error } = await supabase
    .from('profiles')
    .update({ bio_i18n, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Offer Toggle ──────────────────────────────────────────────

export async function toggleOffer(formData: FormData) {
  const isActive = formData.get('offer_active') === 'true'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('profiles')
    .select('bio_i18n')
    .eq('id', user.id)
    .single()

  const bio_i18n = { ...(existing?.bio_i18n ?? {}), _offer_active: isActive }

  const { error } = await supabase
    .from('profiles')
    .update({ bio_i18n, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Hidden Gems Submission ────────────────────────────────────

export async function submitGem(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const category = formData.get('category') as string
  const spaceId = formData.get('space_id') as string
  const description = (formData.get('description') as string)?.trim() || null
  const address = (formData.get('address') as string)?.trim() || null
  const lat = parseFloat(formData.get('lat') as string) || null
  const lng = parseFloat(formData.get('lng') as string) || null

  if (!name) return { error: 'Name is required' }
  if (!category) return { error: 'Category is required' }
  if (!spaceId) return { error: 'Please select which market this gem is near' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('gems')
    .select('id')
    .eq('vetted_by', user.id)
    .eq('near_space_id', spaceId)

  if ((existing?.length ?? 0) >= 3) {
    return { error: 'You can submit up to 3 gems per market location.' }
  }

  const { error } = await supabase.from('gems').insert({
    name,
    category,
    near_space_id: spaceId,
    description,
    address,
    lat: lat ?? 0,
    lng: lng ?? 0,
    vetted_by: user.id,
    is_approved: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}

// ── Hidden Gems Delete ────────────────────────────────────────

export async function deleteGem(gemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('gems')
    .delete()
    .eq('id', gemId)
    .eq('vetted_by', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/maker')
  return { success: true }
}
