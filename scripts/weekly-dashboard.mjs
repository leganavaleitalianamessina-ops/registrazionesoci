#!/usr/bin/env node

// Weekly Dashboard Script
// Invia email con statistiche settimanali a leganavaleitalianamessina@gmail.com
// Attivabile/disattivabile dal pannello admin
// Esecuzione: ogni lunedì via GitHub Actions

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const REPORT_TO = process.env.REPORT_TO || 'leganavaleitalianamessina@gmail.com';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERRORE: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere impostati.');
  process.exit(1);
}
if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('ERRORE: EMAIL_USER e EMAIL_PASS devono essere impostati.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
});

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { weekStart: monday.toISOString(), weekEnd: sunday.toISOString(), monday, sunday };
}

async function getDailyBreakdown(weekStart, weekEnd) {
  const { data } = await supabase
    .from('checkin_logs')
    .select('created_at')
    .gte('created_at', weekStart)
    .lte('created_at', weekEnd);

  const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  const counts = Array(7).fill(0);

  if (data) {
    for (const c of data) {
      const d = new Date(c.created_at);
      const dow = d.getDay();
      const idx = dow === 0 ? 6 : dow - 1;
      counts[idx]++;
    }
  }

  return days.map((name, i) => ({ day: name, count: counts[i] }));
}

async function main() {
  console.log('=== DASHBOARD SETTIMANALE ===');

  // Check if weekly report is enabled
  const { data: setting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'weekly_report_enabled')
    .single();

  const enabled = setting?.value === true || setting?.value === 'true';
  if (!enabled) {
    console.log('Report settimanale disabilitato da impostazioni admin. Nessuna email inviata.');
    return;
  }

  const { weekStart, weekEnd, monday, sunday } = getWeekRange();
  const formatDate = (d) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const weekLabel = `${formatDate(monday)} - ${formatDate(sunday)}`;

  console.log(`Settimana: ${weekLabel}`);

  // Fetch stats
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: activeMembers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'active_member');
  const { count: preMembers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'pre_member');
  const { count: newUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', weekStart).lte('created_at', weekEnd);
  const { count: newQr } = await supabase.from('qr_tokens').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('created_at', weekStart).lte('created_at', weekEnd);
  const { count: weeklyCheckins } = await supabase.from('checkin_logs').select('*', { count: 'exact', head: true }).gte('created_at', weekStart).lte('created_at', weekEnd);

  const daily = await getDailyBreakdown(weekStart, weekEnd);

  // Build HTML
  const dailyRows = daily.filter(d => d.count > 0).map(d =>
    `<tr><td style="padding:8px;border:1px solid #ddd;">${d.day}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:bold;">${d.count}</td></tr>`
  ).join('');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"LNI Messina Dashboard" <${EMAIL_USER}>`,
    to: REPORT_TO,
    subject: `Dashboard Settimanale LNI Messina - ${weekLabel}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <div style="background-color:#003366;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">Dashboard Settimanale</h1>
          <p style="color:#ffcc00;margin:5px 0 0;">${weekLabel}</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;border-bottom:2px solid #003366;padding-bottom:10px;">Riepilogo Utenti</h2>
          <table style="width:100%;border-collapse:collapse;margin:15px 0;">
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Utenti Totali</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;">${totalUsers || 0}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Soci Attivi</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;color:#28a745;">${activeMembers || 0}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Aspiranti Soci</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;color:#ffc107;">${preMembers || 0}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Nuove Iscrizioni (7gg)</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;color:#007bff;">${newUsers || 0}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">QR Attivati (7gg)</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;color:#6f42c1;">${newQr || 0}</td></tr>
          </table>

          <h2 style="color:#333;border-bottom:2px solid #003366;padding-bottom:10px;">Check-in</h2>
          <p style="font-size:18px;color:#333;">Totale check-in questa settimana: <strong>${weeklyCheckins || 0}</strong></p>
          ${dailyRows ? `
          <table style="width:100%;border-collapse:collapse;margin:15px 0;">
            <tr style="background-color:#003366;color:white;"><th style="padding:10px;border:1px solid #003366;">Giorno</th><th style="padding:10px;border:1px solid #003366;">Check-in</th></tr>
            ${dailyRows}
          </table>` : '<p style="color:#888;">Nessun check-in registrato questa settimana.</p>'}
        </div>
        <div style="background-color:#f4f4f4;padding:20px;text-align:center;font-size:12px;color:#888;">
          &copy; ${new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina<br>
          Report settimanale automatico. Per disattivarlo, vai al pannello amministrazione.
        </div>
      </div>
    `,
  });

  console.log('Email dashboard settimanale inviata con successo.');
  console.log('=== FINE ===');
}

main().catch(err => {
  console.error('ERRORE:', err.message);
  process.exit(1);
});
