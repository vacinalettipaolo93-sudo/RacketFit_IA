import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, WeeklyPlan, LessonPreferences, LessonPlan, EquipmentMode, Drill } from "../types";

// Helper functions for manual API Key management
const STORAGE_KEY = 'gemini_api_key';

export const getStoredApiKey = () => localStorage.getItem(STORAGE_KEY);
export const saveApiKey = (key: string) => localStorage.setItem(STORAGE_KEY, key);
export const removeApiKey = () => localStorage.removeItem(STORAGE_KEY);

// Check if an Env key exists (Vite or Process)
export const hasEnvApiKey = (): boolean => {
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env.VITE_API_KEY) return true;
  } catch (e) {}

  try {
    if (process.env.API_KEY) return true;
  } catch (e) {}

  return false;
};

// --- TRAINING PLAN SCHEMA (UPDATED: 50' netti, solo mainBlock, no warmup/cooldown) ---
const trainingPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weeklyGoal: { type: Type.STRING },
    advice: { type: Type.STRING },
    location: { type: Type.STRING, description: "Campo oppure Fuori" },
    equipmentMode: { type: Type.STRING, description: "Modalità attrezzatura selezionata dall'utente" },
    sessions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayName: { type: Type.STRING },
          focusArea: { type: Type.STRING },
          totalDuration: { type: Type.STRING, description: "Must be exactly '50 min' or '55 min' for the main block" },
          warmup: {
            type: Type.OBJECT,
            properties: {
              duration: { type: Type.STRING, description: "Must be exactly '10 min'" },
              type: { type: Type.STRING, description: "Tipo riscaldamento: 'Normale' oppure 'Gioco'" },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              isExtra: { type: Type.BOOLEAN, description: "Must be true, warm-up is extra rispetto al blocco principale" }
            }
          },
          location: { type: Type.STRING, description: "Campo oppure Fuori" },
          mainBlock: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                durationOrReps: {
                  type: Type.STRING,
                  description:
                    "Use ONLY the format 'N serie x N ripetizioni x Ns' OR 'N serie x N ripetizioni x Nm' (metri). Do NOT use minutes like '10 min'."
                },
                rest: { type: Type.STRING },
                notes: { type: Type.STRING },
                pairWork: { type: Type.BOOLEAN, description: "True if partner-based drill" },
                location: { type: Type.STRING, description: "Campo oppure Fuori" },
                equipment: {
                  type: Type.STRING,
                  description: "Attrezzo utilizzato (es: 'Palla medica 3kg', 'Elastico resistenza media', 'Step', 'Bastone', 'Cinesini'). Lascia vuoto se corpo libero."
                },
                setup: {
                  type: Type.STRING,
                  description: "Istruzioni pratiche di setup: posizione cinesini/coni (distanze), dove mettere step/elastico/palla medica/bastone, punto di partenza, organizzazione rotazione atleti."
                },
                totalDurationEstimate: {
                  type: Type.STRING,
                  description: "Durata totale stimata dell'esercizio incluso recupero tra le serie (es: '~5 min', '~7 min'). Calcola in secondi: (serie × rip × tempo_rep_sec) + (serie × recupero_sec), poi converti in minuti."
                }
              },
              required: ["name", "description", "durationOrReps", "rest"]
            }
          }
        },
        required: ["dayName", "focusArea", "totalDuration", "location", "mainBlock"]
      }
    }
  },
  required: ["weeklyGoal", "sessions", "advice", "location", "equipmentMode"]
};

// --- LESSON PLAN SCHEMA (UNCHANGED) ---
const lessonPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the lesson e.g. 'Miglioramento della Volée'" },
    sport: { type: Type.STRING },
    mode: { type: Type.STRING },
    level: { type: Type.STRING },
    duration: { type: Type.STRING },
    warmup: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Technical warmup exercises (minitennis, palleggio controllato)"
    },
    basketDrills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING, description: "Detailed feeding instruction (cesto)" },
          durationOrReps: { type: Type.STRING, description: "Balls per player or minutes" },
          rest: { type: Type.STRING },
          notes: { type: Type.STRING, description: "Technical correction focus" }
        },
        required: ["name", "description", "durationOrReps", "rest"]
      },
      description: "Exercises using the basket (cesto) for technical mechanics"
    },
    liveDrills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING, description: "Live ball or situational drill" },
          durationOrReps: { type: Type.STRING },
          rest: { type: Type.STRING },
          notes: { type: Type.STRING }
        },
        required: ["name", "description", "durationOrReps", "rest"]
      },
      description: "Cooperative or competitive drills with live ball"
    },
    finalGame: { type: Type.STRING, description: "Description of the final game or points structure" }
  },
  required: ["title", "warmup", "basketDrills", "liveDrills", "finalGame"]
};

const getEquipmentRules = (prefs: UserPreferences): string => {
  if (prefs.equipmentMode === EquipmentMode.WITH_EQUIPMENT) {
    return `
VINCOLI ATTREZZATURA (OBBLIGATORI):
- MODALITÀ: Con attrezzi da preparazione atletica.
- ATTREZZI CONSENTITI E OBBLIGATORI: elastici (di resistenza), palle mediche, bastoni, step.
- REGOLA FONDAMENTALE: almeno il 70% degli esercizi DEVE utilizzare fisicamente uno o più tra: elastico, palla medica, bastone, step.
- Per ogni esercizio che usa un attrezzo, inserisci il nome dell'attrezzo nel campo "equipment" (es: "Elastico resistenza media", "Palla medica 3kg", "Step", "Bastone").
- Cinesini/coni sono SEMPRE consentiti come riferimento spaziale.
- NON CONSENTITO: palle da tennis/padel, racchette, pale, macchine, bilancieri pesanti, manubri, corde per salto.
- Ogni esercizio DEVE avere un campo "setup" con istruzioni pratiche: dove posizionare i cinesini, dove mettere l'attrezzo, punto di partenza, distanze.
`;
  }

  if (prefs.equipmentMode === EquipmentMode.RACKET_SPECIFIC) {
    return `
VINCOLI ATTREZZATURA (OBBLIGATORI):
- MODALITÀ: Solo strumenti specifici sport di racchetta.
- CONSENTITO: palle/palline da tennis-padel-pickleball, racchette/pale, attrezzatura specifica di tennis/padel/pickleball, ostacoli.
- NON CONSENTITO: elastici, palle mediche, manubri, bilancieri, kettlebell, macchine, corde, scalette o altri strumenti non nella lista consentita.
- Ogni drill deve essere realizzabile SOLO con gli strumenti consentiti.
- Ogni esercizio DEVE avere un campo "setup" con istruzioni pratiche: dove posizionare cinesini/ostacoli, punto di partenza, distanze.
`;
  }

  return `
VINCOLI ATTREZZATURA (OBBLIGATORI):
- MODALITÀ: Corpo libero / attrezzatura minima.
- CONSENTITO: solo corpo libero + cinesini/coni (eventuali linee del campo come riferimento).
- NON CONSENTITO: elastici, palle mediche, palle, racchette/pale, ostacoli, scalette, corde e qualsiasi altra attrezzatura aggiuntiva.
- Ogni drill deve essere realizzabile SOLO con gli strumenti consentiti.
- Ogni esercizio DEVE avere un campo "setup" con istruzioni pratiche: dove posizionare i cinesini, punto di partenza, distanze.
`;
};

const normalizeMainDuration = (value?: string): '50 min' | '55 min' => {
  if (value && value !== '50 min' && value !== '55 min') {
    console.warn(`Unexpected totalDuration "${value}", fallback a "50 min".`);
  }
  return value === '55 min' ? '55 min' : '50 min';
};

const buildWarmupBlock = (prefs: UserPreferences) => {
  if (!prefs.includeWarmup) return undefined;

  const isGame = prefs.warmupType === 'Gioco';
  return {
    duration: '10 min' as const,
    type: prefs.warmupType,
    title: isGame ? 'Riscaldamento ludico' : 'Riscaldamento classico',
    description: isGame
      ? 'Attivazione con gioco rapido, reazione e coordinazione a intensità progressiva.'
      : 'Attivazione progressiva con mobilità dinamica, corsa tecnica e preparazione muscolare.',
    isExtra: true as const
  };
};

const addUniqueNote = (notes: string | undefined, addition: string): string => {
  if (!notes) return addition;
  if (notes.toLowerCase().includes(addition.toLowerCase())) return notes;
  return `${notes} ${addition}`;
};

const appendIfMissing = (value: string | undefined, addition: string, probe: string): string => {
  if (!value) return addition;
  if (value.toLowerCase().includes(probe.toLowerCase())) return value;
  return `${value} ${addition}`;
};

const includesAnyKeyword = (value: string | undefined, keywords: string[]): boolean => {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return keywords.some((k) => normalized.includes(k));
};

const isCognitiveDrill = (drill: Drill): boolean => {
  const cognitiveKeywords = ['cognitiv', 'decision', 'reatt', 'stimolo', 'visiv', 'colore', 'segnale', 'chiamata'];
  return [drill.name, drill.description, drill.notes, drill.setup].some((field) => includesAnyKeyword(field, cognitiveKeywords));
};

const isBlazepodDrill = (drill: Drill): boolean => {
  const blazepodKeywords = ['blazepod', 'blaze pod', 'luci', 'pod'];
  return [drill.name, drill.description, drill.notes, drill.setup, drill.equipment].some((field) => includesAnyKeyword(field, blazepodKeywords));
};

const ensureCognitiveAndBlazepodCoverage = (data: WeeklyPlan, prefs: UserPreferences) => {
  const sessions = data.sessions || [];
  if (!sessions.length) return;

  const allDrills: Drill[] = sessions.flatMap((s) => s.mainBlock || []);
  if (!allDrills.length) return;

  const firstDrill = allDrills[0];

  if (prefs.includeCognitive && !allDrills.some(isCognitiveDrill)) {
    firstDrill.description = appendIfMissing(
      firstDrill.description,
      'Inserisci chiamate casuali di colori/segnali per decision making e reazione visiva.',
      'decision making'
    );
    firstDrill.notes = addUniqueNote(firstDrill.notes, 'Componente cognitiva obbligatoria: risposta a stimoli visivi/verbali.');
  }

  if (prefs.useBlazepod && !allDrills.some(isBlazepodDrill)) {
    firstDrill.equipment = firstDrill.equipment
      ? `${firstDrill.equipment}, BlazePod`
      : 'BlazePod';
    firstDrill.description = appendIfMissing(
      firstDrill.description,
      'Usa BlazePod per trigger luminosi e cambi direzione reattivi.',
      'blazepod'
    );
    firstDrill.notes = addUniqueNote(firstDrill.notes, 'Uso BlazePod obbligatorio: reagire a luci e segnali colore.');
  }
};

const getApiKeyOrThrow = () => {
  let apiKey = getStoredApiKey();
  if (!apiKey) {
    try {
      // @ts-ignore
      apiKey = import.meta.env.VITE_API_KEY;
    } catch (e) {}
  }
  if (!apiKey) {
    try {
      apiKey = process.env.API_KEY;
    } catch (e) {}
  }
  if (!apiKey) throw new Error("API_KEY_MISSING");
  return apiKey;
};

export const generateTrainingPlan = async (prefs: UserPreferences): Promise<WeeklyPlan> => {
  const apiKey = getApiKeyOrThrow();
  const genAI = new GoogleGenAI({ apiKey: apiKey });
  const model = "gemini-3-flash-preview";
  const equipmentRules = getEquipmentRules(prefs);

  const prompt = `
Sei un preparatore atletico esperto specializzato nel ${prefs.sport}.

OBIETTIVO:
Crea un programma settimanale di ATLETICA PROPEDEUTICA SPECIFICA per ${prefs.sport}.
Deve essere orientato al tennis/padel (footwork, rapidità, cambi direzione, capacità di frenata, accelerazioni, reattività, coordinazione, prevenzione).

SCELTE UTENTE:
- Sport: ${prefs.sport}
- Livello: ${prefs.level}
- Fase stagione: ${prefs.phase}
- Focus settimanale: ${prefs.focus}
- Sessioni: ${prefs.sessionsPerWeek}
- Numero partecipanti: ${prefs.groupSize}
- LOCATION: ${prefs.location} (Campo oppure Fuori)
- Modalità attrezzatura: ${prefs.equipmentMode}
- Riscaldamento extra: ${prefs.includeWarmup ? 'SÌ (10 min extra)' : 'NO'}
- Tipo riscaldamento: ${prefs.warmupType}
- Parte cognitiva: ${prefs.includeCognitive ? 'SÌ' : 'NO'}
- Uso BlazePod: ${prefs.useBlazepod ? 'SÌ' : 'NO'}

VINCOLI OBBLIGATORI PER OGNI SESSIONE:
- DURATA BLOCCO PRINCIPALE: 50 oppure 55 minuti NETTI (scrivi "50 min" o "55 min" in totalDuration).
- Se Riscaldamento extra = SÌ: aggiungi oggetto "warmup" con duration "10 min", type "${prefs.warmupType}", isExtra=true.
- Se Riscaldamento extra = NO: non aggiungere warmup.
- NON inserire defaticamento.
- NON inserire partite finali / set / tie-break.
- NON inserire esercizi "al cesto" (nessun feeding continuo del coach).
- Gli esercizi devono essere eseguibili quasi sempre tra di loro (partner drill): imposta pairWork=true nella maggior parte dei drill.
- Lingua: ITALIANO, tecnico ma semplice.
${equipmentRules}

VINCOLI COGNITIVI E BLAZEPOD (OBBLIGATORI):
- Se Parte cognitiva = SÌ: almeno un drill deve includere esplicitamente componenti cognitive/reattive (decision making, stimoli visivi, chiamate, colori, segnali, reazione).
- Se Uso BlazePod = SÌ: almeno un drill deve usare esplicitamente BlazePod nelle istruzioni operative o nel campo equipment.
- Se entrambe sono SÌ, anche lo stesso drill può coprire entrambi i vincoli.

VINCOLO FORMATO DURATA ESERCIZI (IMPORTANTISSIMO):
- In "durationOrReps" NON devi mai scrivere minuti tipo: "10 min", "8 minuti", "5'".
- "durationOrReps" deve essere SEMPRE nel formato:
  * "N serie x N ripetizioni x Ns" (secondi)  OPPURE
  * "N serie x N ripetizioni x Nm" (metri)
  Esempi corretti:
  - "3 serie x 6 ripetizioni x 45s"
  - "4 serie x 8 ripetizioni x 20m"
  - "3 serie x 5 ripetizioni x 10m"
- Se serve un lavoro “continuo”, spezzalo in ripetizioni (es. 6 ripetizioni x 30s) e non in minuti.

CAMPO "totalDurationEstimate" (OBBLIGATORIO per ogni esercizio):
- Calcola e riporta la durata totale stimata dell'esercizio incluso il recupero tra le serie.
- Formula: (N_serie × N_rip × tempo_per_rep_in_sec) + (N_serie × recupero_in_sec) = totale in secondi → converti in minuti.
- Esempio: 3 serie x 6 rep x 15s + recupero 45s = (3×6×15) + (3×45) = 270+135 = 405s ≈ "~7 min"
- Arrotonda al minuto più vicino, usa il formato "~N min".

CAMPO "setup" (OBBLIGATORIO per ogni esercizio):
- Descrivi come preparare praticamente l'esercizio sul campo.
- Includi SEMPRE:
  * Numero e disposizione dei cinesini/coni (es: "4 cinesini in linea a 1.5m di distanza l'uno dall'altro")
  * Punto di partenza dell'atleta (es: "Atleta in piedi dietro il primo cinesino")
  * Posizione dell'attrezzo se presente (es: "Step posizionato al termine della linea", "Elastico ancorato al palo di rete all'altezza dei fianchi")
  * Organizzazione della rotazione se il gruppo è numeroso (es: "File di 2-3 atleti, si riparte appena il primo ha finito")
- Usa frasi brevi e pratiche, leggibili da un coach sul campo.

REGOLE ORGANIZZAZIONE IN BASE AL GRUPPO:
- 1 Persona: lavori individuali con vincoli chiari (tempi, distanze, target).
- 2 Persone: lavori a coppie (specchio, inseguimento controllato, chiamate, staffette a coppie).
- 3-4 Persone: rotazioni rapide, mini-stazioni, file corte.
- 5+: lavoro a stazioni in circuito.

CIRCUITO A STAZIONI (se groupSize è "3 Persone", "4 Persone" o "Gruppo (5+)"):
- Progetta gli esercizi come stazioni di un circuito a rotazione.
- FONDAMENTALE: ogni stazione deve avere una durata di lavoro effettivo SIMILE (obiettivo: 45-60 secondi per passaggio, tolleranza ±10 secondi).
- Normalizza il volume (serie, rip, tempi) di ogni esercizio in modo che totalDurationEstimate risulti omogeneo tra tutte le stazioni.
- In "notes" di ogni esercizio/stazione aggiungi: "Stazione circuito: ~Xs lavoro per passaggio" (es: "Stazione circuito: ~50s lavoro per passaggio").

LOCATION:
- Se LOCATION = "Campo": usa linee del campo, corridoi, diagonali, rete come riferimento.
- Se LOCATION = "Fuori": usa spazio piano (palestra, pista, parcheggio) e riferimenti con coni.

OUTPUT:
Rispondi SOLO con JSON valido secondo lo schema.
`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: trainingPlanSchema,
        systemInstruction:
          "Sei un coach d'élite. Rispondi con JSON valido. Rispetta i vincoli di durata del blocco principale (50 o 55 min), warm-up opzionale extra da 10 min, niente cooldown/final game/cesto. durationOrReps DEVE essere nel formato 'N serie x N ripetizioni x Ns' oppure 'N serie x N ripetizioni x Nm'. Ogni esercizio DEVE avere setup e totalDurationEstimate (~N min). Se richiesti parte cognitiva o BlazePod, almeno un drill deve rispettare esplicitamente tali vincoli. Se la modalità è 'Con attrezzi', almeno il 70% dei drill deve usare elastici, palle mediche, bastoni o step."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as WeeklyPlan;

    // Client-side hard guards for consistency
    data.location = prefs.location;
    data.equipmentMode = prefs.equipmentMode;
    const warmup = buildWarmupBlock(prefs);
    data.sessions = (data.sessions || []).map((s) => ({
      ...s,
      totalDuration: normalizeMainDuration(s.totalDuration),
      warmup,
      location: prefs.location,
      mainBlock: (s.mainBlock || []).map((d) => ({
        ...d,
        location: prefs.location
      }))
    }));
    ensureCognitiveAndBlazepodCoverage(data, prefs);

    return data;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const generateLessonPlan = async (prefs: LessonPreferences): Promise<LessonPlan> => {
  const apiKey = getApiKeyOrThrow();
  const genAI = new GoogleGenAI({ apiKey: apiKey });
  const model = "gemini-3-flash-preview";

  const prompt = `
    Sei un Maestro di ${prefs.sport} (Coach) certificato.
    Crea un piano di lezione (${prefs.duration} minuti) per una lezione ${prefs.mode}.
    Livello allievi: ${prefs.level}.
    Focus Tecnico/Tattico: ${prefs.focus}.

    Struttura richiesta:
    1. Riscaldamento Tecnico (palleggio in minitennis o controllato).
    2. Esercizi al Cesto (Basket Drills): Fondamentali per correggere la tecnica o creare ritmo. Descrivi come il maestro deve lanciare la palla e cosa deve fare l'allievo.
    3. Esercizi Live / Situazionali: Scambio tra allievi o con il maestro in gioco.
    4. Gioco Finale: Punti o tie-break con regole o vincoli specifici.

    Considerazioni Importanti:
    - Sport: ${prefs.sport}. Se Padel, includi pareti e vetri dove serve.
    - Modalità: ${prefs.mode}. 
      Se 'Gruppo (3 giocatori)': Sfrutta schemi 2 contro 1 (es. "Americano"), o rotazioni rapide dove il maestro gioca in coppia.
      Se 'Gruppo (4 giocatori)': Crea situazioni di DOPPIO REALE. Lavora su tattiche di coppia, sincronia a rete/fondo.
      Se 'Coppia', lavora sulla sintonia.
    - Attrezzatura: Cesto, Racchetta/Pala, Coni.
    - Lingua: ITALIANO.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: lessonPlanSchema,
        systemInstruction: "Sei un maestro di tennis/padel esperto. Crea lezioni dinamiche e ben strutturate."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as LessonPlan;
    // Inject user selections back into the object for consistency
    data.sport = prefs.sport;
    data.mode = prefs.mode;
    data.level = prefs.level;
    data.duration = prefs.duration;

    return data;
  } catch (error) {
    console.error("Error generating lesson:", error);
    throw error;
  }
};
