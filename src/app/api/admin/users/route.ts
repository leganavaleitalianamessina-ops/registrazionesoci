import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function checkAdmin(supabase: any): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  return data?.role || null
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const role = await checkAdmin(supabase)
  if (!role || role === 'checkin_operator') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('users')
    .select('*, qr_tokens(token, is_active, created_at)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const role = await checkAdmin(supabase)
  if (role !== 'admin_full') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const body = await req.json()
  const { first_name, last_name, email, phone, user_type, gdpr_consent, marketing_consent } = body

  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      first_name, last_name, email, phone,
      user_type: user_type || 'active_member',
      status: 'active',
      gdpr_consent: gdpr_consent || false,
      marketing_consent: marketing_consent || false,
      expiration_date: user_type === 'pre_member'
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    })
    .select()
    .single()

  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })

  const token = Math.random().toString(36).substring(2, 10).toUpperCase()
  await supabase.from('qr_tokens').insert({ user_id: userData.id, token, is_active: true })

  return NextResponse.json(userData)
}

export async function PUT(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const role = await checkAdmin(supabase)
  if (role !== 'admin_full') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...updateData } = body

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const role = await checkAdmin(supabase)
  if (role !== 'admin_full') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 })

  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
