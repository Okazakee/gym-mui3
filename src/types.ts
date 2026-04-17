export type WorkoutDay = 'push' | 'pull' | 'legs' | 'recall';

export type WeekPhase = 1 | 2 | 3 | 4;

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g., "6", "8-10", "10-12"
  baseWeight: number; // Starting weight in kg
  muscleGroup: string;
  notes?: string;
  position?: number; // For explicit ordering - lower position = higher in list (optional for backwards compatibility)
}

export interface WorkoutSession {
  id: WorkoutDay;
  name: string;
  description: string;
  exercises: Exercise[];
}

export interface WeekInfo {
  week: WeekPhase;
  name: string;
  description: string;
  loadModifier: number; // Percentage modifier (1.0 = 100%, 1.05 = +5%, 0.8 = -20%)
  rir: number; // Reps in Reserve
}

export interface UserWeights {
  [exerciseId: string]: number;
}

export interface CompletedSet {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  timestamp: number;
}

export interface WorkoutLog {
  date: string; // ISO date string
  workoutDay: WorkoutDay;
  week: WeekPhase;
  sets: CompletedSet[];
  completed: boolean;
}

export interface AppState {
  currentWeek: WeekPhase;
  userWeights: UserWeights;
  workoutLogs: WorkoutLog[];
  darkMode: boolean;
}

