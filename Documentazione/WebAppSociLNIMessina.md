# LNI MESSINA — WEB APP PRE-ADESIONE E CHECK-IN
# DOCUMENTO TECNICO ARCHITETTURALE COMPLETO
## Versione 3.1 — Migrazione da Google Apps Script a GitHub + Supabase

---

# 1. INTRODUZIONE

## Obiettivo del progetto

Realizzare una nuova WEB APP moderna, performante, sicura e facilmente mantenibile per la gestione:

- delle richieste di pre-adesione;
- dei soci attivi;
- del check-in tramite QRCode;
- del controllo accessi;
- del logging accessi;
- del recupero QRCode;
- dell'amministrazione utenti;
- della compliance GDPR.

La nuova architettura dovrà sostituire integralmente l’attuale implementazione basata su:

- Google Apps Script;
- Google Sheets;
- TinyURL;
- codici manuali testuali.

---

# 2. OBIETTIVI DELLA MIGRAZIONE

## Obiettivi funzionali

La nuova soluzione deve:

- mantenere l’attuale workflow operativo;
- migliorare velocità e stabilità;
- eliminare dipendenze da Google Apps Script;
- migliorare sicurezza e controllo accessi;
- introdurre QRCode dinamici;
- introdurre scanner QR tramite smartphone;
- introdurre ruoli amministrativi;
- migliorare audit e logging;
- migliorare UX mobile;
- mantenere semplicità operativa.

---

# 3. PRINCIPI ARCHITETTURALI

## Principi fondamentali

Il sistema deve essere:

- mobile-first;
- semplice da usare;
- veloce;
- sicuro;
- facilmente scalabile;
- GDPR compliant;
- modulare;
- facilmente estendibile.

---

# 4. ARCHITETTURA TECNOLOGICA

# 4.1 FRONTEND

## Framework

Utilizzare:

```text
Next.js
```

Versione consigliata:
- Next.js App Router.

---

## UI Framework

Utilizzare:

```text
TailwindCSS
```

---

## UI Philosophy

L’interfaccia deve essere:

- molto semplice;
- adatta a operatori non tecnici;
- ottimizzata per smartphone;
- con:
  - pulsanti grandi;
  - font grandi;
  - interazioni touch;
  - layout pulito.

NON creare dashboard enterprise complesse.

---

## PWA

La WEB APP deve essere configurata come:

```text
PWA - Progressive Web App
```

Funzioni richieste:
- installabile su smartphone;
- fullscreen;
- icona home;
- supporto camera;
- UX quasi nativa.

---

# 4.2 BACKEND

## Backend principale

Utilizzare:

```text
Supabase
```

---

## Servizi Supabase utilizzati

### PostgreSQL
Database principale.

### Auth
Gestione autenticazione admin/operatori.

### Storage
Archiviazione QRCode.

### Edge Functions
Logica backend avanzata.

### Row Level Security
Protezione dati.

### Cron Jobs
Cleanup GDPR automatico.

---

# 4.3 REPOSITORY

## Versioning

Utilizzare:

```text
GitHub
```

---

## Repository structure

```text
Documentazione/          — Documentazione tecnica e guide
src/
  app/                   — Route Next.js (App Router)
    admin/               — Pagine amministrazione
    api/                 — API route
    checkin/             — Scanner check-in
    login/               — Login amministratore
    operator/            — Pagine operatore
    stampa/              — Pagine stampabili
    validate/            — Validazione QR
    register/            — Pre-iscrizione
    recover-qr/          — Recupero QR
  components/            — Componenti riutilizzabili
  lib/                   — Librerie e utility
supabase/                — Schema DB e migrazioni
public/                  — Asset statici (logo, QR code PNG)
```

---

# 4.4 HOSTING

## Frontend hosting

Utilizzare:

```text
Vercel Free Plan
```

Dominio di produzione:

```text
https://registrazionesoci.vercel.app
```

---

# 5. MODELLO OPERATIVO

# 5.1 TIPOLOGIE UTENTI

Il sistema gestisce due categorie principali.

---

## PRE_MEMBER

Utente che:
- compila il form pubblico;
- richiede pre-adesione;
- riceve QRCode temporaneo.

Validità:
- 90 giorni.

---

## ACTIVE_MEMBER

Socio attivo:
- inserito manualmente da amministratore;
- già riconosciuto dalla LNI.

Può:
- ricevere QRCode;
- recuperare QRCode;
- effettuare check-in.

---

# 5.2 RUOLI OPERATIVI

## CHECKIN_OPERATOR

Può:
- accedere al registro accessi (login operatore);
- consultare esiti check-in con filtro orario.

NON può:
- modificare utenti;
- vedere dati completi;
- esportare dati.

Nota: lo scanner QR in `/checkin` è pubblico e non richiede login.
L'autenticazione operatore è necessaria solo per il registro accessi (`/operator/accessi`).

---

## ADMIN_MONITOR

Può:
- monitorare utenti;
- visualizzare statistiche;
- visualizzare log;
- visualizzare check-in.

NON può:
- modificare utenti;
- cancellare dati;
- inviare QR.

---

## ADMIN_FULL

Può:
- gestire utenti;
- creare soci attivi;
- modificare dati;
- rigenerare QR;
- revocare QR;
- inviare QR;
- esportare dati;
- gestire sistema.

---

# 6. USER EXPERIENCE

# 6.1 MODALITÀ PUBBLICA

## Route pubbliche

```text
/
```

Homepage.

---

```text
/register
```

Registrazione pre-adesione.

---

```text
/recover-qr
```

Recupero QRCode.

---

```text
/checkin
```

Scanner QR code per check-in. Accessibile a tutti, nessun login richiesto.

---

```text
/validate/[token]
```

Validazione QR code personale.

---

```text
/stampa/registrazione
```

Pagina ottimizzata per stampa con QR code pre-iscrizione.

---

# 6.2 MODALITÀ OPERATORE

## Route

```text
/operator
```

Home operatore (richiede login). Hub con pulsanti per scanner check-in e registro accessi.

Credenziali: utente `operatore`, password `verifica1!`.

---

```text
/operator/accessi
```

Registro accessi con filtro 24h/12h/6h/4h (richiede login). Mostra esiti check-in con badge colore.

---

```text
/operator/checkins
```

(Alternativa) Monitoraggio check-in via API route con Bearer token.

---

## Login operatore

L'autenticazione operatore usa Supabase Auth con email `operatore@leganavale.it`.
La UI presenta un form semplificato (solo utente/password, senza mostrare l'email).
Il componente `OperatorGuard.tsx` gestisce login/logout e verifica sessione esistente all'avvio.

---

# 6.3 MODALITÀ CHECK-IN (SCANNER)

## Route

```text
/checkin
```

Interfaccia fullscreen scanner (pubblica, nessun login).

---

## UX scanner

L’interfaccia scanner deve:

- aprire camera automaticamente;
- essere fullscreen;
- avere:
  - feedback verde/rosso;
  - vibrazione smartphone;
  - suono conferma;
  - esito immediato.

---

# 6.4 MODALITÀ ADMIN

## Route

```text
/admin
```

Dashboard.

---

```text
/admin/users
```

Gestione utenti.

---

```text
/admin/members
```

Gestione soci attivi.

---

```text
/admin/checkins
```

Monitoraggio accessi.

---

```text
/admin/logs
```

Audit logs.

---

# 7. DATABASE DESIGN

# 7.1 TABELLA USERS

```sql
create table users (
    id uuid primary key default gen_random_uuid(),

    first_name text not null,
    last_name text not null,

    email text not null,
    phone text,

    user_type text not null,
    -- pre_member | active_member

    status text not null,
    -- active | expired | revoked

    gdpr_consent boolean default false,
    marketing_consent boolean default false,

    registration_date timestamptz default now(),
    expiration_date timestamptz,

    created_by uuid,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

---

# 7.2 TABELLA QR_TOKENS

```sql
create table qr_tokens (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id),

    token text unique not null,

    is_active boolean default true,

    created_at timestamptz default now(),
    revoked_at timestamptz
);
```

---

# 7.3 TABELLA CHECKIN_LOGS

```sql
create table checkin_logs (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id),

    operator_id uuid,

    checkin_result text,

    device_info text,

    ip_address text,

    created_at timestamptz default now()
);
```

---

# 7.4 TABELLA ADMIN_USERS

```sql
create table admin_users (
    id uuid primary key default gen_random_uuid(),

    email text unique not null,

    role text not null,

    created_at timestamptz default now()
);
```

---

# 7.5 TABELLA AUDIT_LOGS

```sql
create table audit_logs (
    id uuid primary key default gen_random_uuid(),

    actor_id uuid,

    action_type text,

    target_type text,

    target_id text,

    metadata jsonb,

    created_at timestamptz default now()
);
```

---

# 7.6 TABELLA HOUSEHOLDS (OPZIONALE MA CONSIGLIATA)

Necessaria per gestione nuclei familiari.

```sql
create table households (
    id uuid primary key default gen_random_uuid(),

    email text,
    phone text,

    created_at timestamptz default now()
);
```

---

# 8. LOGICA QRCODE

# 8.1 REQUISITI

Il QRCode NON deve contenere:
- nome;
- cognome;
- email;
- telefono;
- dati personali.

---

# 8.2 FORMATO QR

Formato consigliato:

```text
https://app-domain/validate/TOKEN
```

Esempio:

```text
https://registrazionesoci.vercel.app/validate/8f2d91fa
```

---

# 8.3 CARATTERISTICHE TOKEN

Il token deve essere:
- randomico;
- univoco;
- rigenerabile;
- revocabile.

---

# 8.4 QRCODE RECOVERY

Il sistema deve consentire:
- reinvio QR;
- rigenerazione QR;
- invalidazione vecchi QR.

---

# 9. REGISTRAZIONE PRE-ADESIONE

# 9.1 FLUSSO

## STEP 1

Utente apre:

```text
/register
```

---

## STEP 2

Inserisce:
- nome;
- cognome;
- email;
- telefono;
- consenso GDPR;
- consenso marketing.

---

## STEP 3

Sistema:
- valida dati;
- controlla duplicati;
- controlla soci attivi.

---

## STEP 4

Sistema:
- crea utente;
- genera token QR;
- genera QRCode PNG.

---

## STEP 5

Sistema:
- invia email con QRCode.

---

# 9.2 CONTROLLI DUPLICATI

Verificare:
- nome;
- cognome;
- email;
- telefono.

---

# 9.3 VALIDITÀ

La pre-adesione:
- dura 90 giorni;
- poi viene:
  - cancellata;
  - oppure archiviata solo per marketing se consentito.

---

# 10. GESTIONE SOCI ATTIVI

# 10.1 INSERIMENTO MANUALE

ADMIN_FULL deve poter:
- inserire socio;
- associare email;
- associare telefono;
- generare QR.

---

# 10.2 INVIO QRCODE SU RICHIESTA

Funzione richiesta:
- inserimento email;
- ricerca socio;
- reinvio QRCode.

Valido per:
- soci attivi;
- pre-aderenti.

---

# 11. CHECK-IN

# 11.1 FLUSSO

## STEP 1

Operatore apre:

```text
/checkin
```

---

## STEP 2

Sistema:
- attiva camera;
- attiva scanner QR.

---

## STEP 3

Scanner legge token.

---

## STEP 4

Sistema:
- valida token;
- verifica stato;
- verifica scadenza;
- registra log.

---

## STEP 5

Sistema mostra:

### Esito positivo
- nome;
- cognome;
- stato valido.

### Esito negativo
- QR non valido;
- QR scaduto;
- QR revocato.

---

# 11.2 LIBRERIE QR SCANNER

Utilizzare:

```text
html5-qrcode
```

oppure:

```text
zxing-js
```

---

# 12. RECOVERY QRCODE

# 12.1 ROUTE

```text
/recover-qr
```

---

# 12.2 PROCEDURA

Utente inserisce:
- email.

---

# 12.3 SICUREZZA

Il sistema NON deve:
- reinviare immediatamente QR.

Il sistema deve:
- inviare link temporaneo;
- valido 15 minuti;
- monouso.

---

# 12.4 PROTEZIONI

Implementare:
- rate limiting;
- anti spam;
- anti enumeration.

---

# 13. PANNELLO ADMIN

# 13.1 DASHBOARD

Visualizzare:
- utenti registrati;
- soci attivi;
- check-in giornalieri;
- QR attivi;
- QR revocati;
- utenti scaduti.

---

# 13.2 GESTIONE UTENTI

Funzioni:
- ricerca;
- filtro;
- modifica;
- disattivazione;
- esportazione CSV.

---

# 13.3 GESTIONE QRCODE

Funzioni:
- rigenerazione;
- revoca;
- reinvio.

---

# 13.4 GESTIONE SOCI

Funzioni:
- inserimento manuale;
- modifica;
- attivazione/disattivazione.

---

# 13.5 AUDIT LOGS

Visualizzare:
- accessi admin;
- modifiche utenti;
- operazioni sensibili.

---

# 14. SICUREZZA

# 14.1 HTTPS

HTTPS obbligatorio.

---

# 14.2 AUTH

Utilizzare:
- Supabase Auth.

---

# 14.3 RLS

Abilitare:
- Row Level Security su tutte le tabelle.

---

# 14.4 RATE LIMITING

Proteggere:
- login;
- recovery QR;
- scanner;
- API pubbliche.

---

# 14.5 LOGGING

Registrare:
- IP;
- device;
- timestamp;
- operazioni admin.

---

# 15. GDPR

# 15.1 CONSERVAZIONE DATI

Pre-aderenti:
- eliminazione automatica dopo 90 giorni.

---

# 15.2 CONSENSO MARKETING

Conservare solo:
- utenti con consenso esplicito.

---

# 15.3 MINIMIZZAZIONE DATI

Operatori check-in devono vedere SOLO:
- nome;
- cognome;
- stato validità.

---

# 15.4 AUDIT

Tracciare:
- accessi admin;
- modifiche;
- esportazioni.

---

# 16. EMAIL SYSTEM

# 16.1 PROVIDER

Utilizzare:
- Resend
oppure
- Brevo.

---

# 16.2 EMAIL PRINCIPALI

## Registrazione
Invio QRCode.

---

## Recovery QR
Invio link temporaneo.

---

## Reinvio admin
Invio QR manuale.

---

# 17. LIBRERIE CONSIGLIATE

# Frontend

```text
Next.js
TailwindCSS
React Hook Form
Zod
```

---

# QR Scanner

```text
html5-qrcode
```

---

# QR Generation

```text
qrcode
```

---

# Backend

```text
Supabase
```

---

# 18. DEPLOYMENT

# 18.1 WORKFLOW

```text
VSCode
↓
GitHub Push
↓
Vercel Auto Deploy
↓
Production Update
```

---

# 18.2 ENV VARIABLES

Gestire:
- Supabase URL;
- Supabase Key;
- Email API Keys.

NON salvare segreti nel repository.

---

# 19. STRUTTURA DOCUMENTAZIONE

Creare:

```text
/docs/architecture.md
/docs/database.md
/docs/api.md
/docs/security.md
/docs/deployment.md
/docs/gdpr.md
```

---

# 20. PRIORITÀ IMPLEMENTAZIONE

# FASE 1
Setup repository.

---

# FASE 2
Setup Supabase.

---

# FASE 3
Database schema.

---

# FASE 4
Frontend registrazione.

---

# FASE 5
Generazione QR.

---

# FASE 6
Invio email.

---

# FASE 7
Scanner check-in.

---

# FASE 8
Pannello admin monitor.

---

# FASE 9
Pannello admin full.

---

# FASE 10
Recovery QR.

---

# FASE 11
Cleanup GDPR automatico.

---

# 21. EVOLUZIONI FUTURE

Possibili evoluzioni:
- wallet digitale;
- badge NFC;
- eventi;
- newsletter;
- notifiche push;
- gestione manifestazioni;
- statistiche avanzate;
- analytics accessi.

---

# 22. NOTE OPERATIVE IMPORTANTI

## NON utilizzare:
- Google Sheets;
- TinyURL;
- codici statici;
- dati personali nel QR.

---

## MANTENERE:
- UX semplice;
- mobile-first;
- font grandi;
- semplicità operativa.

---

# 23. OBIETTIVO FINALE

Realizzare una piattaforma:
- moderna;
- veloce;
- sicura;
- facilmente manutenibile;
- pronta per future evoluzioni;
- semplice da utilizzare per operatori e segreteria.

---

# 24. DOCUMENTI LEGACY

Il progetto attuale GAS/Google Sheets deve essere utilizzato:
- solo come riferimento funzionale;
- NON come riferimento architetturale.

La nuova implementazione deve essere completamente riscritta.

---

# 25. STATO DOCUMENTO

Questo documento rappresenta:
- specifica tecnica ufficiale;
- riferimento architetturale;
- guida per coding chat;
- base progettuale della nuova piattaforma.

---