import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const serviceClient = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Verify the requesting user is a maker and owns this data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'maker' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Fetch all followers for this maker's brand
  const { data: followers, error } = await serviceClient
    .from('brand_followers')
    .select('email, opted_in_at')
    .eq('brand_id', user.id)
    .order('opted_in_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!followers || followers.length === 0) {
    return new NextResponse('email,date_signed_up\n', {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="wearemakers-leads.csv"',
      },
    })
  }

  // Build CSV
  const header = 'email,date_signed_up\n'
  const rows = followers.map(f => {
    const date = new Date(f.opted_in_at).toLocaleDateString('en-GB')
    return `${f.email},${date}`
  }).join('\n')

  return new NextResponse(header + rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="wearemakers-leads-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
