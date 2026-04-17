import { useCallback, useEffect } from 'react';
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
  VERSION: 'gym-tracker-version', // For migration tracking
};

const CURRENT_VERSION = 1;
const DEFAULT_REST_DURATION = 150; // 2:30 in seconds

// Migration function to add position to existing exercises
function migrateWorkouts(workouts: WorkoutSession[]): WorkoutSession[] {
  return workouts.map((workout) => {
    // If exercises already have positions, return as-is
    const hasPositions = workout.exercises.every((e) => e.position !== undefined);
    if (hasPositions) {
      return workout;
    }

    // Otherwise, add positions based on array index
    return {
      ...workout,
      exercises: workout.exercises.map((exercise, index) => ({
        ...exercise,
        position: index,
      })),
    };
  });
}

// Sort exercises by position
function sortExercisesByPosition(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => {
    const posA = a.position ?? 0;
    const posB = b.position ?? 0;
    return posA - posB;
  });
}

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
  const [storedVersion, setStoredVersion] = useLocalStorage<number | null>(
    STORAGE_KEYS.VERSION,
    null
  );

  // Run migrations on mount
  useEffect(() => {
    if (storedVersion === null || storedVersion < CURRENT_VERSION) {
      setCustomWorkouts((prev) => migrateWorkouts(prev));
      setStoredVersion(CURRENT_VERSION);
    }
  }, [storedVersion, setCustomWorkouts, setStoredVersion]);

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
    (workoutId: WorkoutDay, exercise: Exercise, position: number = -1) => {
      setCustomWorkouts((prev) => 
        prev.map((workout) => {
          if (workout.id !== workoutId) return workout;
          
          // Sort existing exercises by position
          const sortedExercises = sortExercisesByPosition(workout.exercises);
          
          // Determine position for new exercise
          let newPosition: number;
          if (position === -1) {
            // Add at the end - get max position + 1
            const maxPosition = sortedExercises.length > 0
              ? Math.max(...sortedExercises.map((e) => e.position ?? 0))
              : -1;
            newPosition = maxPosition + 1;
          } else {
            // Insert at specific position - shift others up
            newPosition = position;
          }
          
          const exerciseWithPosition: Exercise = {
            ...exercise,
            position: newPosition,
          };
          
          // Insert exercise and re-sort
          const newExercises = [...sortedExercises, exerciseWithPosition];
          return { ...workout, exercises: newExercises };
        })
      );
    },
    [setCustomWorkouts]
  );

  // Delete exercise from a workout
  const deleteExercise = useCallback(
    (workoutId: WorkoutDay, exerciseId: string) => {
      setCustomWorkouts((prev) =>
        prev.map((workout) => {
          if (workout.id !== workoutId) return workout;
          
          const filteredExercises = workout.exercises.filter((e) => e.id !== exerciseId);
          return { ...workout, exercises: filteredExercises };
        })
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

  // Reorder exercises within a workout
  const reorderExercises = useCallback(
    (workoutId: WorkoutDay, fromIndex: number, toIndex: number) => {
      setCustomWorkouts((prev) =>
        prev.map((workout) => {
          if (workout.id !== workoutId) return workout;
          
          // Sort by position first to get correct order
          const sortedExercises = sortExercisesByPosition(workout.exercises);
          
          // Get the exercise being moved
          const [movedExercise] = sortedExercises.splice(fromIndex, 1);
          
          // Insert at new position
          sortedExercises.splice(toIndex, 0, movedExercise);
          
          // Update positions to match new order
          const reindexedExercises = sortedExercises.map((exercise, index) => ({
            ...exercise,
            position: index,
          }));
          
          return { ...workout, exercises: reindexedExercises };
        })
      );
    },
    [setCustomWorkouts]
  );

  // Reset all data
  const resetAll = useCallback(() => {
    setCurrentWeek(1);
    setUserWeights({});
    setCustomWorkouts(defaultWorkouts);
    setWeekSelectorVisible(true);
  }, [setCurrentWeek, setUserWeights, setCustomWorkouts, setWeekSelectorVisible]);

  // Import backup data
  const importData = useCallback(
    (backup: { version: number; data: { workouts: WorkoutSession[]; userWeights: UserWeights; settings: { currentWeek: WeekPhase; restDuration: number; weekSelectorVisible: boolean; darkMode: boolean } } }) => {
      if (backup.data.userWeights) {
        setUserWeights(backup.data.userWeights);
      }
      if (backup.data.workouts) {
        setCustomWorkouts(backup.data.workouts);
      }
      if (backup.data.settings) {
        const { currentWeek: week, restDuration: rest, weekSelectorVisible: visible, darkMode: dark } = backup.data.settings;
        if (week) setCurrentWeek(week);
        if (rest) setRestDuration(rest);
        if (visible !== undefined) setWeekSelectorVisible(visible);
        if (dark !== undefined) setDarkMode(dark);
      }
    },
    [setUserWeights, setCustomWorkouts, setCurrentWeek, setRestDuration, setWeekSelectorVisible, setDarkMode]
  );

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
    importData,
    nextWeek,
    workouts: customWorkouts,
    addExercise,
    deleteExercise,
    reorderExercises,
    weekSelectorVisible,
    setWeekSelectorVisible,
    restDuration,
    setRestDuration,
  };
}
