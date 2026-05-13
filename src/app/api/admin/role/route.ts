import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ role: null, authenticated: false })
  }

  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    authenticated: true,
    email: user.email,
    role: data?.role || null,
  })
}
