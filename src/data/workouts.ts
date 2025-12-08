import type { WorkoutSession, WeekInfo } from '../types';

export const weekInfo: WeekInfo[] = [
  {
    week: 1,
    name: 'Tolerance',
    description: 'Establish baseline loads and acclimate to volume',
    loadModifier: 1.0,
    rir: 2,
  },
  {
    week: 2,
    name: 'Accumulation',
    description: 'Progressive overload with +2.5-5% weight',
    loadModifier: 1.05,
    rir: 2,
  },
  {
    week: 3,
    name: 'Peak',
    description: 'Maintain load, push closer to failure',
    loadModifier: 1.05,
    rir: 1,
  },
  {
    week: 4,
    name: 'Deload',
    description: 'Recovery phase with reduced intensity',
    loadModifier: 0.8,
    rir: 3,
  },
];

export const workouts: WorkoutSession[] = [
  {
    id: 'push',
    name: 'Push Day',
    description: 'Chest, Shoulders & Triceps',
    exercises: [
      {
        id: 'multipower-press',
        name: 'MultiPower Press 30°',
        sets: 2,
        reps: '6',
        baseWeight: 0,
        muscleGroup: 'Chest',
        notes: 'Incline angle for upper chest emphasis',
      },
      {
        id: 'shoulder-press-db',
        name: 'Shoulder Press (Dumbbells)',
        sets: 2,
        reps: '8-10',
        baseWeight: 0,
        muscleGroup: 'Shoulders',
        notes: '10kg per hand',
      },
      {
        id: 'chest-press-close',
        name: 'Chest Press Close Grip',
        sets: 2,
        reps: '10-12',
        baseWeight: 0,
        muscleGroup: 'Triceps',
        notes: 'Neutral grip for triceps emphasis',
      },
      {
        id: 'pushdown-bar',
        name: 'Push Down Cable Bar',
        sets: 2,
        reps: '12',
        baseWeight: 0,
        muscleGroup: 'Triceps',
      },
      {
        id: 'dannunzio-crunch-push',
        name: "D'annunzio Crunch",
        sets: 2,
        reps: '10-12',
        baseWeight: 0,
        muscleGroup: 'Core',
      },
    ],
  },
  {
    id: 'pull',
    name: 'Pull Day',
    description: 'Back & Biceps',
    exercises: [
      {
        id: 'tbar-row',
        name: 'T-Bar Row',
        sets: 2,
        reps: '6',
        baseWeight: 0,
        muscleGroup: 'Back',
        notes: 'Upper back thickness focus',
      },
      {
        id: 'low-pulley-row',
        name: 'Low Pulley Row',
        sets: 2,
        reps: '10',
        baseWeight: 0,
        muscleGroup: 'Back',
        notes: 'Mid-back and lats',
      },
      {
        id: 'incline-curl',
        name: 'Incline Dumbbell Curl',
        sets: 2,
        reps: '10',
        baseWeight: 0,
        muscleGroup: 'Biceps',
        notes: 'Emphasis on stretch',
      },
      {
        id: 'alternating-curl-pull',
        name: 'Alternating Curl',
        sets: 2,
        reps: '12',
        baseWeight: 0,
        muscleGroup: 'Biceps',
      },
      {
        id: 'cable-crunch',
        name: 'Cable Crunch',
        sets: 2,
        reps: '8-10',
        baseWeight: 0,
        muscleGroup: 'Core',
      },
    ],
  },
  {
    id: 'legs',
    name: 'Leg Day',
    description: 'Quads, Hamstrings & Calves',
    exercises: [
      {
        id: 'leg-press',
        name: 'Leg Press 45°',
        sets: 2,
        reps: '6',
        baseWeight: 0,
        muscleGroup: 'Legs',
        notes: 'Primary quad/glute compound',
      },
      {
        id: 'leg-extension',
        name: 'Leg Extension',
        sets: 2,
        reps: '8-10',
        baseWeight: 0,
        muscleGroup: 'Quads',
      },
      {
        id: 'lying-leg-curl',
        name: 'Lying Leg Curl',
        sets: 2,
        reps: '8-10',
        baseWeight: 0,
        muscleGroup: 'Hamstrings',
      },
      {
        id: 'standing-calf',
        name: 'Standing Calf Raise',
        sets: 2,
        reps: '10',
        baseWeight: 0,
        muscleGroup: 'Calves',
      },
      {
        id: 'side-crunch',
        name: 'Side Crunch MultiPower',
        sets: 2,
        reps: '10',
        baseWeight: 0,
        muscleGroup: 'Core',
        notes: 'Oblique work',
      },
    ],
  },
  {
    id: 'recall',
    name: 'Recall Day',
    description: 'Supplementary Full Body',
    exercises: [
      {
        id: 'incline-chest-press',
        name: 'Incline Chest Press',
        sets: 2,
        reps: '6',
        baseWeight: 0,
        muscleGroup: 'Chest',
        notes: 'Upper chest focus',
      },
      {
        id: 'lat-machine',
        name: 'Lat Machine',
        sets: 2,
        reps: '8',
        baseWeight: 0,
        muscleGroup: 'Back',
        notes: 'Lat width',
      },
      {
        id: 'alternating-curl-recall',
        name: 'Alternating Curl',
        sets: 2,
        reps: '8',
        baseWeight: 0,
        muscleGroup: 'Biceps',
        notes: '8 reps per side',
      },
      {
        id: 'pushdown-rope',
        name: 'Push Down with Rope',
        sets: 2,
        reps: '10',
        baseWeight: 0,
        muscleGroup: 'Triceps',
        notes: 'Long head emphasis',
      },
      {
        id: 'dannunzio-crunch-recall',
        name: "D'annunzio Crunch",
        sets: 2,
        reps: '8',
        baseWeight: 0,
        muscleGroup: 'Core',
      },
    ],
  },
];

export const getWorkout = (day: string): WorkoutSession | undefined => {
  return workouts.find((w) => w.id === day);
};

export const getWeekInfo = (week: number): WeekInfo => {
  return weekInfo.find((w) => w.week === week) || weekInfo[0];
};

