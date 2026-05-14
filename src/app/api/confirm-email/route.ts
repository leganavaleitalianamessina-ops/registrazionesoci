import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token mancante.' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'ID utente mancante.' }, { status: 400 });
    }

    const tokenUpper = token.toUpperCase();

    // Verify the confirmation token exists and belongs to this userId
    const { data: qrToken, error: findError } = await supabase
      .from('qr_tokens')
      .select('id, user_id')
      .eq('token', tokenUpper)
      .eq('is_active', false)
      .eq('user_id', userId)
      .single();

    if (findError || !qrToken) {
      return NextResponse.json(
        { error: 'Token non valido o già utilizzato. Se hai già verificato, usa il tuo QR code per accedere.' },
        { status: 404 }
      );
    }

    // Generate a new unique token for the active QR code
    const qrTokenValue = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Insert a new active QR token (INSERT works for anon, UPDATE doesn't)
    const { error: insertError } = await supabase
      .from('qr_tokens')
      .insert({ user_id: userId, token: qrTokenValue, is_active: true });

    if (insertError) {
      return NextResponse.json({ error: 'Errore durante la generazione del QR code.' }, { status: 500 });
    }

    // Log the verification event
    await supabase.from('checkin_logs').insert({
      user_id: userId,
      checkin_result: 'EMAIL_VERIFIED',
      device_info: 'double_optin|email_confirmation',
    });

    // Fetch user details for the response
    const { data: user } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      success: true,
      userId,
      token: qrTokenValue,
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore di comunicazione.' }, { status: 500 });
  }
}
