#!/usr/bin/env node

// Monthly Report Script (v2)
// Genera e invia CSV di utenti e log del mese corrente
// I destinatari sono letti dalla tabella report_recipients
// Esecuzione: 1° del mese via GitHub Actions

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

async function main() {
  console.log('=== REPORT MENSILE ===');
  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  console.log(`Mese: ${month}`);

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

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  // Export users
  const { data: users } = await supabase
    .from('users')
    .select('id, first_name, last_name, date_of_birth, email, phone, user_type, status, gdpr_consent, marketing_consent, registration_date, expiration_date, created_at')
    .order('created_at', { ascending: false });

  const usersArr = users || [];
  const usersCSV = toCSV(usersArr);
  console.log(`Utenti esportati: ${usersArr.length}`);

  const gdprCount = usersArr.filter(u => u.gdpr_consent).length;
  const marketingCount = usersArr.filter(u => u.marketing_consent).length;

  // Export checkin logs for current month
  const { data: checkins } = await supabase
    .from('checkin_logs')
    .select('*, users!inner(first_name, last_name, email)')
    .gte('created_at', monthStart)
    .lt('created_at', monthEnd)
    .order('created_at', { ascending: false });

  const checkinRows = (checkins || []).map(c => ({
    id: c.id,
    user_id: c.user_id,
    first_name: c.users?.first_name || '',
    last_name: c.users?.last_name || '',
    email: c.users?.email || '',
    checkin_result: c.checkin_result,
    device_info: c.device_info,
    ip_address: c.ip_address,
    created_at: c.created_at,
  }));
  const checkinsCSV = toCSV(checkinRows);
  console.log(`Check-in esportati: ${checkinRows.length}`);

  // Export login attempts for current month
  const { data: attempts } = await supabase
    .from('login_attempts')
    .select('*')
    .gte('attempted_at', monthStart)
    .lt('attempted_at', monthEnd)
    .order('attempted_at', { ascending: false });

  const attemptsCSV = toCSV(attempts || []);
  console.log(`Tentativi login esportati: ${(attempts || []).length}`);

  // Send email with CSV attachments
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  const subject = `Report Mensile LNI Messina - ${month}`;

  await transporter.sendMail({
    from: `"LNI Messina Report" <${EMAIL_USER}>`,
    to: toList.join(', '),
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background-color:#003366;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">Report Mensile</h1>
          <p style="color:#ffcc00;margin:5px 0 0;">${month}</p>
        </div>
        <div style="padding:20px;">
          <p style="font-size:16px;color:#333;">Riepilogo dati del mese di ${month}:</p>
          <ul>
            <li><strong>${users?.length || 0}</strong> utenti totali</li>
            <li><strong>${checkinRows.length}</strong> check-in</li>
            <li><strong>${(attempts || []).length}</strong> tentativi di login</li>
          </ul>
          <h3 style="color:#333;margin-top:20px;">Consensi</h3>
          <ul>
            <li><strong>${gdprCount}</strong> consenso GDPR</li>
            <li><strong>${marketingCount}</strong> consenso Marketing</li>
          </ul>
          <p style="font-size:14px;color:#888;">I file CSV sono allegati a questa email.</p>
        </div>
      </div>
    `,
    attachments: [
      { filename: `utenti_${month}.csv`, content: usersCSV },
      { filename: `checkin_${month}.csv`, content: checkinsCSV },
      { filename: `login_attempts_${month}.csv`, content: attemptsCSV },
    ],
  });

  // Log to audit_logs
  try {
    await supabase.from('audit_logs').insert({
      action_type: 'MONTHLY_REPORT',
      target_type: 'export',
      metadata: { month, users_count: users?.length, checkins_count: checkinRows.length, attempts_count: (attempts || []).length },
    });
  } catch {}

  console.log('Email report mensile inviata con successo.');
  console.log('=== FINE ===');
}

main().catch(err => {
  console.error('ERRORE:', err.message);
  process.exit(1);
});
