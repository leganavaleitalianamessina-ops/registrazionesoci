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
    const { firstName, lastName, email, phone, gdprConsent, marketingConsent, turnstileToken } = body;

    // Verify Turnstile captcha
    if (!turnstileToken) {
      return NextResponse.json({ error: 'Verifica Captcha mancante. Ricarica la pagina e riprova.' }, { status: 403 });
    }
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: turnstileToken }),
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json({ error: 'Verifica Captcha fallita. Ricarica la pagina e riprova.' }, { status: 403 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      // Check if user already has an active QR token (already verified)
      const { data: activeToken } = await supabase
        .from('qr_tokens')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('is_active', true)
        .maybeSingle();

      if (activeToken) {
        return NextResponse.json(
          { error: "Questa email è già registrata e verificata. Usa la funzione 'Recupera QRCode' nella Home Page." },
          { status: 409 }
        );
      }
      // Reuse existing inactive token or create a new one
      let confirmToken: string;
      const { data: existingInactive } = await supabase
        .from('qr_tokens')
        .select('token')
        .eq('user_id', existingUser.id)
        .eq('is_active', false)
        .maybeSingle();

      if (existingInactive) {
        confirmToken = existingInactive.token;
      } else {
        confirmToken = Math.random().toString(36).substring(2, 10).toUpperCase();
        await supabase.from('qr_tokens').insert({ user_id: existingUser.id, token: confirmToken, is_active: false });
      }
      return NextResponse.json({ userId: existingUser.id, resend: true, email: cleanEmail, confirmToken });
    }

    const ip = getClientIp(req);

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

    // Log GDPR consent (using checkin_logs table for audit trail)
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

    // Create confirmation token in qr_tokens (is_active = false until email verified)
    const confirmToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error: tokenError } = await supabase
      .from('qr_tokens')
      .insert({ user_id: userData.id, token: confirmToken, is_active: false });

    if (tokenError) {
      return NextResponse.json({ error: 'Errore durante la generazione del token di conferma.' }, { status: 500 });
    }

    return NextResponse.json({ userId: userData.id, email: cleanEmail, confirmToken });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore di comunicazione.' }, { status: 500 });
  }
}
