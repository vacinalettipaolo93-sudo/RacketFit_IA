import type { GenerateContentParameters, GenerateContentResponse } from '@google/genai';
import type { Drill, LessonPlan, LessonPreferences, UserPreferences, WeeklyPlan, WarmupBlock } from '../types.ts';

export type GenerationErrorCode = 'API_KEY_MISSING' | 'API_ERROR' | 'MODEL_UNAVAILABLE' | 'EMPTY_RESPONSE' | 'INVALID_JSON' | 'INCOMPLETE_RESPONSE';

export class GenerationError extends Error {
  constructor(public readonly code: GenerationErrorCode, message: string) {
    super(message);
    this.name = 'GenerationError';
  }
}

export const DEFAULT_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

export const generationErrorMessage = (error: unknown): string =>
  error instanceof GenerationError ? error.message :
    'Impossibile generare il programma. Controlla la connessione e riprova dal modulo.';

const incomplete = (path: string): never => {
  throw new GenerationError('INCOMPLETE_RESPONSE', `Risposta AI incompleta: ${path}. Riprova la generazione dal modulo.`);
};

const object = (value: unknown, path: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return incomplete(path);
  return value as Record<string, unknown>;
};

const text = (value: unknown, path: string): string =>
  typeof value === 'string' && value.trim() ? value.trim() : incomplete(path);

const optionalText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const list = (value: unknown, path: string): unknown[] =>
  Array.isArray(value) && value.length > 0 ? value : incomplete(path);

export const parseAIJson = (response: unknown): unknown => {
  if (typeof response !== 'string' || !response.trim()) {
    throw new GenerationError('EMPTY_RESPONSE', 'L’AI ha restituito una risposta vuota o bloccata. Riprova dal modulo con un focus più specifico.');
  }
  const cleaned = response.trim().replace(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i, '$1').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new GenerationError('INVALID_JSON', 'La risposta AI non è JSON valido o è stata interrotta. Riprova la generazione dal modulo.');
  }
};

export const normalizeDrill = (value: unknown, path: string, operational = false): Drill => {
  const data = object(value, path);
  const drill: Drill = {
    name: text(data.name, `${path}.name`),
    description: text(data.description, `${path}.description`),
    durationOrReps: text(data.durationOrReps, `${path}.durationOrReps`),
    rest: text(data.rest, `${path}.rest`),
  };
  const fields = ['notes', 'equipment', 'setup', 'execution', 'rotation', 'totalDurationEstimate',
    'objective', 'coachRole', 'commonErrors', 'safety', 'adaptations'] as const;
  for (const field of fields) {
    const required = operational && ['setup', 'execution', 'rotation', 'objective', 'coachRole', 'commonErrors', 'safety', 'adaptations', 'totalDurationEstimate'].includes(field);
    const normalized = required ? text(data[field], `${path}.${field}`) : optionalText(data[field]);
    if (normalized !== undefined) drill[field] = normalized;
  }
  if (typeof data.pairWork === 'boolean') drill.pairWork = data.pairWork;
  return drill;
};

const normalizeWarmup = (value: unknown, prefs: UserPreferences): WarmupBlock | undefined => {
  if (!prefs.includeWarmup || !value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const data = object(value, 'warmup');
  const fields = ['title', 'description', 'setup', 'execution', 'rotation', 'timePlan'] as const;
  if (fields.some((field) => !optionalText(data[field]))) return undefined;
  return {
    duration: '10 min', type: prefs.warmupType, isExtra: true,
    title: text(data.title, 'warmup.title'), description: text(data.description, 'warmup.description'),
    setup: text(data.setup, 'warmup.setup'), execution: text(data.execution, 'warmup.execution'),
    rotation: text(data.rotation, 'warmup.rotation'), timePlan: text(data.timePlan, 'warmup.timePlan'),
    ...(optionalText(data.equipment) ? { equipment: optionalText(data.equipment) } : {}),
  };
};

export const normalizeTrainingPlan = (value: unknown, prefs: UserPreferences): WeeklyPlan => {
  const data = object(value, 'programma');
  const sessions = list(data.sessions, 'sessions');
  if (sessions.length !== Number(prefs.sessionsPerWeek)) return incomplete('numero di sessioni richieste');
  return {
    weeklyGoal: text(data.weeklyGoal, 'weeklyGoal'),
    advice: text(data.advice, 'advice'),
    location: prefs.location, equipmentMode: prefs.equipmentMode,
    sessions: sessions.map((value, index) => {
      const path = `sessions[${index}]`;
      const session = object(value, path);
      const duration = text(session.totalDuration, `${path}.totalDuration`);
      if (duration !== '50 min' && duration !== '55 min') return incomplete(`${path}.totalDuration (50/55 min)`);
      const warmup = normalizeWarmup(session.warmup, prefs);
      return {
        dayName: text(session.dayName, `${path}.dayName`),
        focusArea: text(session.focusArea, `${path}.focusArea`),
        totalDuration: duration, location: prefs.location,
        ...(warmup ? { warmup } : {}),
        mainBlock: list(session.mainBlock, `${path}.mainBlock`).map((drill, i) => ({
          ...normalizeDrill(drill, `${path}.mainBlock[${i}]`), location: prefs.location,
        })),
      };
    }),
  };
};

export const normalizeLessonPlan = (value: unknown, prefs: LessonPreferences): LessonPlan => {
  const data = object(value, 'lezione');
  return {
    title: text(data.title, 'title'),
    sport: prefs.sport, mode: prefs.mode, level: prefs.level, duration: prefs.duration,
    warmup: list(data.warmup, 'warmup').map((value, i) => text(value, `warmup[${i}]`)),
    basketDrills: list(data.basketDrills, 'basketDrills').map((value, i) => normalizeDrill(value, `basketDrills[${i}]`, true)),
    liveDrills: list(data.liveDrills, 'liveDrills').map((value, i) => normalizeDrill(value, `liveDrills[${i}]`, true)),
    finalGame: text(data.finalGame, 'finalGame'),
  };
};

type Generate = (params: GenerateContentParameters) => Promise<GenerateContentResponse>;

export const requestAIJson = async (generate: Generate, params: Omit<GenerateContentParameters, 'model'>, models: string[]): Promise<unknown> => {
  const candidates = [...new Set(models.map((model) => model.trim()).filter(Boolean))];
  for (const [index, model] of candidates.entries()) {
    let response: GenerateContentResponse;
    try {
      response = await generate({ ...params, model });
    } catch (error: unknown) {
      const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : 0;
      const message = error instanceof Error ? error.message : '';
      const unavailable = status === 404 || (status === 400 && /model.*(not found|not supported|unavailable)|not supported.*model/i.test(message));
      if (unavailable && index < candidates.length - 1) continue;
      if (unavailable) throw new GenerationError('MODEL_UNAVAILABLE', 'Modello Gemini non disponibile per questa chiave. Configura GEMINI_MODEL/VITE_GEMINI_MODEL con un modello supportato e ricostruisci l’app.');
      const suggestion = status === 401 || status === 403 || /API.?key.*(invalid|expired|not valid)/i.test(message)
        ? 'Chiave API non valida o non autorizzata. Verificala nelle impostazioni e controlla i permessi in Google AI Studio.'
        : status === 429 ? 'Quota Gemini esaurita o troppe richieste. Attendi e controlla quota/fatturazione in Google AI Studio.'
        : status === 400 ? 'Richiesta Gemini o schema non compatibile. Verifica il modello configurato e riprova.'
        : 'Servizio Gemini non raggiungibile o temporaneamente indisponibile. Controlla la connessione e riprova.';
      throw new GenerationError('API_ERROR', suggestion);
    }
    return parseAIJson(response.text);
  }
  throw new GenerationError('MODEL_UNAVAILABLE', 'Nessun modello Gemini configurato. Imposta GEMINI_MODEL e ricostruisci l’app.');
};
