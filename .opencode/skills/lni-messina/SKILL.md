---
name: lni-messina
description: Contesto del progetto LNI Messina Web App (Next.js 14 + Supabase + Vercel). Pre-adesioni, check-in QR, controllo accessi, ruoli, route, API, schema DB e sicurezza. Carica sempre questa skill all'inizio di una sessione in questo repository per recuperare rapidamente il contesto prima di lavorare sul codice.
license: Proprietary
compatibility: opencode
metadata:
  project: lni-messina-weapp
  production-url: https://registrazionesoci.vercel.app
---

# LNI Messina — Web App

Web app per la gestione di pre-adesioni, check-in tramite QR code e controllo accessi della **Lega Navale Italiana — Sezione di Messina**.

Produzione: `https://registrazionesoci.vercel.app` — Deploy automatico Vercel su ogni push a `main`.

## Stack

| Componente | Tecnologia |
|---|---|
| Framework | Next.js 14.2.3 (App Router), TypeScript 5 |
| UI | React 18, TailwindCSS 3.4, `lucide-react`, `clsx`/`tailwind-merge` |
| Backend | Supabase (PostgreSQL 15, Auth, RLS) — `@supabase/supabase-js` 2.43.1 |
| QR scan | `html5-qrcode` 2.3.8 (scanner `/checkin`) |
| QR gen | `qrcode` 1.5.3 (generazione) |
| Email | `nodemailer` 6.9.13 (SMTP via GitHub Actions e API routes) |
| Hosting | Vercel (serverless) |

Script: `npm run dev` / `build` / `start` / `lint` (`next lint`).

## Ruoli e accesso

| Ruolo | Accesso | Note |
|---|---|---|
| Pubblico | Home, pre-iscrizione, recupero QR, validazione | Nessun login |
| Operatore | Scanner check-in, registro accessi | Login semplificato `operatore` (vedi README.md per credenziali; gestito da `OperatorGuard.tsx`, sessione Supabase Auth via email operatore) |
| Admin | Dashboard, gestione utenti, check-in | Login email/password Supabase Auth su `/login` |

Ruoli admin (`admin_users`): `admin_full` (gestione completa), `admin_monitor` (sola lettura), `checkin_operator`.

## Route

### Pubbliche
- `/` Home · `/register` Pre-iscrizione · `/recover-qr` Recupero QR · `/validate/[token]` Validazione QR · `/checkin` Scanner check-in (pubblico) · `/stampa/registrazione` Stampa QR · `/confirm-email` Double opt-in

### Operatore (login)
- `/operator` Hub · `/operator/accessi` Registro accessi (filtri 24h/12h/6h/4h) · `/operator/checkins` Monitoraggio

### Admin (login)
- `/login` · `/admin` Dashboard · `/admin/users` Utenti · `/admin/checkins` Storico check-in · `/admin/recipients` Destinatari report

## API Routes (`src/app/api/`)

| Route | Metodo | Funzione |
|---|---|---|
| `/api/register` | POST | Registrazione + anti-bot (honeypot + `elapsed` ≥ 3s) + duplicati |
| `/api/confirm-email` | POST | Double opt-in: crea nuovo token attivo (UPDATE bloccato da RLS) |
| `/api/send-qr` | POST | Invio QR email (recovery/admin) |
| `/api/admin/users` | GET/POST/PUT/DELETE | CRUD utenti (admin) |
| `/api/admin/users/export` | GET | Esportazione CSV |
| `/api/admin/checkins` | GET | Storico check-in |
| `/api/admin/role` | GET | Ruolo admin corrente |
| `/api/admin/recipients` | GET/POST | Destinatari report |
| `/api/admin/weekly-report-status` | GET/POST | Toggle report settimanale |
| `/api/auth/check-rate-limit` | GET | Rate limit login (5 falliti / 15 min → blocco IP) |
| `/api/auth/log-attempt` | POST | Log tentativi login + alert email |

## Database (Supabase project `rutkjmqfdsgtqdztyzyq`)

Tabelle: `users`, `qr_tokens`, `checkin_logs`, `admin_users`, `login_attempts`, `app_settings`, `report_recipients`.

File in `supabase/`: `schema.sql`, `migration_v2_double_optin.sql`, `migration_v3_rate_limit_weekly.sql`, `migration_v4_email_nullable.sql` (email opzionale, indice su phone), `migration_v5_dateofbirth_recipients.sql` (data di nascita + `report_recipients`), `gdpr_cleanup.sql`.

Punti chiave schema:
- `users`: `first_name`, `last_name`, `email` (nullable da v4), `phone`, `user_type` (`pre_member`/`active_member`), `status` (`active`/`expired`/`revoked`), `gdpr_consent`, `marketing_consent`, `registration_date`, `expiration_date`, `date_of_birth` (v5), RLS: INSERT pubblico, SELECT solo admin/operator.
- `qr_tokens`: `token` univoco 8 char, `is_active`; l'anon key NON può UPDATE → il double opt-in INSERTa un nuovo token attivo.
- `checkin_logs`: esiti `SUCCESS`/`EXPIRED`/`REVOKED`/`NOT_FOUND`/`GDPR_CONSENT`/`MARKETING_CONSENT`/`EMAIL_VERIFIED`; registra `device_info` e `ip_address`.
- Viste: `current_month_checkins`, `current_month_login_attempts`, `weekly_stats`.
- RLS basata su `get_admin_role()`.

## Sicurezza

- Anti-bot: honeypot `website` (→ 403) + `elapsed` ≥ 3000ms, in `/api/register` e `/api/send-qr` (niente check per flusso `/confirm-email`).
- Rate limiting login: `login_attempts`, 5 falliti in 15 min, alert email a leganavaleitalianamessina@gmail.com e francescoborgosano@gmail.com.
- QR senza dati personali (solo token nel formato `https://registrazionesoci.vercel.app/validate/<TOKEN>`).
- Pre-aderenti scaduti eliminati ogni 2 settimane (GDPR cleanup, 90 giorni validità).
- Licenza d'uso nel footer (`LicenseFooter.tsx`).

## GitHub Actions (`scripts/`, `service_role` key, nodemailer)

| Workflow | Schedule | Script |
|---|---|---|
| `monthly-report.yml` | 1° del mese 06:00 UTC | `scripts/monthly-report.mjs` (CSV utenti/check-in/login) |
| `weekly-dashboard.yml` | Lunedì 07:00 UTC | `scripts/weekly-dashboard.mjs` (statistiche, se abilitato) |
| `gdpr-cleanup.yml` | 1° e 15, 02:00 UTC | `scripts/gdpr-cleanup.mjs` (cancella pre-aderenti scaduti) |

## Variabili d'ambiente (nomi — in `.env.local` e Vercel)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`. Secrets GitHub: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_USER`, `EMAIL_PASS`.

## Documentazione di riferimento

- `Documentazione/ARCHITETTURA.md` — architettura completa (db, deploy, workflow, sicurezza).
- `Documentazione/WebAppSociLNIMessina.md` — specifica tecnica v3.2 (requisiti, GDPR, flussi).
- `Documentazione/GUIDA_UTENTE.md` — guida per pubblico/operatore/admin.
- `Documentazione/MANUALE_OPERATORE.md` — manuale operatore.

## Note operative

- Non salvare segreti nel repo; `.env.local` è gitignored.
- Le modifiche a DB richiedono eseguire le migration manualmente nella Dashboard Supabase.
- Convenzioni: componenti in `src/components/`, client Supabase in `src/lib/supabase.ts`, API routes in `src/app/api/*/route.ts`.
