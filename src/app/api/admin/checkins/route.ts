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

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const role = await checkAdmin(supabase)
  if (!role || role === 'checkin_operator') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const range = searchParams.get('range') || 'day'

  let fromDate: string
  let toDate: string

  if (range === '24h') {
    fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    toDate = new Date().toISOString()
  } else if (range === 'month') {
    const d = new Date(date)
    fromDate = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
    toDate = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()
  } else {
    fromDate = `${date}T00:00:00.000Z`
    toDate = `${date}T23:59:59.999Z`
  }

  const { data: logs, error } = await supabase
    .from('checkin_logs')
    .select('*, users(first_name, last_name, email)')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total = logs?.length || 0
  const success = logs?.filter(l => l.checkin_result === 'SUCCESS').length || 0

  return NextResponse.json({ logs, total, success })
}
