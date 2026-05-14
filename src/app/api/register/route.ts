import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, gdprConsent, marketingConsent } = body;

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "Questa email è già registrata. Usa la funzione 'Recupera QRCode' nella Home Page." },
        { status: 409 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        first_name: cleanFirstName,
        last_name: cleanLastName,
        email: cleanEmail,
        phone: phone.trim(),
        user_type: 'pre_member',
        status: 'active',
        gdpr_consent: gdprConsent || false,
        marketing_consent: marketingConsent || false,
        expiration_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (userError) {
      return NextResponse.json({ error: 'Errore durante la registrazione. Riprova.' }, { status: 500 });
    }

    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error: tokenError } = await supabase
      .from('qr_tokens')
      .insert({ user_id: userData.id, token, is_active: true });

    if (tokenError) {
      return NextResponse.json({ error: 'Errore durante la generazione del QR code.' }, { status: 500 });
    }

    return NextResponse.json({ userId: userData.id, token, email: cleanEmail });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore di comunicazione.' }, { status: 500 });
  }
}
