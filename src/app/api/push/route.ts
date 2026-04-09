import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route is called server-side when a maker checks in
// It fans out push notifications to all visitors who saved that brand

export async function POST(req: NextRequest) {
  try {
    const { makerId, marketName, brandName, brandSlug } = await req.json()

    if (!makerId || !marketName || !brandName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all visitors who saved this brand
    const { data: savedByVisitors } = await supabase
      .from('saved_brands')
      .select('visitor_id')
      .eq('brand_id', makerId)

    if (!savedByVisitors || savedByVisitors.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const visitorIds = savedByVisitors.map(r => r.visitor_id)

    // Get their push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .in('visitor_id', visitorIds)

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    // Send push notifications using web-push protocol manually
    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!

    const payload = JSON.stringify({
      title: `${brandName} is live`,
      body: `At ${marketName} right now. Go find them.`,
      url: brandSlug ? `/brands/${brandSlug}` : '/brands',
      icon: '/icon.svg',
    })

    // Use fetch with Web Push protocol
    let sent = 0
    const failed: string[] = []

    for (const sub of subscriptions) {
      try {
        // Build the push request using the Web Push HTTP protocol
        const res = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aes128gcm',
            'TTL': '86400',
          },
          body: payload,
        })
        if (res.ok || res.status === 201) sent++
        else failed.push(sub.endpoint)
      } catch {
        failed.push(sub.endpoint)
      }
    }

    return NextResponse.json({ sent, failed: failed.length, total: subscriptions.length })
  } catch (err: any) {
    console.error('Push notification error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
