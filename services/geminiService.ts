import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, WeeklyPlan, LessonPreferences, LessonPlan } from "../types";

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
    sessions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayName: { type: Type.STRING },
          focusArea: { type: Type.STRING },
          totalDuration: { type: Type.STRING, description: "Must be exactly '50 min'" },
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
                location: { type: Type.STRING, description: "Campo oppure Fuori" }
              },
              required: ["name", "description", "durationOrReps", "rest"]
            }
          }
        },
        required: ["dayName", "focusArea", "totalDuration", "location", "mainBlock"]
      }
    }
  },
  required: ["weeklyGoal", "sessions", "advice", "location"]
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

VINCOLI OBBLIGATORI PER OGNI SESSIONE:
- DURATA: ESATTAMENTE 50 minuti di lavoro NETTI (scrivi "50 min" in totalDuration).
- NON inserire riscaldamento.
- NON inserire defaticamento.
- NON inserire partite finali / set / tie-break.
- NON inserire esercizi "al cesto" (nessun feeding continuo del coach).
- Gli esercizi devono essere eseguibili quasi sempre tra di loro (partner drill): imposta pairWork=true nella maggior parte dei drill.
- Usa solo attrezzi semplici: coni, cinesini, corda, elastici leggeri, palline (solo per coordinazione, NON per cesto), scaletta se vuoi.
- Lingua: ITALIANO, tecnico ma semplice.

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

REGOLE ORGANIZZAZIONE IN BASE AL GRUPPO:
- 1 Persona: lavori individuali con vincoli chiari (tempi, distanze, target).
- 2 Persone: lavori a coppie (specchio, inseguimento controllato, chiamate, staffette a coppie).
- 3-4 Persone: rotazioni rapide, mini-stazioni, file corte.
- 5+: lavoro a stazioni.

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
          "Sei un coach d'élite. Rispondi con un JSON valido. Rispetta TUTTI i vincoli (50 min, no warmup, no cooldown, no final game, no cesto). durationOrReps DEVE essere sempre nel formato 'N serie x N ripetizioni x Ns' oppure 'N serie x N ripetizioni x Nm'."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text) as WeeklyPlan;

    // Client-side hard guards for consistency
    data.location = prefs.location;
    data.sessions = (data.sessions || []).map((s) => ({
      ...s,
      totalDuration: '50 min',
      location: prefs.location,
      mainBlock: (s.mainBlock || []).map((d) => ({
        ...d,
        location: prefs.location
      }))
    }));

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
