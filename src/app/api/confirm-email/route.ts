import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token mancante.' }, { status: 400 });
    }

    // Find the confirmation token (is_active = false) and get user name
    const { data: qrToken, error: findError } = await supabase
      .from('qr_tokens')
      .select('id, user_id, users(first_name, last_name, email)')
      .eq('token', token.toUpperCase())
      .eq('is_active', false)
      .single();

    if (findError || !qrToken) {
      return NextResponse.json(
        { error: 'Token non valido o già utilizzato. Se hai già verificato, usa il tuo QR code per accedere.' },
        { status: 404 }
      );
    }

    const user = qrToken.users as any;

    // Activate the token (now it's the user's official QR code)
    const { error: updateError } = await supabase
      .from('qr_tokens')
      .update({ is_active: true })
      .eq('id', qrToken.id);

    if (updateError) {
      return NextResponse.json({ error: 'Errore durante la verifica.' }, { status: 500 });
    }

    // Log the verification event
    await supabase.from('checkin_logs').insert({
      user_id: qrToken.user_id,
      checkin_result: 'EMAIL_VERIFIED',
      device_info: 'double_optin|email_confirmation',
    });

    return NextResponse.json({
      success: true,
      userId: qrToken.user_id,
      token: token.toUpperCase(),
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore di comunicazione.' }, { status: 500 });
  }
}
