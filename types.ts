
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

export interface Drill {
  name: string;
  description: string;
  durationOrReps: string;
  rest: string;
  notes?: string;
}

export interface TrainingSession {
  dayName: string;
  focusArea: string;
  totalDuration: string;
  warmup: string[];
  mainBlock: Drill[];
  cooldown: string[];
}

export interface WeeklyPlan {
  weeklyGoal: string;
  sessions: TrainingSession[];
  advice: string;
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

export type WarmupType = 'Standard' | 'Game';

export interface UserPreferences {
  sport: Sport;
  groupSize: GroupSize;
  level: FitnessLevel;
  sessionsPerWeek: SessionCount;
  focus: TrainingFocus;
  phase: 'Pre-season' | 'In-season' | 'Off-season';
  includeCognitive: boolean;
  useBlazepod: boolean;
  warmupType: WarmupType;
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
