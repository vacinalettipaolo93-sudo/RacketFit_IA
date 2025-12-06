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
  GROUP = 'Gruppo (3-4 giocatori)'
}

export enum LessonFocus {
  FOREHAND = 'Dritto / Dritto Padel',
  BACKHAND = 'Rovescio / Rovescio Padel',
  VOLLEY = 'Volée e Gioco a Rete',
  OVERHEAD = 'Smash, Vibora, Bandeja',
  SERVE_RETURN = 'Servizio e Risposta',
  DEFENSE = 'Difesa e Pareti (Padel) / Recuperi',
  TACTICS = 'Tattica di Gioco e Situazioni'
}

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

export interface UserPreferences {
  sport: Sport;
  level: FitnessLevel;
  sessionsPerWeek: SessionCount;
  focus: TrainingFocus;
  phase: 'Pre-season' | 'In-season' | 'Off-season';
}

export interface LessonPreferences {
  sport: Sport;
  level: FitnessLevel;
  mode: LessonMode;
  focus: LessonFocus;
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

// Reuse saved plan structure for lessons roughly, or create new if strictly needed. 
// For now we will focus on generating them.

export interface PhysicalTest {
  id: string;
  name: string;
  category: 'Agility' | 'Endurance' | 'Power' | 'Strength';
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