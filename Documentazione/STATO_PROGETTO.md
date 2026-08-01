# Stato Progetto — LNI Messina Web App

Registro delle attività eseguite sul progetto. Aggiornare questo file a ogni intervento (data, descrizione, commit, esito deploy).

Ultimo aggiornamento: 2026-08-01

---

## Riepilogo stato attuale

- **Landing page `/promozione`**: attiva in produzione, visualizza solo il poster promozionale (immagine full-screen `object-contain`, altezza viewport dinamica `100dvh`), responsive mobile, senza loghi/link.
- **Tailwind CSS ora funzionante**: mancava `postcss.config.js` e la cache di build di Next non rigenera al solo cambio di config; risolto con `postcss.config.js` + cambio a `globals.css`. Da ora tutte le classi utility Tailwind del sito sono attive (prima non venivano generate).
- **Skill opencode**: `lni-messina` (contesto progetto), `lni-messina-git` (procedure commit/push/deploy).
- **Repository**: `github.com/leganavaleitalianamessina-ops/registrazionesoci`, branch `main`.
- **Produzione**: https://registrazionesoci.vercel.app — auto-deploy Vercel da GitHub.

---

## Registro attività

| Data | Commit | Attività | Esito |
|---|---|---|---|
| 2026-08-01 | `d4b90c4` | Creata skill di contesto `.opencode/skills/lni-messina/SKILL.md` | OK |
| 2026-08-01 | `d4b90c4` | Creata landing page `/promozione` (poster 1080×3200 ottimizzato a 720px JPEG 376KB in `public/promozione/poster.jpg`, header LNI + poster scrollabile + CTA) | Deploy OK |
| 2026-08-01 | `a460773` | Rivista landing `/promozione`: solo immagine full-screen `object-contain` su sfondo nero, niente loghi/link/header/footer, responsive mobile | Deploy OK |
| 2026-08-01 | `2c8cc22` | Aggiornata skill `lni-messina` (sezione Git/Deploy) + creata skill `lni-messina-git` (auth push via Windows Credential Manager + auto-deploy Vercel) e file `STATO_PROGETTO.md` | OK (no deploy richiesto) |
| 2026-08-01 | `637f0c2` | Aggiunto pulsante "Le nostre attività" nella pagina di conferma registrazione (link a `/promozione`) | Deploy OK |
| 2026-08-01 | `7079bed` | Pulsante "Le nostre attività" reso rosso (#dc3545) | Deploy OK |
| 2026-08-01 | `d71245d` | Fix `/promozione`: altezza viewport dinamico `100dvh` (fallback `100vh`) | Deploy OK (fix inefficace senza compilazione Tailwind) |
| 2026-08-01 | `b7b498b` | **Fix root cause**: creato `postcss.config.js` (plugin tailwindcss) — mancava del tutto, le utility Tailwind (h-screen, max-h-full, object-contain, 100dvh, ecc.) non venivano generate in nessuna pagina | Deploy non efficace: la cache di build di Next non si invalida al solo cambio di postcss.config.js |
| 2026-08-01 | `6070b43` | **Fix cache PostCSS**: aggiunta regola `html, body { height: 100% }` a `globals.css` per forzare il re-process di Tailwind (la cache di build di Next ignora i cambi di postcss.config.js). CSS rigenerato con tutte le utility | Deploy OK — `/promozione` si adatta correttamente allo schermo |

---

## Credenziali e note operative (sintesi)

- `gh` CLI non autenticato; il prompt GCM fallisce in sessione non interattiva. Push funzionante leggendo la credenziale `git:https://github.com` da Windows Credential Manager (dettagli in skill `lni-messina-git`).
- Il CLI Vercel locale (`footballdatamaster`) non possiede il progetto: usare solo l'auto-deploy da GitHub.
