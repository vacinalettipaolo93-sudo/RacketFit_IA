export enum Sport {
  TENNIS = 'Tennis',
  PADEL = 'Padel'
}

export enum FitnessLevel {
  BEGINNER = 'Principiante',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzato/Agonista',
  PRO = 'Professionista'
}

export enum SessionCount {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5'
}

export enum GroupSize {
  ONE = '1 Persona',
  TWO = '2 Persone',
  THREE = '3 Persone',
  FOUR = '4 Persone',
  GROUP = 'Gruppo (5+)'
}

export enum TrainingFocus {
  SPEED_AGILITY = 'Velocità e Agilità (Footwork)',
  POWER_EXPLOSIVENESS = 'Potenza ed Esplosività',
  STRENGTH = 'Forza Muscolare',
  ENDURANCE = 'Resistenza Specifica',
  RECOVERY_MOBILITY = 'Mobilità e Recupero',
  MIXED = 'Misto (Generale)'
}

export enum EquipmentMode {
  BODYWEIGHT_MINIMAL = 'Corpo libero / attrezzatura minima',
  WITH_EQUIPMENT = 'Con attrezzi (elastici, palle mediche, bastoni, step)',
  RACKET_SPECIFIC = 'Solo strumenti specifici sport di racchetta'
}

// New Types for Coach Mode
export enum LessonMode {
  INDIVIDUAL = 'Individuale (1 giocatore)',
  COUPLE = 'Coppia (2 giocatori)',
  GROUP_3 = 'Gruppo (3 giocatori)',
  GROUP_4 = 'Gruppo (4 giocatori)'
}

// Specific lists for Dropdowns
export const TENNIS_LESSON_FOCUS = [
  'Dritto (Topspin/Piatto)',
  'Rovescio (Topspin/Back)',
  'Volée e Gioco a Rete',
  'Smash e Colpi sopra la testa',
  'Servizio e Risposta',
  'Approccio a rete e Chiusura',
  'Difesa e Recupero da fondo',
  'Tattica Singolare',
  'Tattica Doppio'
];

export const PADEL_LESSON_FOCUS = [
  'Dritto e Rovescio (Fondo campo)',
  'Uscita di Parete (Bajada)',
  'Volée (Blocco, Attacco, Transizione)',
  'Bandeja e Vibora',
  'Smash (x3, x4, Gancho)',
  'Globo (Pallonetto) e Difesa alta',
  'Servizio e Risposta',
  'Gioco con i Vetri / Doppia Parete',
  'Tattica di Coppia'
];

export type SessionLocation = 'Campo' | 'Fuori';
export type MainSessionDuration = '50 min' | '55 min';

export interface Drill {
  name: string;
  description: string;
  durationOrReps: string;
  rest: string;
  notes?: string;

  // NEW: per atletica propedeutica
  pairWork?: boolean; // quasi sempre true
  location?: SessionLocation; // Campo / Fuori

  // NEW: attrezzo usato nell'esercizio (es: "Palla medica 3kg", "Elastico resistenza media")
  equipment?: string;
  // NEW: istruzioni di setup pratico (posizione cinesini, attrezzi, punto di partenza, distanze)
  setup?: string;
  // NEW: esecuzione pratica sul campo, passo per passo
  execution?: string;
  // NEW: rotazione atleti / cambio turno nella stazione
  rotation?: string;
  // NEW: durata totale stimata dell'esercizio incluso recupero (es: "~5 min", "~7 min")
  totalDurationEstimate?: string;
}

export interface WarmupBlock {
  duration: '10 min';
  type: WarmupType;
  title: string;
  description: string;
  isExtra: true;
}

export interface TrainingSession {
  dayName: string;
  focusArea: string;

  // Main block: 50 o 55 minuti netti (senza warm-up extra)
  totalDuration: MainSessionDuration;

  // Riscaldamento extra opzionale (sempre 10 min)
  warmup?: WarmupBlock;

  // Blocco principale di lavoro
  mainBlock: Drill[];

  // NEW: dove si svolge la sessione
  location: SessionLocation;
}

export interface WeeklyPlan {
  weeklyGoal: string;
  sessions: TrainingSession[];
  advice: string;

  // NEW: scelta utente, applicata a tutte le sessioni (o come default)
  location: SessionLocation;
  equipmentMode?: EquipmentMode;
}

export interface LessonPlan {
  title: string;
  sport: Sport;
  mode: LessonMode;
  level: FitnessLevel;
  duration: string; // 60 or 90 mins
  warmup: string[]; // Technical warmup
  basketDrills: Drill[]; // Cesto exercises
  liveDrills: Drill[]; // Live ball / Situational
  finalGame: string; // Points or game logic
}

export type WarmupType = 'Normale' | 'Gioco';

// Preferenze utente per generazione programmi atletici.
export interface UserPreferences {
  sport: Sport;
  groupSize: GroupSize;
  level: FitnessLevel;
  sessionsPerWeek: SessionCount;
  focus: TrainingFocus;
  equipmentMode: EquipmentMode;
  phase: 'Pre-season' | 'In-season' | 'Off-season';
  includeWarmup: boolean;
  includeCognitive: boolean;
  useBlazepod: boolean;
  useBuzzoni: boolean;
  warmupType: WarmupType;

  location: SessionLocation;
}

export interface LessonPreferences {
  sport: Sport;
  level: FitnessLevel;
  mode: LessonMode;
  focus: string;
  duration: '60' | '90';
}

export interface SavedPlan extends WeeklyPlan {
  id: string;
  title: string;
  createdAt: string;
  sport: string;
  level: string;
  userId?: string;
}

export interface SavedLessonPlan extends LessonPlan {
  id: string;
  createdAt: string;
  userId?: string;
}

export interface PhysicalTest {
  id: string;
  name: string;
  category: 'Agility' | 'Endurance' | 'Power' | 'Strength' | 'Coordination' | 'Flexibility' | 'Reaction';
  description: string;
  equipment: string;
  procedure: string[];
  measurement: string;
}

export interface TestResult {
  id: string;
  testId: string;
  testName: string;
  athleteName: string;
  date: string;
  value: string;
  userId?: string;
}
