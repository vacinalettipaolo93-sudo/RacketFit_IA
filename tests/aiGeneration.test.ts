import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GenerateContentResponse } from '@google/genai';
import {
  GenerationError, parseAIJson, normalizeTrainingPlan, normalizeLessonPlan,
  normalizeDrill, requestAIJson, generationErrorMessage, DEFAULT_MODELS,
} from '../services/aiResponse.ts';
import { generateTrainingPlan, generateLessonPlan, hasEnvApiKey } from '../services/geminiService.ts';
import { buildLessonPrompt } from '../services/lessonPrompt.ts';
import { Sport, FitnessLevel, LessonMode, GroupSize, SessionCount, TrainingFocus, EquipmentMode } from '../types.ts';
import type { UserPreferences, LessonPreferences } from '../types.ts';

const fitnessPrefs: UserPreferences = {
  sport: Sport.TENNIS, level: FitnessLevel.BEGINNER, groupSize: GroupSize.TWO,
  sessionsPerWeek: SessionCount.ONE, focus: TrainingFocus.SPEED_AGILITY,
  equipmentMode: EquipmentMode.BODYWEIGHT_MINIMAL, phase: 'In-season', location: 'Campo',
  includeWarmup: true, warmupType: 'Gioco', includeCognitive: true, useBlazepod: true, useBuzzoni: true,
};
const lessonPrefs: LessonPreferences = {
  sport: Sport.PADEL, level: FitnessLevel.INTERMEDIATE, mode: LessonMode.GROUP_3,
  focus: 'Volée', duration: '60',
};
const drill = () => ({
  name: 'Porte diagonali', description: 'Spostati sul bersaglio chiamato e recupera il centro.',
  durationOrReps: '3 serie x 6 ripetizioni x 15s', rest: '45s fra serie',
  objective: 'Raggiungere 6 bersagli con equilibrio.',
  equipment: '4 coni e palline',
  setup: '4 coni a 2 m, partenza dietro il cono centrale; maestro a lato del cesto.',
  execution: '1. Parti al segnale.\n2. Muoviti in diagonale.\n3. Colpisci verso la porta.\n4. Recupera il centro.',
  rotation: 'A e B alternano 6 palline, C osserva; cambio ogni serie.',
  totalDurationEstimate: '~10 min',
  coachRole: 'Lancia ogni 4 secondi e correggi equilibrio e posizione della pala.',
  commonErrors: 'Arrivo tardivo: anticipa lo split-step. Pala bassa: preparala davanti.',
  safety: 'Raccogli solo al segnale con tutti fermi; mantieni 2 m fra giocatori.',
  adaptations: 'Riduci distanza per principianti, aumenta target per esperti; usa linee senza coni.',
});
const training = () => ({
  weeklyGoal: 'Velocità controllata', advice: 'Interrompi in caso di dolore.',
  sessions: [{
    dayName: 'Lunedì', focusArea: 'Agilità', totalDuration: '50 min',
    mainBlock: Array.from({ length: 5 }, (_, i) => ({ ...drill(), name: `Stazione ${i + 1}` })),
  }],
});
const lesson = () => ({
  title: 'Volée e recupero', warmup: ['Attivazione specchio: 5 min.', 'Bersagli progressivi: 5 min.'],
  basketDrills: [drill(), { ...drill(), name: 'Bersagli corti' }],
  liveDrills: [{ ...drill(), name: 'Difesa e rete' }, { ...drill(), name: 'Cambio lato' }],
  finalGame: 'Conquista territori: 10 min. Bonus per volée nella porta; raccolta al segnale.',
  timeBudget: { warmupMinutes: 10, finalGameMinutes: 10 },
});
const errorCode = (code: string) => (error: unknown) => error instanceof GenerationError && error.code === code;
const response = (text: string) => Object.assign(new GenerateContentResponse(), {
  candidates: [{ content: { role: 'model', parts: [{ text }] } }],
});

test('parsing JSON valido, whitespace e code fence', () => {
  for (const value of ['{"a":1}', ' \n{"a":1}\n ', '```json\n{"a":1}\n```', '```\n{"a":1}\n```']) {
    assert.deepEqual(parseAIJson(value), { a: 1 });
  }
});
test('risposta vuota distinta da JSON non valido', () => {
  for (const value of [undefined, '', ' \n ']) assert.throws(() => parseAIJson(value), errorCode('EMPTY_RESPONSE'));
  for (const value of ['Non posso generare', '{"sessions":', '```json\nbad\n```']) {
    assert.throws(() => parseAIJson(value), errorCode('INVALID_JSON'));
  }
});
test('rifiuta struttura incompleta, tipi sbagliati e sezioni vuote', () => {
  for (const value of [null, [], {}, { ...lesson(), warmup: [] }, { ...lesson(), basketDrills: [] },
    { ...lesson(), liveDrills: 'errato' }, { ...lesson(), finalGame: '' },
    { ...lesson(), basketDrills: [{ ...drill(), execution: undefined }] }]) {
    assert.throws(() => normalizeLessonPlan(value, lessonPrefs), errorCode('INCOMPLETE_RESPONSE'));
  }
  for (const value of [{}, { ...training(), sessions: [] },
    { ...training(), sessions: [{ ...training().sessions[0], mainBlock: [] }] },
    { ...training(), sessions: [{ ...training().sessions[0], totalDuration: '60 min' }] },
    { ...training(), sessions: [{ ...training().sessions[0], mainBlock: [{ ...drill(), rest: null }] }] }]) {
    assert.throws(() => normalizeTrainingPlan(value, fitnessPrefs), errorCode('INCOMPLETE_RESPONSE'));
  }
});
test('normalizzazione applica preferenze e scarta campi opzionali non validi', () => {
  const normalized = normalizeLessonPlan({ ...lesson(), sport: 'errato', duration: 99 }, lessonPrefs);
  assert.equal(normalized.sport, Sport.PADEL);
  assert.equal(normalized.duration, '60');
  assert.equal(normalized.basketDrills[0].execution, drill().execution);
  assert.equal(normalizeDrill({ ...drill(), notes: {}, pairWork: 'yes', equipment: null }, 'drill').notes, undefined);
  assert.equal(normalizeDrill({ ...drill(), equipment: null }, 'drill').equipment, undefined);
  const weekly = normalizeTrainingPlan(training(), fitnessPrefs);
  assert.equal(weekly.location, 'Campo');
  assert.equal(weekly.equipmentMode, fitnessPrefs.equipmentMode);
  assert.throws(() => normalizeTrainingPlan(training(), { ...fitnessPrefs, sessionsPerWeek: SessionCount.TWO }), errorCode('INCOMPLETE_RESPONSE'));
});
test('rifiuta tempi mancanti o budget incoerenti invece di etichettarli come completi', () => {
  const partial = { ...training(), sessions: [{ ...training().sessions[0], mainBlock: [drill()] }] };
  assert.throws(() => normalizeTrainingPlan(partial, fitnessPrefs), errorCode('INCOMPLETE_RESPONSE'));
  for (const changes of [{ totalDurationEstimate: undefined }, { totalDurationEstimate: '~0 min' },
    { totalDurationEstimate: 'circa dieci' }, { durationOrReps: '10 min' }]) {
    assert.throws(() => normalizeTrainingPlan({ ...training(), sessions: [{
      ...training().sessions[0], mainBlock: [{ ...drill(), ...changes }],
    }] }, fitnessPrefs), errorCode('INCOMPLETE_RESPONSE'));
  }
  for (const timeBudget of [undefined, { warmupMinutes: 5, finalGameMinutes: 5 },
    { warmupMinutes: '10', finalGameMinutes: 10 }, { warmupMinutes: 10, finalGameMinutes: -10 }]) {
    assert.throws(() => normalizeLessonPlan({ ...lesson(), timeBudget }, lessonPrefs), errorCode('INCOMPLETE_RESPONSE'));
  }
  assert.throws(() => normalizeLessonPlan(lesson(), { ...lessonPrefs, duration: '90' }), errorCode('INCOMPLETE_RESPONSE'));
});
test('warm-up AI valido mantenuto, tempi errati/incompleti lasciano usare il fallback sicuro', () => {
  const warmup = {
    duration: '10 min', title: 'Warm-up nuovo', description: 'Attivazione', setup: '4 coni',
    execution: 'Specchio e mobilità', rotation: 'Alternanza',
    timePlan: '0-2 min: mobilità; 2-5 min: specchio; 5-8 min: diagonali; 8-10 min: progressione',
  };
  const plan = (value: unknown) => ({ ...training(), sessions: [{ ...training().sessions[0], warmup: value }] });
  assert.equal(normalizeTrainingPlan(plan(warmup), fitnessPrefs).sessions[0].warmup?.title, 'Warm-up nuovo');
  for (const value of [{ ...warmup, duration: '20 min' }, { ...warmup, timePlan: '20 min: lavoro' },
    { ...warmup, timePlan: '0-5 min: mobilità; 6-10 min: gioco' }, { ...warmup, setup: undefined }]) {
    assert.equal(normalizeTrainingPlan(plan(value), fitnessPrefs).sessions[0].warmup, undefined);
  }
});
test('API/modello: fallback solo se indisponibile, nessun dettaglio sensibile esposto', async () => {
  const called: string[] = [];
  const value = await requestAIJson(async (params) => {
    called.push(params.model);
    if (called.length === 1) throw Object.assign(new Error('not found'), { status: 404 });
    return response('```json\n{"ok":true}\n```');
  }, { contents: 'programma' }, DEFAULT_MODELS);
  assert.deepEqual(value, { ok: true });
  assert.deepEqual(called, DEFAULT_MODELS);
  await assert.rejects(requestAIJson(async () => {
    throw Object.assign(new Error('model unavailable'), { status: 404 });
  }, { contents: 'programma' }, DEFAULT_MODELS), errorCode('MODEL_UNAVAILABLE'));
  await assert.rejects(requestAIJson(async () => response(''), { contents: 'programma' }, DEFAULT_MODELS), errorCode('EMPTY_RESPONSE'));
  await assert.rejects(requestAIJson(async () => response('oops'), { contents: 'programma' }, DEFAULT_MODELS), errorCode('INVALID_JSON'));
});
for (const [status, hint] of [[400, 'schema'], [403, 'Chiave API'], [429, 'Quota'], [503, 'temporaneamente']] as const) {
  test(`errore API ${status} con azione suggerita, senza retry su altri modelli`, async () => {
    let calls = 0;
    await assert.rejects(requestAIJson(async () => {
      calls++;
      throw Object.assign(new Error('remote-private-detail'), { status });
    }, { contents: 'programma' }, DEFAULT_MODELS), (error: unknown) => {
      assert.ok(error instanceof GenerationError);
      assert.equal(error.code, 'API_ERROR');
      assert.ok(generationErrorMessage(error).includes(hint));
      assert.ok(!error.message.includes('remote-private-detail'));
      return true;
    });
    assert.equal(calls, 1);
  });
}
test('prompt lezioni varia movimenti, warm-up, stazioni, gioco e richiede dettagli italiani', () => {
  const prompts = Array.from({ length: 6 }, (_, index) => buildLessonPrompt(lessonPrefs, index, ['Lezione da non ripetere']));
  assert.equal(new Set(prompts).size, 6);
  assert.ok(prompts[0].includes('porte bersaglio'));
  assert.ok(prompts[1].includes('stazioni a triangolo'));
  assert.ok(prompts[0].includes('precisione con bonus'));
  assert.ok(prompts[1].includes('conquista di territori'));
  for (const prompt of prompts) {
    for (const detail of ['coachRole', 'commonErrors', 'safety', 'adaptations', '4 passaggi', '60 minuti',
      'Lezione da non ripetere', lessonPrefs.focus, lessonPrefs.level, lessonPrefs.mode]) assert.ok(prompt.includes(detail));
  }
});

test('flussi reali del servizio tramite SDK con fetch simulato (nessuna chiamata esterna)', async (t) => {
  const originalEnv = { key: process.env.API_KEY, model: process.env.GEMINI_MODEL, fallback: process.env.GEMINI_FALLBACK_MODEL };
  delete process.env.API_KEY;
  delete process.env.GEMINI_MODEL;
  delete process.env.GEMINI_FALLBACK_MODEL;
  t.after(() => {
    for (const [name, value] of [['API_KEY', originalEnv.key], ['GEMINI_MODEL', originalEnv.model], ['GEMINI_FALLBACK_MODEL', originalEnv.fallback]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  });
  const storage = new Map<string, string>();
  const unexpectedFetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected external request'); });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => storage.get(key) || null } });
  t.after(() => { Reflect.deleteProperty(globalThis, 'localStorage'); });

  await t.test('chiave assente e whitespace: entrambi i flussi falliscono prima dell’API', async () => {
    storage.set('gemini_api_key', '  ');
    assert.equal(hasEnvApiKey(), false);
    await assert.rejects(generateTrainingPlan(fitnessPrefs), errorCode('API_KEY_MISSING'));
    await assert.rejects(generateLessonPlan(lessonPrefs), errorCode('API_KEY_MISSING'));
    assert.equal(unexpectedFetch.mock.calls.length, 0);
  });
  storage.set('gemini_api_key', 'unit-test-placeholder');
  const prompts: string[] = [];
  const urls: string[] = [];
  let output: unknown = training();
  let apiStatus = 200;
  const mockedFetch = t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    urls.push(String(input));
    const body = JSON.parse(String(init?.body));
    prompts.push(body.contents[0].parts[0].text);
    return new Response(JSON.stringify(apiStatus === 200 ? {
      candidates: [{ content: { role: 'model', parts: [{ text: typeof output === 'string' ? output : JSON.stringify(output) }] } }],
    } : { error: { code: apiStatus, message: 'simulated API error', status: 'PERMISSION_DENIED' } }), {
      status: apiStatus, headers: { 'Content-Type': 'application/json' },
    });
  });

  await t.test('preparazione: warm-up extra, 50/55 min e copertura selezionata', async () => {
    const plan = await generateTrainingPlan(fitnessPrefs);
    assert.equal(plan.sessions[0].totalDuration, '50 min');
    assert.equal(plan.sessions[0].warmup?.duration, '10 min');
    assert.equal(plan.sessions[0].warmup?.isExtra, true);
    const content = JSON.stringify(plan).toLowerCase();
    for (const word of ['blazepod', 'buzzoni', 'segnale']) assert.ok(content.includes(word));
    assert.ok(plan.sessions[0].mainBlock[0].setup);
    output = { ...training(), sessions: [{ ...training().sessions[0], totalDuration: '55 min',
      mainBlock: training().sessions[0].mainBlock.map((drill, i) => ({ ...drill, totalDurationEstimate: i === 0 ? '~15 min' : '~10 min' })),
    }] };
    const noWarmup = await generateTrainingPlan({ ...fitnessPrefs, includeWarmup: false });
    assert.equal(noWarmup.sessions[0].totalDuration, '55 min');
    assert.equal(noWarmup.sessions[0].warmup, undefined);
  });
  await t.test('lezione con fence: dettagli mantenuti e storia/varietà fra richieste', async () => {
    output = `\`\`\`json\n${JSON.stringify(lesson())}\n\`\`\``;
    const first = await generateLessonPlan(lessonPrefs);
    const firstPrompt = prompts.at(-1);
    const second = await generateLessonPlan(lessonPrefs);
    assert.equal(first.basketDrills[0].safety, drill().safety);
    assert.equal(second.liveDrills[0].coachRole, drill().coachRole);
    assert.equal(second.mode, LessonMode.GROUP_3);
    assert.notEqual(firstPrompt, prompts.at(-1));
    assert.ok(prompts.at(-1)?.includes('Volée e recupero'));
    assert.ok(urls.every((url) => url.includes(DEFAULT_MODELS[0])));
  });
  await t.test('risposte vuote/incomplete/non JSON sono errori distinti in entrambi i flussi', async () => {
    for (const generate of [() => generateTrainingPlan(fitnessPrefs), () => generateLessonPlan(lessonPrefs)]) {
      for (const [value, code] of [['', 'EMPTY_RESPONSE'], ['not json', 'INVALID_JSON'], [{}, 'INCOMPLETE_RESPONSE']] as const) {
        output = value;
        await assert.rejects(generate(), errorCode(code));
      }
    }
  });
  await t.test('errore SDK 403 leggibile in entrambi i flussi', async () => {
    apiStatus = 403;
    await assert.rejects(generateTrainingPlan(fitnessPrefs), errorCode('API_ERROR'));
    await assert.rejects(generateLessonPlan(lessonPrefs), errorCode('API_ERROR'));
  });
  assert.ok(mockedFetch.mock.calls.length > 0);
});
