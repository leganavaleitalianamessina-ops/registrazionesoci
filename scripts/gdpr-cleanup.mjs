#!/usr/bin/env node

// GDPR Cleanup Script
// Elimina pre-aderenti con expiration_date scaduta (> 90 giorni)
// Esecuzione programmata: GitHub Actions ogni 2 settimane

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERRORE: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere impostati.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('=== GDPR CLEANUP ===');
  console.log(`Avvio: ${new Date().toISOString()}`);

  // Trova pre-aderenti con expiration_date passata
  const now = new Date().toISOString();
  const { data: toDelete, error: findError } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, registration_date, expiration_date')
    .eq('user_type', 'pre_member')
    .neq('status', 'active')
    .lt('expiration_date', now);

  if (findError) {
    console.error('ERRORE ricerca utenti:', findError.message);
    process.exit(1);
  }

  if (!toDelete || toDelete.length === 0) {
    console.log('Nessun pre-aderente scaduto da eliminare.');
    console.log('=== FINE ===');
    return;
  }

  console.log(`Trovati ${toDelete.length} pre-aderenti scaduti:`);
  for (const u of toDelete) {
    console.log(`  - ${u.first_name} ${u.last_name} (${u.email}) — registrato: ${u.registration_date}, scaduto: ${u.expiration_date}`);
  }

  // Elimina (qr_tokens e checkin_logs in cascata grazie a ON DELETE CASCADE)
  const ids = toDelete.map(u => u.id);
  const { error: delError, count } = await supabase
    .from('users')
    .delete({ count: 'exact' })
    .in('id', ids);

  if (delError) {
    console.error('ERRORE eliminazione:', delError.message);
    process.exit(1);
  }

  console.log(`\nEliminati ${count || ids.length} pre-aderenti scaduti.`);

  // Log su audit_logs se la tabella esiste
  try {
    await supabase.from('audit_logs').insert({
      action_type: 'GDPR_CLEANUP',
      target_type: 'users',
      metadata: { deleted_count: ids.length, deleted_ids: ids, deleted_emails: toDelete.map(u => u.email) },
    });
    console.log('Evento registrato su audit_logs.');
  } catch {
    console.log('Nota: audit_logs non disponibile o RLS bloccato (nessun problema).');
  }

  console.log('=== GDPR CLEANUP COMPLETATO ===');
}

main().catch(err => {
  console.error('ERRORE imprevisto:', err.message);
  process.exit(1);
});
