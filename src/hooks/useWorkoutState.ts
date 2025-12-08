import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { WeekPhase, UserWeights, WorkoutDay, Exercise, WorkoutSession } from '../types';
import { workouts as defaultWorkouts, getWeekInfo } from '../data/workouts';

const STORAGE_KEYS = {
  WEEK: 'gym-tracker-week',
  WEIGHTS: 'gym-tracker-weights',
  DARK_MODE: 'gym-tracker-dark-mode',
  CUSTOM_WORKOUTS: 'gym-tracker-workouts',
  WEEK_VISIBLE: 'gym-tracker-week-visible',
  REST_DURATION: 'gym-tracker-rest-duration',
};

const DEFAULT_REST_DURATION = 150; // 2:30 in seconds

export function useWorkoutState() {
  const [currentWeek, setCurrentWeek] = useLocalStorage<WeekPhase>(STORAGE_KEYS.WEEK, 1);
  const [userWeights, setUserWeights] = useLocalStorage<UserWeights>(STORAGE_KEYS.WEIGHTS, {});
  const [darkMode, setDarkMode] = useLocalStorage<boolean>(STORAGE_KEYS.DARK_MODE, true);
  const [customWorkouts, setCustomWorkouts] = useLocalStorage<WorkoutSession[]>(
    STORAGE_KEYS.CUSTOM_WORKOUTS, 
    defaultWorkouts
  );
  const [weekSelectorVisible, setWeekSelectorVisible] = useLocalStorage<boolean>(
    STORAGE_KEYS.WEEK_VISIBLE,
    true
  );
  const [restDuration, setRestDuration] = useLocalStorage<number>(
    STORAGE_KEYS.REST_DURATION,
    DEFAULT_REST_DURATION
  );

  // Calculate adjusted weight for current week
  const getAdjustedWeight = useCallback(
    (exerciseId: string): number => {
      const baseWeight = userWeights[exerciseId] ?? 0;
      const weekData = getWeekInfo(currentWeek);
      return Math.round(baseWeight * weekData.loadModifier * 2) / 2; // Round to nearest 0.5kg
    },
    [currentWeek, userWeights]
  );

  // Update base weight for an exercise
  const updateWeight = useCallback(
    (exerciseId: string, newWeight: number) => {
      setUserWeights((prev) => ({
        ...prev,
        [exerciseId]: Math.max(0, newWeight),
      }));
    },
    [setUserWeights]
  );

  // Add exercise to a workout
  const addExercise = useCallback(
    (workoutId: WorkoutDay, exercise: Exercise) => {
      setCustomWorkouts((prev) => 
        prev.map((workout) => 
          workout.id === workoutId
            ? { ...workout, exercises: [...workout.exercises, exercise] }
            : workout
        )
      );
    },
    [setCustomWorkouts]
  );

  // Delete exercise from a workout
  const deleteExercise = useCallback(
    (workoutId: WorkoutDay, exerciseId: string) => {
      setCustomWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === workoutId
            ? { ...workout, exercises: workout.exercises.filter((e) => e.id !== exerciseId) }
            : workout
        )
      );
      // Also remove the weight entry
      setUserWeights((prev) => {
        const updated = { ...prev };
        delete updated[exerciseId];
        return updated;
      });
    },
    [setCustomWorkouts, setUserWeights]
  );

  // Reset all data
  const resetAll = useCallback(() => {
    setCurrentWeek(1);
    setUserWeights({});
    setCustomWorkouts(defaultWorkouts);
    setWeekSelectorVisible(true);
  }, [setCurrentWeek, setUserWeights, setCustomWorkouts, setWeekSelectorVisible]);

  // Advance to next week
  const nextWeek = useCallback(() => {
    setCurrentWeek((prev) => ((prev % 4) + 1) as WeekPhase);
  }, [setCurrentWeek]);

  return {
    currentWeek,
    setCurrentWeek,
    userWeights,
    updateWeight,
    getAdjustedWeight,
    darkMode,
    setDarkMode,
    resetAll,
    nextWeek,
    workouts: customWorkouts,
    addExercise,
    deleteExercise,
    weekSelectorVisible,
    setWeekSelectorVisible,
    restDuration,
    setRestDuration,
  };
}
