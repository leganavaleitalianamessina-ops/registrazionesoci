# LNI Messina — Web App

Web app per la gestione di pre-adesioni, check-in tramite QR code e controllo accessi della **Lega Navale Italiana — Sezione di Messina**.

**URL di produzione:** https://registrazionesoci.vercel.app

---

## Ruoli e accesso

| Ruolo | Accesso | Login |
|---|---|---|
| **Pubblico** | Home, pre-iscrizione, recupero QR, validazione | Nessuno |
| **Operatore** | Scanner check-in, registro accessi | `operatore` / `verifica1!` |
| **Amministratore** | Dashboard, gestione utenti, check-in | Email/password Supabase |

---

## Pagine principali

### Pubbliche (nessun login richiesto)

| Pagina | URL | QR Code |
|---|---|---|
| Home | `/` | — |
| Pre-iscrizione | `/register` | `/qr-register.png` |
| Recupero QR | `/recover-qr` | — |
| Validazione QR | `/validate/[token]` | — |
| Scanner Check-in | `/checkin` | `/qr-checkin.png` |
| Stampa QR pre-iscrizione | `/stampa/registrazione` | — |

### Operatore (login richiesto)

| Pagina | URL |
|---|---|
| Home operatore | `/operator` |
| Scanner Check-in | `/checkin` |
| Registro Accessi | `/operator/accessi` |

### Amministrazione (login email/password richiesto)

| Pagina | URL |
|---|---|
| Login amministratore | `/login` |
| Dashboard | `/admin` |
| Gestione utenti | `/admin/users` |
| Visualizza check-in | `/admin/checkins` |

---

## QR Code di accesso rapido

| Descrizione | URL |
|---|---|
| QR pre-iscrizione (stampa) | `/qr-register.png` |
| QR check-in (stampa) | `/qr-checkin.png` |
| Pagina stampabile pre-iscrizione | `/stampa/registrazione` |

---

## Sviluppo locale

```bash
# Installa dipendenze
npm install

# Crea file .env.local con:
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Avvia in sviluppo
npm run dev

# Build di produzione
npm run build
```

---

## Documentazione

| File | Descrizione |
|---|---|
| `Documentazione/WebAppSociLNIMessina.md` | Documento tecnico architetturale completo |
| `Documentazione/GUIDA_UTENTE.md` | Guida utente per pubblico, operatore e admin |

---

## Tecnologie

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Hosting:** Vercel
- **QR Code:** `html5-qrcode` (scanner), `qrcode` (generazione)
