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
  if (!role || role === 'checkin_operator') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const supabase = createAuthClient(token)
  const { data: users, error } = await supabase
    .from('users')
    .select('first_name, last_name, date_of_birth, email, phone, user_type, status, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const headers = ['Nome', 'Cognome', 'Data_di_Nascita', 'Email', 'Telefono', 'Tipo', 'Stato', 'Data_Registrazione']
  const rows = (users || []).map(u => [
    u.first_name || '',
    u.last_name || '',
    u.date_of_birth ? u.date_of_birth.slice(0, 10) : '',
    u.email || '',
    u.phone || '',
    u.user_type === 'active_member' ? 'Socio Attivo' : 'Pre-Aderente',
    u.status || '',
    u.created_at ? u.created_at.slice(0, 10) : '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  const csv = [headers.join(','), ...rows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="utenti_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
