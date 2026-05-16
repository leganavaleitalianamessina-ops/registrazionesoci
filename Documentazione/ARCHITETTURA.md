# Architettura dell'Applicativo Web LNI Messina

## Panoramica

Applicativo web per la gestione di pre-iscrizioni, check-in con QR code e controllo accessi della Lega Navale Italiana – Sezione di Messina.

- **Frontend/Backend**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Codice sorgente**: GitHub
- **Hosting & Deploy**: Vercel
- **Task automatici**: GitHub Actions (report, GDPR cleanup)

URL produzione: `https://registrazionesoci.vercel.app`

---

## 1. Supabase — Database & Autenticazione

**Ruolo:** Backend-as-a-Service — fornisce database PostgreSQL, autenticazione e RLS.

**URL progetto:** `https://rutkjmqfdsgtqdztyzyq.supabase.co`

### Database

Tabelle principali:

| Tabella | Contenuto |
|---|---|
| `users` | Soci e pre-aderenti (Nome, Cognome, Telefono, tipo, stato, scadenza) |
| `qr_tokens` | Token QR univoci associati agli utenti |
| `checkin_logs` | Storico ingressi con esito (SUCCESS/EXPIRED/NOT_FOUND) |
| `admin_users` | Mappatura utenti Supabase Auth → ruoli (admin_full, admin_monitor, checkin_operator) |
| `login_attempts` | Tentativi di login per rate limiting |
| `app_settings` | Impostazioni applicative (es. weekly_report_enabled) |

### Due chiavi di accesso

| Chiave | Dove usata | Permessi |
|---|---|---|
| `anon key` (pubblica) | Frontend React, API routes pubbliche (`/api/register`, scanner QR, rate limit) | Solo INSERT/SELECT su tabelle pubbliche (filtrate da RLS) |
| `service_role key` (segreta) | Script GitHub Actions (`scripts/*.mjs`) | Bypassa RLS, accesso totale |

### Autenticazione

- **Admin**: login via Supabase Auth (email/password) su `/login`. JWT restituito e usato per autenticare le chiamate API admin.
- **Operatore**: login semplificato (`operatore`/`verifica1!`) gestito lato client da `OperatorGuard.tsx`, senza account Supabase Auth.
- **Check-in pubblico**: scanner su `/checkin` senza alcuna autenticazione.

### Row Level Security (RLS)

Policy definite su ogni tabella per ruolo. Esempi:

- `users`: Anyone può INSERT (registrazione pubblica); solo admin/operator possono SELECT
- `qr_tokens`: Anyone può INSERT e SELECT attivi per validazione QR
- `checkin_logs`: Anyone può INSERT (dallo scanner); admin/operator possono SELECT
- `admin_users`: solo admin_full può gestire; ogni utente vede il proprio ruolo

---

## 2. Vercel — Hosting & Deploy

**Ruolo:** Piattaforma serverless per il frontend Next.js e le API route.

**URL:** `https://registrazionesoci.vercel.app`

### Funzioni

- **Hosting pagine statiche e SSR**: ogni route Next.js diventa una funzione serverless o statica
- **API Routes**: ogni file in `src/app/api/*/route.ts` è una serverless function Node.js
- **Deploy automatico**: ogni push su `main` (GitHub) attiva un nuovo deploy Vercel

### Pagine

| Route | Tipo | Descrizione |
|---|---|---|
| `/` | Statico | Home page (scelta registrazione / recupero QR) |
| `/register` | Statico | Form di pre-iscrizione pubblica |
| `/recover-qr` | Statico | Recupero QR via telefono |
| `/checkin` | Statico | Scanner QR code per operatori |
| `/login` | Statico | Login amministrazione |
| `/admin` | SSR | Dashboard admin con statistiche |
| `/admin/users` | SSR | CRUD utenti |
| `/admin/checkins` | SSR | Storico ingressi |
| `/operator` | SSR | Home operatore |
| `/operator/accessi` | SSR | Registro accessi |
| `/operator/checkins` | SSR | Monitoraggio operatori |

### API Routes

| Route | Metodo | Funzione |
|---|---|---|
| `/api/register` | POST | Registrazione nuovo utente + QR |
| `/api/admin/users` | GET/POST/PUT/DELETE | CRUD utenti (admin) |
| `/api/admin/checkins` | GET | Storico check-in (admin) |
| `/api/admin/role` | GET | Ruolo admin corrente |
| `/api/admin/weekly-report-status` | GET/POST | Toggle report settimanale |
| `/api/auth/check-rate-limit` | GET | Verifica rate limiting login |
| `/api/auth/log-attempt` | POST | Registra tentativo login + alert |
| `/api/send-qr` | POST | Invio QR email |

### Variabili d'ambiente (Vercel)

| Variabile | Visibilità |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pubblica (client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pubblica (client-side) |
| `NEXT_PUBLIC_APP_URL` | Pubblica (client-side) |

---

## 3. GitHub — Codice Sorgente & Automazione

**Ruolo:** Repository del codice sorgente e orchestrazione task automatici.

**Repository:** `github.com/leganavaleitalianamessina-ops/registrazionesoci.git`

### GitHub Actions — Workflow automatici

Tutti gli script si connettono a Supabase con `service_role key` (bypassa RLS) e usano `nodemailer` per l'invio email.

| Workflow | Schedule | Esegue | Cosa fa |
|---|---|---|---|
| `monthly-report.yml` | 1° del mese, 06:00 UTC | `scripts/monthly-report.mjs` | Genera e invia CSV (utenti, check-in, login_attempts del mese) |
| `weekly-dashboard.yml` | Ogni lunedì, 07:00 UTC | `scripts/weekly-dashboard.mjs` | Statistiche settimanali con breakdown giornaliero (se abilitato) |
| `gdpr-cleanup.yml` | 1° e 15 del mese, 02:00 UTC | `scripts/gdpr-cleanup.mjs` | Elimina pre-aderenti scaduti (cascata su qr_tokens e checkin_logs) |

### Secrets GitHub configurati

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
EMAIL_USER
EMAIL_PASS
```

I destinatari email sono codificati direttamente nei workflow YAML.

### Struttura del repository

```
/
├── .github/workflows/       # Workflow GitHub Actions
├── Documentazione/          # Documenti e immagini QR
├── public/                  # Asset statici (logo, QR)
├── scripts/                 # Script automatici (Node.js)
│   ├── monthly-report.mjs
│   ├── weekly-dashboard.mjs
│   └── gdpr-cleanup.mjs
├── src/
│   ├── app/
│   │   ├── api/             # API routes (Next.js serverless)
│   │   ├── admin/           # Pannello amministrazione
│   │   ├── operator/        # Pannello operatore
│   │   ├── checkin/         # Scanner QR
│   │   ├── register/        # Registrazione pubblica
│   │   ├── recover-qr/      # Recupero QR via telefono
│   │   └── login/           # Login admin
│   ├── components/          # Componenti riutilizzabili
│   └── lib/                 # Utility (client Supabase)
├── supabase/
│   ├── schema.sql           # Schema iniziale
│   └── migration_*.sql      # Migration successive
├── .env.local               # Variabili d'ambiente locali
├── LICENSE.txt              # Licenza d'uso LNI Messina
├── package.json
└── next.config.mjs
```

---

## 4. Diagramma di Interazione

```
┌─────────────────────────────────────────────────────────────────┐
│                        GITHUB                                    │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │ monthly-report  │  │ weekly-        │  │ gdpr-cleanup     │   │
│  │ (1° del mese)   │  │ dashboard      │  │ (1° e 15)        │   │
│  │                 │  │ (lunedì)       │  │                   │   │
│  └────────┬────────┘  └───────┬────────┘  └────────┬─────────┘   │
│           │                   │                     │             │
│           └───────────────────┼─────────────────────┘             │
│                               │                                   │
│                  Node 20 + service_role key                       │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
│  ┌──────────────────────┐  ┌─────────────────────────────────┐   │
│  │    PostgreSQL DB      │  │      Auth (Supabase Auth)       │   │
│  │  - users              │  │  - Admin login (email/password) │   │
│  │  - qr_tokens          │  │  - JWT token validation         │   │
│  │  - checkin_logs       │  │                                 │   │
│  │  - admin_users        │  └─────────────────────────────────┘   │
│  │  - login_attempts     │        ▲                               │
│  │  - app_settings       │        │                               │
│  └───────────────────────┘        │                               │
└───────────────────────────────────────────────────────────────────┘
          ▲                         │
          │ (anon key)              │ (anon key + user JWT)
          │                         │
          ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 (App Router)                        │ │
│  │  ┌──────────────┐ ┌───────────────┐ ┌─────────────────────┐ │ │
│  │  │  Static Page │ │  SSR Pages    │ │  API Routes (server.│ │ │
│  │  │  (CDN cached) │ │  (serverless)│ │  less functions)    │ │ │
│  │  │              │ │               │ │                     │ │ │
│  │  │  /           │ │  /admin       │ │  /api/register      │ │ │
│  │  │  /checkin    │ │  /admin/users │ │  /api/admin/users   │ │ │
│  │  │  /login      │ │  /admin/check.│ │  /api/auth/*        │ │ │
│  │  │  /register   │ │  /operator/*  │ │  /api/admin/*       │ │ │
│  │  │  /recover-qr  │ │  /operator   │ │  /api/send-qr       │ │ │
│  │  └──────────────┘ └───────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  https://registrazionesoci.vercel.app                             │
└───────────────────────────────────────────────────────────────────┘
          ▲
          │ push su main
          │
┌─────────┴────────┐
│    GitHub Repo   │
│  (sorgente)      │
└──────────────────┘
```

---

## 5. Flussi Operativi

### Registrazione Pubblica
1. Utente compila form su `/register` (Nome, Cognome, Telefono, consensi GDPR, honeypot + timer anti-bot)
2. `POST /api/register` → Supabase `anon key` → INSERT `users` + `qr_tokens` (con `is_active: true`)
3. QR code generato con libreria `qrcode` e mostrato immediatamente a schermo
4. Recupero QR via `/recover-qr` inserendo il telefono

### Check-in QR
1. Operatore inquadra QR con fotocamera su `/checkin` (libreria `html5-qrcode`)
2. Token estratto dall'URL, validato su Supabase: SELECT `qr_tokens` JOIN `users`
3. Verifica scadenza (`expiration_date`)
4. INSERT `checkin_logs` con esito (`SUCCESS` / `EXPIRED` / `REVOKED` / `NOT_FOUND`)
5. Feedback visivo (schermata verde/rossa) e sonoro (beep)

### Login Amministrazione
1. Admin inserisce credenziali su `/login`
2. Verifica rate-limit via `/api/auth/check-rate-limit` (conta tentativi falliti IP in 15 min)
3. Supabase Auth valida email/password, restituisce JWT
4. `createAuthClient(token)` crea client Supabase autenticato con JWT
5. Ogni API admin verifica ruolo tramite `checkAdmin()` su tabella `admin_users`
6. Tentativi falliti registrati via `/api/auth/log-attempt` (alert email a 5 fallimenti)

### Report Automatici (GitHub Actions)
1. Workflow schedulato (cron) parte su runner GitHub Actions
2. `npm ci` installa dipendenze
3. Script Node.js si connette a Supabase con `service_role key` (bypassa RLS)
4. Legge dati, genera CSV/statistiche, invia email SMTP via `nodemailer`
5. `ws` package incluso per compatibilità WebSocket su Node.js 20

---

## 6. Tecnologie

| Componente | Tecnologia | Versione |
|---|---|---|
| Framework | Next.js | 14.2.3 (App Router) |
| Linguaggio | TypeScript / JavaScript | 5.x / ES2022 |
| Runtime Node | Node.js (Vercel / GitHub Actions) | 18.x / 20.x |
| Database | Supabase (PostgreSQL) | 15 |
| Client DB | `@supabase/supabase-js` | 2.43.1 |
| QR scan | `html5-qrcode` | 2.3.8 |
| QR generate | `qrcode` | 1.5.3 |
| Email | `nodemailer` | 6.9.13 |
| WebSocket | `ws` | 8.20.1 |
| Auth helpers | `@supabase/auth-helpers-nextjs` | 0.10.0 |
| UI | React 18, Tailwind CSS, CSS-in-JS | — |
| Deploy | Vercel | — |
| CI/CD | GitHub Actions | — |
| Icone | `lucide-react` | 0.378.0 |

---

## 7. Sicurezza

- **Rate limiting login**: 5 tentativi falliti in 15 min → blocco IP 15 min + alert email a leganavaleitalianamessina@gmail.com e francescoborgosano@gmail.com
- **Anti-bot form**: honeypot invisibile (campo `website` nascosto) + time-to-submit ≥ 3 secondi
- **RLS Supabase**: policy granulari per ruolo su ogni tabella
- **QR token**: stringa alfanumerica 8 caratteri, univoca, uno attivo per utente
- **Duplicati telefono**: blocco a livello API sia su registrazione pubblica sia su pannello admin
- **Licenza d'uso**: footer su tutte le pagine admin/operator/checkin
- **GDPR**: link informativa privacy nel form di registrazione, consenso obbligatorio
- **Pulizia automatica**: eliminazione pre-aderenti scaduti ogni 2 settimane (GDPR cleanup)
