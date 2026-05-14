# Guida Utente — Web App LNI Messina

**URL di produzione:** https://registrazionesoci.vercel.app

---

## Indice

- [Introduzione](#introduzione)
- [Accesso rapido](#accesso-rapido)
- [Pagine pubbliche (nessun login)](#pagine-pubbliche-nessun-login)
- [Pagine operatore (login richiesto)](#pagine-operatore-login-richiesto)
- [Pagine amministrazione (login email/password)](#pagine-amministrazione-login-emailpassword)
- [QR code di accesso rapido](#qr-code-di-accesso-rapido)
- [Link utili](#link-utili)
- [Risoluzione problemi](#risoluzione-problemi)

---

## Introduzione

La Web App LNI Messina consente di gestire:

- **Pre-iscrizioni online** — i nuovi utenti possono registrarsi autonomamente
- **Check-in tramite QR code** — gli operatori verificano l'accesso dei soci
- **Registro accessi** — monitoraggio degli ingressi
- **Amministrazione** — gestione utenti e statistiche

---

## Accesso rapido

| Servizio | Link | QR Code |
|---|---|---|
| Pre-iscrizione | https://registrazionesoci.vercel.app/register | `/qr-register.png` |
| Scanner Check-in | https://registrazionesoci.vercel.app/checkin | `/qr-checkin.png` |
| Home operatore | https://registrazionesoci.vercel.app/operator | — |
| Amministrazione | https://registrazionesoci.vercel.app/login | — |
| Pagina stampabile pre-iscrizione | https://registrazionesoci.vercel.app/stampa/registrazione | — |

---

## Pagine pubbliche (nessun login)

### Home (`/`)

Pagina principale con collegamenti a:
- **Richiesta Pre-Iscrizione** — modulo per nuovi utenti
- **Recupera QR Code** — per ricevere via email il proprio QR personale

### Pre-iscrizione (`/register`)

Modulo per richiedere la pre-adesione alla LNI Messina.

**Campi richiesti:**
- Nome, Cognome
- Email
- Telefono
- Consenso GDPR

**Flusso Double Opt-In (GDPR):**
1. Compila e invia il modulo
2. Ricevi una email di conferma all'indirizzo indicato
3. Clicca sul link **"Conferma Email"** presente nell'email
4. Dopo la conferma, il tuo QR code personale viene generato e mostrato a schermo
5. Riceverai anche una email con il QR code allegato

> **Nota bene:** Il QR code viene generato SOLO dopo la conferma dell'email. Questo garantisce che l'indirizzo email sia valido e che nessuno abbia inserito dati altrui.

### Recupero QR (`/recover-qr`)

In caso di smarrimento del QR code personale, inserisci la tua email per riceverlo nuovamente.

### Validazione QR (`/validate/[token]`)

Pagina di validazione: mostra il QR code personale e i dati associati al token.

### Scanner Check-in (`/checkin`)

Pagina pubblica per la verifica dei QR code all'ingresso. Nessun login richiesto.

**Come usarlo:**
1. Inquadra il QR code del socio con la fotocamera
2. Attendi il risultato:
   - **VERDE (VALIDO)** — accesso consentito, nome e tipo visualizzati
   - **ROSSO (NON VALIDO / SCADUTO)** — accesso negato
3. Premi **PROSSIMO SOCIO** per scansionare il successivo

### Stampa QR pre-iscrizione (`/stampa/registrazione`)

Pagina ottimizzata per la stampa con il QR code per la pre-iscrizione.

**Come stampare:**
1. Apri la pagina
2. Premi `Ctrl+P` (Windows) o `Cmd+P` (Mac)
3. Seleziona "Salva come PDF" o stampa

---

## Pagine operatore (login richiesto)

### Home operatore (`/operator`)

Pagina centrale dopo il login con credenziali operatore.

**Credenziali di accesso:**
- **Utente:** `operatore`
- **Password:** `verifica1!`

**Pulsanti disponibili:**
- **Scanner Check-in** — apre la pagina di verifica QR
- **Registro Accessi** — apre il registro degli ingressi

### Scanner Check-in (`/checkin`)

La stessa pagina pubblica di verifica QR. Accessibile anche senza login per comodità.

### Registro Accessi (`/operator/accessi`)

Elenco degli accessi registrati con filtro orario.

**Filtri disponibili:**
- Ultime 24 ore
- Ultime 12 ore
- Ultime 6 ore
- Ultime 4 ore

**Colori risultato:**
- ✅ **Verde** — Accesso riuscito (SUCCESS)
- ⏳ **Giallo** — QR scaduto (EXPIRED)
- ❌ **Rosso** — QR non trovato (NOT_FOUND)

**Pulsante Aggiorna** — ricarica i dati manualmente.

---

## Pagine amministrazione (login email/password)

Accesso tramite [https://registrazionesoci.vercel.app/login](https://registrazionesoci.vercel.app/login) con le credenziali email/password configurate su Supabase Auth.

### Dashboard (`/admin`)

Riepilogo statistiche:
- Utenti totali registrati
- QR code attivi
- Check-in effettuati oggi

**Pulsanti di navigazione:**
- **Gestione Utenti** — CRUD completo
- **Visualizza Ingressi** — check-in per data
- **Registrazione Pubblica** (solo admin_full) — apre il modulo di pre-iscrizione

### Gestione Utenti (`/admin/users`)

Tabella con tutti gli utenti (soci e pre-aderenti).

**Azioni disponibili:**
- Aggiungi nuovo socio attivo
- Modifica dati utente
- Rigenera / revoca QR code
- Invia QR code via email
- Elimina utente

### Visualizza Check-in (`/admin/checkins`)

Ricerca check-in per data con riepilogo giornaliero e mensile.

---

## QR code di accesso rapido

I QR code sono disponibili come immagini PNG per essere stampati e affissi in sede.

| QR Code | URL | Utilizzo |
|---|---|---|
| `/qr-register.png` | https://registrazionesoci.vercel.app/register | Per pre-iscrizione |
| `/qr-checkin.png` | https://registrazionesoci.vercel.app/checkin | Per scanner check-in |

---

## Link utili

| Descrizione | URL |
|---|---|
| Web App | https://registrazionesoci.vercel.app |
| Pre-iscrizione | https://registrazionesoci.vercel.app/register |
| Scanner Check-in | https://registrazionesoci.vercel.app/checkin |
| Home operatore | https://registrazionesoci.vercel.app/operator |
| Registro Accessi | https://registrazionesoci.vercel.app/operator/accessi |
| Amministrazione | https://registrazionesoci.vercel.app/login |
| Dashboard admin | https://registrazionesoci.vercel.app/admin |
| Stampa QR | https://registrazionesoci.vercel.app/stampa/registrazione |
| Repository GitHub | https://github.com/leganavaleitalianamessina-ops/registrazionesoci |

---

## Risoluzione problemi

### La fotocamera dello scanner non si attiva
- Assicurati di usare **HTTPS** (non HTTP)
- Concedi il permesso di accesso alla fotocamera nel browser
- Prova con un browser recente (Chrome, Edge, Safari)

### Il QR code non viene riconosciuto
- Il QR code potrebbe essere danneggiato
- Prova a regolare luminosità e contrasto
- Assicurati che il QR sia ben inquadrato

### Non ricevo il QR code via email
- Controlla la cartella Spam / Promozioni
- Verifica che l'email inserita sia corretta
- Contatta un amministratore per il reinvio manuale

### Problemi di accesso operatore
- Verifica le credenziali: utente `operatore`, password `verifica1!`
- La password è **case-sensitive**
- Contatta l'amministratore se il problema persiste
