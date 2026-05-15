import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const { loginType } = await req.json();

    if (!loginType || !['operator', 'admin'].includes(loginType)) {
      return NextResponse.json({ error: 'Tipo di login non valido.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '0.0.0.0';

    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .eq('login_type', loginType)
      .eq('success', false)
      .gte('attempted_at', windowStart);

    if (error) {
      console.error('Rate limit check error:', error);
      return NextResponse.json({ allowed: true });
    }

    if (count && count >= 5) {
      return NextResponse.json({ allowed: false, retryAfterMinutes: 15 });
    }

    return NextResponse.json({ allowed: true });
  } catch (err: any) {
    console.error('check-rate-limit error:', err);
    return NextResponse.json({ allowed: true });
  }
}
