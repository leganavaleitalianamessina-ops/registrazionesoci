import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function createAuthClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

async function checkAdmin(token: string): Promise<string | null> {
  const supabase = createAuthClient(token)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admin_users').select('role').eq('id', user.id).single()
  return data?.role || null
}

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const role = await checkAdmin(token)
  if (!role || role === 'checkin_operator') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const supabase = createAuthClient(token)
  const { data } = await supabase.from('report_recipients').select('*').order('created_at', { ascending: true })
  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const role = await checkAdmin(token)
  if (role !== 'admin_full') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const supabase = createAuthClient(token)
  const body = await req.json()
  const { email } = body
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
  const { data, error } = await supabase.from('report_recipients').insert({ email: email.trim().toLowerCase() }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  const role = await checkAdmin(token)
  if (role !== 'admin_full') return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  const supabase = createAuthClient(token)
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID mancante' }, { status: 400 })
  const { error } = await supabase.from('report_recipients').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
