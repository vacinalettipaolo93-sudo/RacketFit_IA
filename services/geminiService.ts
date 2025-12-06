import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, WeeklyPlan } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const trainingPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    weeklyGoal: {
      type: Type.STRING,
      description: "Brief summary of the week's training objective."
    },
    advice: {
      type: Type.STRING,
      description: "General advice for the athlete for this specific week."
    },
    sessions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayName: { type: Type.STRING, description: "e.g., Sessione 1, Martedì, etc." },
          focusArea: { type: Type.STRING, description: "Main focus of this specific session" },
          totalDuration: { type: Type.STRING, description: "Estimated total time" },
          warmup: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of warmup exercises"
          },
          mainBlock: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING, description: "Detailed instruction on how to perform the drill" },
                durationOrReps: { type: Type.STRING, description: "Reps, distance, or time" },
                rest: { type: Type.STRING, description: "Rest time between sets or reps" },
                notes: { type: Type.STRING, description: "Optional specific cue" }
              },
              required: ["name", "description", "durationOrReps", "rest"]
            }
          },
          cooldown: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of cooldown stretches"
          }
        },
        required: ["dayName", "focusArea", "totalDuration", "warmup", "mainBlock", "cooldown"]
      }
    }
  },
  required: ["weeklyGoal", "sessions", "advice"]
};

export const generateTrainingPlan = async (prefs: UserPreferences): Promise<WeeklyPlan> => {
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
    - DURATA SESSIONE: Ogni sessione deve avere una durata stimata tra i 60 e i 90 minuti (inclusi riscaldamento e defaticamento).
    - Gli allenamenti devono essere svolti su un campo da ${prefs.sport} o pista d'atletica.
    - Attrezzatura minima: Solo racchetta (${prefs.sport === 'Padel' ? 'Pala' : 'Racchetta'}), palline, coni (o riferimenti), corda per saltare. Niente pesi pesanti o macchinari da palestra.
    - Il linguaggio deve essere tecnico ma comprensibile, in ITALIANO.
    - Adatta l'intensità e la complessità tecnica al livello indicato (${prefs.level}).
    - Includi esercizi specifici per il ${prefs.sport}. 
      ${prefs.sport === 'Padel' 
        ? 'Considera movimenti specifici del Padel: recuperi da vetro, smash, bandeja (movimento a vuoto o con palla), spostamenti brevi e rapidi avanti/indietro.' 
        : 'Considera movimenti specifici del Tennis: spider drill, navetta, passi incrociati, split step reaction, corsa laterale.'}
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: trainingPlanSchema,
        systemInstruction: "Sei un coach d'élite specializzato in sport di racchetta. Rispondi sempre con un JSON valido strutturato secondo lo schema fornito. Sii motivante e preciso nei dettagli tecnici."
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