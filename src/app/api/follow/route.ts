import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export async function POST(req: NextRequest) {
  try {
    const { brand_id, email, visitor_id } = await req.json()

    if (!brand_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Verify brand exists
    const { data: brand } = await serviceClient
      .from('profiles')
      .select('id, display_name')
      .eq('id', brand_id)
      .single()

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Upsert — if they already follow, update timestamp
    const { error } = await serviceClient
      .from('brand_followers')
      .upsert(
        {
          brand_id,
          email: email.trim().toLowerCase(),
          visitor_id: visitor_id ?? null,
          opted_in_at: new Date().toISOString(),
        },
        { onConflict: 'brand_id,email' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
