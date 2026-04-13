import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for inserts
// (anonymous visitors can't insert otherwise since they have no auth.uid())
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { event_type, brand_id, market_id, visitor_id } = await req.json()

    if (!event_type || !brand_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validEvents = ['brand_view', 'instagram_tap', 'offer_redeem', 'brand_save']
    if (!validEvents.includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    const { error } = await serviceClient.from('analytics_events').insert({
      event_type,
      brand_id,
      market_id: market_id ?? null,
      visitor_id: visitor_id ?? null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
