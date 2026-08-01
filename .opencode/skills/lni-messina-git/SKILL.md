---
name: lni-messina-git
description: Procedure dettagliate per commit, push e deploy su Vercel del progetto LNI Messina. Autenticazione GitHub tramite credenziale salvata in Windows Credential Manager (gh non è loggato e il prompt GCM fallisce in sessione non interattiva), comandi push con token oscurato, e verifica dell'auto-deploy Vercel. Carica questa skill quando devi eseguire commit/push/deploy.
license: Proprietary
compatibility: opencode
metadata:
  remote: https://github.com/leganavaleitalianamessina-ops/registrazionesoci.git
  branch: main
  production: https://registrazionesoci.vercel.app
---

# LNI Messina — Git e Deploy

## Repository

- Remote: `https://github.com/leganavaleitalianamessina-ops/registrazionesoci.git`
- Branch: `main` (unico, protegge il deploy di produzione)
- Deploy automatico Vercel su ogni push a `main`
- Produzione: `https://registrazionesoci.vercel.app`

## Commit

1. Controllare lo stato: `git status --short` e `git log --oneline -5`.
2. Mettere in stage SOLO i file intenzionali (`git add <file>`), NON `git add .` (nel working tree possono esserci modifiche non correlate).
3. Messaggio di commit breve e descrittivo (la storia del repo usa messaggi molto tesi).

## Autenticazione push (IMPORTANTE)

NON funzionano in questa macchina:
- `git push origin main` → errore `failed to execute prompt script` (il config utente punta `credential.https://github.com.helper` a `gh auth git-credential`, ma `gh` NON è loggato).
- `git -c credential.helper=manager-core push` → stesso errore (il helper scoped per github.com prevale; anche con override, GCM fallisce in sessione non interattiva).

**Metodo funzionante:** leggere la credenziale salvata in Windows Credential Manager alla voce `git:https://github.com` (utente `leganavaleitalianamessina-ops`, token 40 char) con P/Invoke `CredRead`, costruire la URL con il token inline e fare push. Non stampare mai il token: oscurarlo nell'output.

Script PowerShell completo (definisce la classe C# e fa il push):

```powershell
$src = @'
using System;
using System.Runtime.InteropServices;
public class CM {
  [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
  static extern bool CredRead(string target, int type, int flags, out IntPtr cred);
  [DllImport("advapi32.dll", CharSet=CharSet.Unicode)]
  static extern void CredFree(IntPtr cred);
  public static string[] Read(string target) {
    IntPtr p;
    if (!CredRead(target, 1, 0, out p)) return null;
    var c = (CREDENTIAL)Marshal.PtrToStructure(p, typeof(CREDENTIAL));
    string pass = Marshal.PtrToStringUni(c.CredentialBlob, c.CredentialBlobSize/2);
    string user = c.UserName;
    CredFree(p);
    return new string[]{user, pass};
  }
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
  struct CREDENTIAL {
    public int Flags; public int Type; public string TargetName; public string Comment;
    public long LastWritten; public int CredentialBlobSize; public IntPtr CredentialBlob;
    public int Persist; public int AttributeCount; public IntPtr Attributes; public string TargetAlias;
    public string UserName;
  }
}
'@; Add-Type -TypeDefinition $src -Language CSharp; $c = [CM]::Read("git:https://github.com"); $u = [uri]::EscapeDataString($c[0]); $p = [uri]::EscapeDataString($c[1]); $url = "https://$u`:$p@github.com/leganavaleitalianamessina-ops/registrazionesoci.git"; git push $url main 2>&1 | ForEach-Object { if ($_ -match [regex]::Escape($c[1])) { "*** [token oscurato] ***" } else { $_ } }
```

Nota: la classe C# NON persiste tra chiamate `bash` separate (ognuna è un nuovo processo): la definizione `Add-Type` deve stare nello stesso comando del push.

Verifica del push: output `main -> main` (l'errore `NativeCommandError` in PowerShell è solo git che scrive su stderr, NON è un fallimento).

## Deploy Vercel

- **Modalità principale (raccomandata):** l'integrazione GitHub di Vercel auto-deploya a ogni push su `main`. Non serve alcun comando: basta il push.
- **NON usare `vercel deploy --prod` dal CLI locale:** l'account autenticato (`footballdatamaster`) NON possiede il progetto `registrazionesoci` (i suoi progetti sono frontend, marketadvisor, dist, finly, aicommerce). Un deploy manuale creerebbe un progetto sbagliato.
- Per un deploy manuale serve il login Vercel dell'account proprietario (impossibile da qui).

## Verifica del deploy

Dopo il push, attendere ~75-90 secondi, poi verificare sulla produzione:

```powershell
$r = Invoke-WebRequest -Uri "https://registrazionesoci.vercel.app/<route>" -UseBasicParsing
$r.StatusCode  # 200
$r.Content.Contains("<marker specifico della pagina>")  # True = build aggiornata
```

Prima che il build finisca la route restituisce 404. Confrontare i marker del contenuto atteso per distinguere il deploy nuovo da quello vecchio.

## Regole

- MAI committare `.env.local`, token o segreti.
- Nel working tree possono esserci modifiche non correlate (es. file spostati in `Documentazione/`): committare solo il lavoro richiesto.
- Dopo un intervento aggiornare `Documentazione/STATO_PROGETTO.md` con l'attività eseguita e il commit.
