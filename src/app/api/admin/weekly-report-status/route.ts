import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'weekly_report_enabled')
    .single();

  if (error || !data) {
    return NextResponse.json({ enabled: true });
  }

  return NextResponse.json({ enabled: data.value === true || data.value === 'true' });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { enabled } = await req.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Parametro enabled mancante o non valido.' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 });
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        key: 'weekly_report_enabled',
        value: enabled,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, { onConflict: 'key' });

    if (error) {
      console.error('Error updating weekly report status:', error);
      return NextResponse.json({ error: 'Errore durante l\'aggiornamento.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, enabled });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
