export type WorkoutDay = string;

export type WeekPhase = number;

export interface WeekConfig {
  id: number;
  name: string;
  loadModifier: number;
  rir: number;
}

export interface DayConfig {
  id: string;
  name: string;
  icon: string;
}

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

export interface UserWeights {
  [exerciseId: string]: number;
}
