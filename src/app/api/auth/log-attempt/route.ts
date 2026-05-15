import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://registrazionesoci.vercel.app';

async function sendAlertEmail(ip: string, loginType: string, attemptCount: number) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const now = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });

  await transporter.sendMail({
    from: `"LNI Messina Security" <${process.env.EMAIL_USER}>`,
    to: ['leganavaleitalianamessina@gmail.com', 'francescoborgosano@gmail.com'],
    subject: `⚠️ Allerta Sicurezza - Tentativi di accesso sospetti (${loginType})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <div style="background-color:#dc3545;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">Allerta Sicurezza</h1>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;">Tentativi di accesso sospetti</h2>
          <p style="font-size:16px;color:#555;">Il rate limit è stato superato per il login <strong>${loginType}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">IP</td><td style="padding:10px;border:1px solid #ddd;">${ip}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Tipo</td><td style="padding:10px;border:1px solid #ddd;">${loginType}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Tentativi (15 min)</td><td style="padding:10px;border:1px solid #ddd;">${attemptCount}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Data/Ora</td><td style="padding:10px;border:1px solid #ddd;">${now}</td></tr>
          </table>
          <p style="font-size:14px;color:#888;">L'IP è stato bloccato per 15 minuti. Se sei tu l'amministratore, verifica di non aver dimenticato la password.</p>
        </div>
        <div style="background-color:#f4f4f4;padding:20px;text-align:center;font-size:12px;color:#888;">
          &copy; ${new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina<br>
          Messaggio generato automaticamente dal sistema di sicurezza.
        </div>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { loginType, success, blocked } = await req.json();

    if (!loginType || !['operator', 'admin'].includes(loginType)) {
      return NextResponse.json({ error: 'Tipo di login non valido.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '0.0.0.0';

    await supabase.from('login_attempts').insert({
      ip_address: ip,
      login_type: loginType,
      success: success || false,
      blocked: blocked || false,
    });

    // Send alert if this is a block (rate limit exceeded)
    if (blocked) {
      const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Check if we already sent an alert for this IP in the last 24h
      const { count: recentAlerts } = await supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .eq('blocked', true)
        .gte('attempted_at', windowStart);

      // If only 1 block in 24h (the one we just inserted), send alert
      if (recentAlerts && recentAlerts <= 1) {
        const { count: attemptCount } = await supabase
          .from('login_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('ip_address', ip)
          .eq('login_type', loginType)
          .eq('success', false)
          .gte('attempted_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

        await sendAlertEmail(ip, loginType, attemptCount || 0);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('log-attempt error:', err);
    return NextResponse.json({ ok: true });
  }
}
