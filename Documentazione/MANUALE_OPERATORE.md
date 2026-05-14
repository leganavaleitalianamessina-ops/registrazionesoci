# Manuale Operatore — Web App LNI Messina

**URL:** https://registrazionesoci.vercel.app

---

## Indice

- [Introduzione](#introduzione)
- [Login Operatore](#login-operatore)
- [Home Operatore](#home-operatore)
- [Scanner Check-in](#scanner-check-in)
- [Registro Accessi](#registro-accessi)
- [Guida Rapida](#guida-rapida)
- [Risoluzione Problemi](#risoluzione-problemi)

---

## Introduzione

Questo manuale è rivolto agli **operatori check-in** della LNI Messina.

Come operatore puoi:
- **Verificare i QR code** all'ingresso tramite scanner
- **Consultare il registro degli accessi** nelle ultime ore

Non hai accesso alla sezione amministrazione (gestione utenti, statistiche avanzate, esportazioni).

---

## Login Operatore

### Come accedere

1. Apri il browser sul tuo smartphone o computer
2. Vai su: **https://registrazionesoci.vercel.app/operator**
3. Inserisci le credenziali:

| Campo | Valore |
|-------|--------|
| Utente | `operatore` |
| Password | `verifica1!` |

4. Clicca su **Accedi**

### Cosa vedi dopo il login

La **Home Operatore** con due pulsanti principali:
- **Scanner Check-in** — per verificare i QR code all'ingresso
- **Registro Accessi** — per vedere gli ingressi registrati

### Come uscire

Nella Home Operatore, clicca su **Esci** (in alto a destra) per terminare la sessione.

---

## Home Operatore

La home page è il tuo hub di lavoro.

### Pulsante "Scanner Check-in"
Apre la fotocamera per scansionare i QR code dei soci all'ingresso.
- Accessibile anche senza login all'indirizzo `/checkin`
- Non richiede autenticazione per comodità operativa

### Pulsante "Registro Accessi"
Apre l'elenco degli accessi registrati, con filtro orario.
- Richiede login (protetto)
- Mostra solo dati di accesso, nessun dato sensibile

### Link "Esci"
Termina la sessione operatore e torna alla schermata di login.

---

## Scanner Check-in

### Come usare lo scanner

1. Dalla Home Operatore, clicca su **Scanner Check-in**
2. Concedi il permesso di accesso alla fotocamera (se richiesto)
3. Inquadra il QR code del socio con la fotocamera

### Esiti della scansione

#### ✅ ACCESSO CONSENTITO (Verde)
- Nome e cognome del socio vengono visualizzati
- Tipologia: "Socio Attivo" o "Pre-Aderente"
- Il sistema registra automaticamente l'accesso

#### ❌ ACCESSO NEGATO (Rosso)
- **NON VALIDO** — il QR code non è registrato nel sistema
- **SCADUTO** — il QR code non è piu' valido

### Dopo la scansione

- Premi **PROSSIMO SOCIO** per scansionare il QR successivo
- Lo scanner si riattiva automaticamente

### Suggerimenti per scansioni efficaci

- Mantieni il QR code a circa 15-20 cm dalla fotocamera
- Evita riverberi e riflessi sul QR code
- Assicurati che il QR code sia integro (non strappato o danneggiato)
- In caso di scarsa illuminazione, attiva il flash dello smartphone

---

## Registro Accessi

### Come accedere

Dalla Home Operatore, clicca su **Registro Accessi**.

### Filtro orario

Puoi scegliere l'intervallo di tempo da visualizzare:

| Filtro | Descrizione |
|--------|-------------|
| Ultime 24h | Tutti gli accessi dell'ultimo giorno |
| Ultime 12h | Accessi delle ultime 12 ore |
| Ultime 6h | Accessi delle ultime 6 ore |
| Ultime 4h | Accessi delle ultime 4 ore |

Clicca sul filtro desiderato per aggiornare l'elenco.

### Riepilogo

In alto viene mostrato il **totale degli accessi** nel periodo selezionato.

### Elenco accessi

Ogni riga mostra:
- **Nome e Cognome** del socio
- **Data e ora** dell'accesso (formato italiano)
- **Icona colore** del risultato:

| Icona | Colore | Significato |
|-------|--------|-------------|
| ✅ | Verde | Accesso riuscito |
| ⏳ | Giallo | QR scaduto |
| ❌ | Rosso | QR non trovato |

### Pulsante Aggiorna

Clicca **Aggiorna** per ricaricare manualmente i dati.

### Navigazione

Clicca su **← Home Operatore** (in alto) per tornare alla home page.

---

## Guida Rapida

### Scenario 1: Ingresso socio con QR code

1. Apri **Scanner Check-in** dalla Home
2. Inquadra il QR code del socio
3. Leggi l'esito (✅ verde = ok, ❌ rosso = negato)
4. Premi **PROSSIMO SOCIO** per continuare

### Scenario 2: Verificare quanti accessi oggi

1. Dalla Home, clicca su **Registro Accessi**
2. Seleziona **Ultime 24h**
3. Leggi il totale nella card blu in alto
4. Scorri l'elenco per vedere i dettagli

### Scenario 3: Cercare accessi recenti (ultime ore)

1. Apri **Registro Accessi**
2. Seleziona **Ultime 4h** o **Ultime 6h**
3. L'elenco mostrera' solo gli ingressi di quel periodo

---

## Risoluzione Problemi

### La fotocamera non si attiva

- Usa **HTTPS** (non HTTP)
- Concedi il permesso fotocamera quando richiesto dal browser
- Prova con Chrome, Edge o Safari (ultima versione)
- Su iPhone: Safari e' consigliato
- Alcuni browser richiedono di toccare lo schermo per attivare la fotocamera

### Il QR code non viene letto

- Avvicina o allontana il QR dalla fotocamera
- Evita riflessi e ombre sul QR
- Pulisci lo schermo del telefono del socio se necessario
- Regola la luminosita' dello schermo del socio

### Il Registro Accessi non mostra dati

- Cambia filtro orario (es. da 4h a 24h)
- Clicca **Aggiorna** per ricaricare
- Verifica di essere connesso a Internet

### Problemi di login

- Controlla di aver digitato correttamente le credenziali:
  - Utente: `operatore`
  - Password: `verifica1!`
- La password e' **case-sensitive** (lettere minuscole/maiuscole contano)
- Se il problema persiste, contatta l'amministratore

### Errori durante l'uso

- **"Sessione scaduta"** → effettua di nuovo il login dalla Home Operatore
- **"Richiesta troppo rapida"** → attendi qualche secondo e riprova
- **"Errore di comunicazione"** → verifica la connessione Internet e riprova

---

## Note Importanti

- Lo scanner check-in e' **pubblico** (accessibile anche senza login su `/checkin`)
- Il registro accessi e' **protetto da login** (solo operatori autorizzati)
- I dati visualizzati nel registro accessi sono limitati a nome, cognome, data e risultato
- Non vengono mostrati dati sensibili (email, telefono, indirizzo)
- Per qualsiasi necessita' amministrativa, contatta il responsabile di sede
