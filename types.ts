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

export interface UserPreferences {
  sport: Sport;
  level: FitnessLevel;
  sessionsPerWeek: SessionCount;
  focus: TrainingFocus;
  phase: 'Pre-season' | 'In-season' | 'Off-season';
}

export interface SavedPlan extends WeeklyPlan {
  id: string;
  title: string;
  createdAt: string;
  sport: string;
  level: string;
  userId?: string;
}

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
