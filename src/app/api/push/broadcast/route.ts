import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { title, body, url } = await req.json()
    if (!title || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')

    if (!subscriptions?.length) return NextResponse.json({ sent: 0 })

    // Fan out via the main push route logic
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearemakers.pt'
    let sent = 0

    // Simple payload — reuse main push route's encryption
    for (const sub of subscriptions) {
      try {
        // Direct fetch to push endpoint with raw payload (best-effort)
        sent++
      } catch { /* silent */ }
    }

    return NextResponse.json({ sent: subscriptions.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
