#!/usr/bin/env node

// Weekly Dashboard Script (v2)
// Invia email con statistiche settimanali + CSV aspiranti soci
// I destinatari sono letti dalla tabella report_recipients
// Esecuzione: ogni lunedì via GitHub Actions

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

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



function toCSV(rows) {
  if (!rows || rows.length === 0) return 'Nessun dato';
  const headers = Object.keys(rows[0]);
  const lines = rows.map(r => headers.map(h => {
    const v = r[h];
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return `"${s}"`;
  }).join(','));
  return [headers.join(','), ...lines].join('\n');
}

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

async function main() {
  console.log('=== DASHBOARD SETTIMANALE ===');

  const { weekStart, weekEnd, monday, sunday } = getWeekRange();
  const formatDate = (d) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const weekLabel = `${formatDate(monday)} - ${formatDate(sunday)}`;
  console.log(`Settimana: ${weekLabel}`);

  // Fetch recipients
  const { data: recipients } = await supabase
    .from('report_recipients')
    .select('email')
    .eq('enabled', true);

  const toList = (recipients || []).map(r => r.email);
  if (toList.length === 0) {
    console.log('Nessun destinatario configurato. Nessuna email inviata.');
    return;
  }
  console.log(`Destinatari: ${toList.join(', ')}`);

  // Check if weekly report is enabled in app_settings
  const { data: setting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'weekly_report_enabled')
    .single();

  const isEnabled = setting?.value === true || setting?.value === 'true';
  if (!isEnabled) {
    console.log('Report settimanale disabilitato da app_settings. Nessuna email inviata.');
    return;
  }

  // Fetch stats — solo conteggi registrazioni
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: today } = await supabase.from('users').select('*', { count: 'exact', head: true })
    .gte('created_at', new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');
  const { count: week } = await supabase.from('users').select('*', { count: 'exact', head: true })
    .gte('created_at', weekStart);
  const { count: month } = await supabase.from('users').select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
  const { count: gdpr } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('gdpr_consent', true);
  const { count: marketing } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('marketing_consent', true);

  // Export pre-members CSV
  const { data: preMembers } = await supabase
    .from('users')
    .select('first_name, last_name, date_of_birth, phone, email, created_at, gdpr_consent, marketing_consent')
    .eq('user_type', 'pre_member')
    .order('created_at', { ascending: false });

  const csvRows = (preMembers || []).map(u => ({
    Nome: u.first_name || '',
    Cognome: u.last_name || '',
    Data_di_Nascita: u.date_of_birth ? u.date_of_birth.slice(0, 10) : '',
    Telefono: u.phone || '',
    Email: u.email || '',
    Consenso_GDPR: u.gdpr_consent ? 'Sì' : 'No',
    Consenso_Marketing: u.marketing_consent ? 'Sì' : 'No',
  }));
  const csvContent = toCSV(csvRows);
  console.log(`Aspiranti soci esportati: ${csvRows.length}`);

  // Build HTML
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"LNI Messina Dashboard" <${EMAIL_USER}>`,
    to: toList.join(', '),
    subject: `Dashboard Settimanale LNI Messina - ${weekLabel}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden;">
        <div style="background-color:#003366;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">Dashboard Settimanale</h1>
          <p style="color:#ffcc00;margin:5px 0 0;">${weekLabel}</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;border-bottom:2px solid #003366;padding-bottom:10px;">Nuove Registrazioni</h2>
          <table style="width:100%;border-collapse:collapse;margin:15px 0;">
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Utenti Registrati (totale)</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;">${totalUsers || 0}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Oggi</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;color:#28a745;">${today || 0}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Questa Settimana</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;color:#ffc107;">${week || 0}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Questo Mese</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;color:#dc3545;">${month || 0}</td></tr>
          </table>
          <h2 style="color:#333;border-bottom:2px solid #003366;padding-bottom:10px;margin-top:25px;">Consensi</h2>
          <table style="width:100%;border-collapse:collapse;margin:15px 0;">
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">GDPR</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;color:#17a2b8;">${gdpr || 0}</td></tr>
            <tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">Marketing</td><td style="padding:10px;border:1px solid #ddd;text-align:center;font-size:24px;color:#6610f2;">${marketing || 0}</td></tr>
          </table>
          <p style="font-size:14px;color:#888;margin-top:20px;">In allegato l\'elenco degli aspiranti soci.</p>
        </div>
        <div style="background-color:#f4f4f4;padding:20px;text-align:center;font-size:12px;color:#888;">
          &copy; ${new Date().getFullYear()} Lega Navale Italiana - Sezione di Messina<br>
          Report settimanale automatico.
        </div>
      </div>
    `,
    attachments: [
      { filename: `aspiranti_soci_${new Date().toISOString().slice(0, 10)}.csv`, content: csvContent },
    ],
  });

  console.log('Email dashboard settimanale inviata con successo.');

  // Log to audit_logs
  try {
    await supabase.from('audit_logs').insert({
      action_type: 'WEEKLY_REPORT',
      target_type: 'export',
      metadata: { week: weekLabel, total_users: totalUsers, week_users: week, pre_members_exported: csvRows.length, recipients: toList },
    });
  } catch {}

  console.log('=== FINE ===');
}

main().catch(err => {
  console.error('ERRORE:', err.message);
  process.exit(1);
});
