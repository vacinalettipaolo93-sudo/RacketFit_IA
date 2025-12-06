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

// --- TRAINING PLAN SCHEMA ---
const trainingPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weeklyGoal: { type: Type.STRING },
    advice: { type: Type.STRING },
    sessions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayName: { type: Type.STRING },
          focusArea: { type: Type.STRING },
          totalDuration: { type: Type.STRING },
          warmup: { type: Type.ARRAY, items: { type: Type.STRING } },
          mainBlock: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                durationOrReps: { type: Type.STRING },
                rest: { type: Type.STRING },
                notes: { type: Type.STRING }
              },
              required: ["name", "description", "durationOrReps", "rest"]
            }
          },
          cooldown: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["dayName", "focusArea", "totalDuration", "warmup", "mainBlock", "cooldown"]
      }
    }
  },
  required: ["weeklyGoal", "sessions", "advice"]
};

// --- LESSON PLAN SCHEMA ---
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
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Sei un preparatore atletico esperto specializzato nel ${prefs.sport} (e.g. FITP/PTR certified).
    Crea un programma di allenamento settimanale per un giocatore di livello ${prefs.level} di ${prefs.sport}.
    
    Dettagli Atleta:
    - Sport: ${prefs.sport}
    - Livello: ${prefs.level}
    - Fase della stagione: ${prefs.phase}
    - Obiettivo Settimanale: ${prefs.focus}
    - Numero di sessioni: ${prefs.sessionsPerWeek}
    
    Vincoli:
    - DURATA SESSIONE: Ogni sessione deve avere una durata stimata tra i 60 e i 90 minuti.
    - Gli allenamenti devono essere svolti su un campo da ${prefs.sport} o pista d'atletica.
    - Attrezzatura minima: Solo racchetta, palline, coni, corda. Niente pesi pesanti.
    - Il linguaggio deve essere tecnico ma comprensibile, in ITALIANO.
    - Includi esercizi specifici per il ${prefs.sport} (es. ${prefs.sport === 'Padel' ? 'vetri, bandeja' : 'spostamenti laterali, servizio'}).
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: trainingPlanSchema,
        systemInstruction: "Sei un coach d'élite. Rispondi con un JSON valido."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as WeeklyPlan;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const generateLessonPlan = async (prefs: LessonPreferences): Promise<LessonPlan> => {
  const apiKey = getApiKeyOrThrow();
  const genAI = new GoogleGenAI({ apiKey: apiKey });
  const model = "gemini-2.5-flash";

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
      Se 'Gruppo', assicurati che gli esercizi tengano tutti attivi (rotazioni veloci).
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