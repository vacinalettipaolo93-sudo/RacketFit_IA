import type { LessonPlan, LessonPreferences } from '../types.ts';

const profiles = [
  ['split-step e uscita diagonale', 'porte bersaglio e corridoi', 'attivazione con chiamate direzionali', 'precisione con bonus per zona', 'lettura della profondità'],
  ['frenata laterale e recupero centrale', 'stazioni a triangolo', 'specchio tecnico senza palla e progressione con palla', 'conquista di territori', 'equilibrio dopo il colpo'],
  ['transizione avanti/indietro', 'due zone fondo-rete', 'sequenze progressive lancio-colpo-spostamento', 'missioni attacco-difesa a tempo', 'scelta del momento di avanzamento'],
  ['passi di aggiustamento e rotazione', 'bersagli asimmetrici', 'rally cooperativo con cambio di bersaglio', 'punti con jolly tattico', 'traiettoria e margine sopra la rete'],
  ['incrocio e disaccoppiamento busto-gambe', 'corridoio a zig-zag', 'attivazione coordinativa con segnali del maestro', 'sfida a obiettivi progressivi', 'anticipazione della direzione'],
  ['accelerazione breve e arresto controllato', 'isole di precisione', 'lancio e controllo su distanze crescenti', 'punteggio a rischio-rendimento', 'recupero della posizione dopo il colpo'],
];

export const buildLessonPrompt = (prefs: LessonPreferences, variation: number, recent: string[] = []): string => {
  const [motor, stations, warmup, game, secondary] = profiles[Math.abs(variation) % profiles.length];
  return `
Sei un maestro certificato di ${prefs.sport}. Scrivi SOLO JSON secondo lo schema, in italiano operativo.
Lezione di ${prefs.duration} minuti, ${prefs.mode}, livello ${prefs.level}, focus principale: ${prefs.focus}.
Profilo di variazione ${variation}:
- Pattern motorio: ${motor}; organizzazione: ${stations}.
- Warm-up da reinterpretare sul focus: ${warmup}.
- Gioco finale: ${game}; focus secondario: ${secondary}.
Non limitarti a rinominare esercizi: varia traiettorie, distanze, segnali, alimentazione del cesto,
ordine delle progressioni e regole. Non riproporre automaticamente minitennis e tie-break.
Evita nomi, setup, warm-up e giochi delle ultime lezioni:
${recent.length ? recent.join('\n') : 'Nessuna lezione precedente in questa sessione.'}

STRUTTURA E TEMPI:
- warmup: 2 attività diverse, ciascuna come spiegazione completa con durata.
- basketDrills: almeno 2 progressioni tecniche diverse (precisione, movimento, scelta).
- liveDrills: almeno 2 situazioni realmente giocabili.
- finalGame: spiega setup, regole, punteggio, vincolo tattico, rotazioni e durata.
- La somma dei tempi warm-up, esercizi (totalDurationEstimate, recupero e cambi inclusi) e gioco
  deve essere ESATTAMENTE ${prefs.duration} minuti; esplicita la ripartizione.
- timeBudget: warmupMinutes e finalGameMinutes sono numeri positivi; devono corrispondere
  ai tempi descritti nelle stringhe warmup e finalGame. totalDurationEstimate usa "~N min".

DETTAGLI OBBLIGATORI PER OGNI DRILL:
- objective: obiettivo osservabile collegato a ${prefs.focus} e criterio di riuscita.
- description: spiegazione tecnica/tattica concreta, non una frase generica.
- equipment: racchetta/pala, palline, cesto, numero di coni; alternative con linee del campo.
- setup: numero e posizione dei coni con distanze, bersagli, punto di partenza di ciascun
  allievo e posizione del maestro; scegli misure adatte al livello.
- execution: almeno 4 passaggi numerati (segnale iniziale, spostamento, colpo/decisione,
  ritorno e fine ripetizione). Per il cesto: traiettoria, frequenza e lato del lancio del maestro.
- coachRole: cosa osserva il maestro, feedback specifico e quando interrompere/correggere.
- rotation: ruoli, cambio turno, eventuale raccoglitore in zona protetta e tempo attivo di tutti.
- durationOrReps: serie e palline/ripetizioni per allievo o durata; rest: recupero esplicito.
- totalDurationEstimate: minuti totali incluso recupero e rotazioni.
- commonErrors: almeno 2 errori osservabili con relativa correzione.
- safety: distanze fra giocatori, attrezzi fuori dalle traiettorie, raccolta solo al segnale;
  niente corse su palline sparse e niente rotazioni attraverso il campo attivo.
- adaptations: variante più semplice/difficile e alternativa se mancano coni o cesto.
Anche le stringhe warmup e finalGame devono includere obiettivo, setup, partenza, passi,
maestro, rotazioni, tempi/recuperi, errori, sicurezza e adattamenti pertinenti.

ORGANIZZAZIONE REALE:
- Individuale: allievo e maestro, nessun compagno immaginario.
- Coppia: alterna cooperazione e opposizione, non presupporre sintonia da doppio se il focus è individuale.
- Tre: rotazioni rapide 2 contro 1 o maestro quarto giocatore; osservatore con compito preciso.
- Quattro: coppie, doppio reale e stazioni non interferenti; evita file con lunghi tempi morti.
Usa solo ruoli compatibili con ${prefs.mode}. Adatta intensità, palline, distanze e complessità
a ${prefs.level}. In padel usa vetri/pareti solo se pertinenti al focus; in tennis non usare vetri.
Materiali base: racchette/pale, palline, cesto e coni. Nessun attrezzo specialistico obbligatorio.
Il profilo è una guida, non imporre movimenti complessi a principianti.
`;
};

export const lessonSummary = (lesson: LessonPlan): string => JSON.stringify({
  title: lesson.title,
  warmup: lesson.warmup.map((item) => item.slice(0, 350)),
  drills: [...lesson.basketDrills, ...lesson.liveDrills].map((drill) => ({
    name: drill.name, setup: drill.setup?.slice(0, 200), execution: drill.execution?.slice(0, 200),
  })),
  finalGame: lesson.finalGame.slice(0, 350),
});
