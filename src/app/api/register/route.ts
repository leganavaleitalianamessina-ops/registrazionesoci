import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '0.0.0.0';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, gdprConsent, marketingConsent, website, elapsed } = body;

    // Honeypot: if invisible field is filled, it's a bot
    if (website) {
      return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 403 });
    }
    // Time-to-submit: must be >= 3 seconds
    if (typeof elapsed !== 'number' || elapsed < 3000) {
      return NextResponse.json({ error: 'Richiesta troppo rapida. Ricarica la pagina e riprova.' }, { status: 403 });
    }

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanPhone = phone.trim();

    // Check duplicate phone — always block re-registration
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "Questo numero di telefono è già registrato. Usa 'Recupera QRCode' nella Home Page." },
        { status: 409 }
      );
    }

    const ip = getClientIp(req);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        first_name: cleanFirstName,
        last_name: cleanLastName,
        email: null,
        phone: cleanPhone,
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

    // Log GDPR consent
    const userAgent = req.headers.get('user-agent') || 'unknown';
    if (gdprConsent) {
      await supabase.from('checkin_logs').insert({
        user_id: userData.id,
        checkin_result: 'GDPR_CONSENT',
        device_info: `v1_2024|web_form|${userAgent}`,
        ip_address: ip,
      });
    }
    if (marketingConsent) {
      await supabase.from('checkin_logs').insert({
        user_id: userData.id,
        checkin_result: 'MARKETING_CONSENT',
        device_info: `v1_2024|web_form|${userAgent}`,
        ip_address: ip,
      });
    }

    // Create active QR token immediately
    const token = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error: tokenError } = await supabase
      .from('qr_tokens')
      .insert({ user_id: userData.id, token, is_active: true });

    if (tokenError) {
      return NextResponse.json({ error: 'Errore durante la generazione del QR code.' }, { status: 500 });
    }

    // Fetch back with firstName, lastName from DB
    return NextResponse.json({
      userId: userData.id, token, phone: cleanPhone,
      firstName: cleanFirstName, lastName: cleanLastName,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore di comunicazione.' }, { status: 500 });
  }
}
