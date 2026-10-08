<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nDTN20x6vSIAmg-lEL0UZOXPaDkB7YW7

## Run Locally

**Prerequisites:** Node.js 22.7+ (per i test TypeScript nativi; consigliato Node 22 LTS aggiornato).


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Generazione Gemini

La chiave può essere configurata nelle impostazioni dell’app oppure tramite
`GEMINI_API_KEY` in `.env.local`. Sono supportati anche `VITE_GEMINI_API_KEY`
e il precedente `VITE_API_KEY`. Una chiave salvata nelle impostazioni ha precedenza.
Non inserire chiavi nel repository.

Entrambi i flussi usano per default `gemini-2.5-flash`, con fallback a
`gemini-2.5-flash-lite` **solo** se il modello non è disponibile/supportato.
Per usare modelli abilitati sul proprio progetto, configurare `GEMINI_MODEL` e
`GEMINI_FALLBACK_MODEL` (oppure `VITE_GEMINI_MODEL` e
`VITE_GEMINI_FALLBACK_MODEL`) e riavviare Vite/ricostruire il deploy.
L’accesso dipende dal progetto, dalla quota e dal ciclo di vita dei modelli:
[catalogo Gemini](https://ai.google.dev/gemini-api/docs/models).
Gli errori di chiave, quota, API/schema, risposta vuota, JSON non valido o dati
incompleti mostrano un messaggio distinto con l’azione da eseguire.

Le lezioni includono setup, esecuzione, maestro, rotazioni, recupero, errori,
sicurezza e adattamenti. Sei profili variabili e le ultime tre lezioni con le
stesse preferenze aiutano a evitare ripetizioni; la cronologia resta solo in
memoria e si azzera ricaricando la pagina. La varietà del contenuto finale dipende
comunque dal modello. I vecchi piani salvati restano visualizzabili.
La preparazione mantiene il blocco principale da 50/55 minuti e il warm-up
opzionale da 10 minuti extra, con copertura cognitiva/BlazePod/Buzzoni selezionata.

**Sicurezza:** questa è un’app client-side: una chiave configurata via ambiente
viene inclusa nel bundle, e quella inserita nell’app è salvata in localStorage.
Non usare chiavi di produzione riservate in un deploy pubblico; per quel caso
serve un backend autenticato che custodisca le credenziali. Le risposte e gli
errori grezzi Gemini non vengono registrati in console.

## Verifiche

- `npm test`: test mirati con il runner integrato Node, senza nuove dipendenze.
  Include JSON/code fence, risposte vuote/incomplete, errori API/modello e fallback,
  entrambi i flussi tramite SDK con rete simulata, dettagli e variazione dei prompt.
- `npm run typecheck`: verifica TypeScript.
- `npm run build`: build di produzione.

I test non usano una chiave reale e non verificano disponibilità/quota del proprio
progetto né la qualità di una risposta live. Prima del merge/deploy, provare
entrambi i flussi con una chiave autorizzata e controllare sul campo carichi,
tempi e indicazioni di sicurezza.
