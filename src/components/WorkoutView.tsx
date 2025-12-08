import { Box, Typography, alpha, useTheme, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { WorkoutSession, WeekPhase } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { getWeekInfo } from '../data/workouts';

interface WorkoutViewProps {
  workout: WorkoutSession;
  currentWeek: WeekPhase;
  userWeights: Record<string, number>;
  getAdjustedWeight: (exerciseId: string) => number;
  onWeightChange: (exerciseId: string, newWeight: number) => void;
  onDeleteExercise: (workoutId: string, exerciseId: string) => void;
  onAddExercise: () => void;
}

export function WorkoutView({
  workout,
  currentWeek,
  userWeights,
  getAdjustedWeight,
  onWeightChange,
  onDeleteExercise,
  onAddExercise,
}: WorkoutViewProps) {
  const theme = useTheme();
  const weekData = getWeekInfo(currentWeek);

  return (
    <Box sx={{ pb: 12 }}>
      {/* Workout Header */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          }}
        />

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 0.5,
            position: 'relative',
          }}
        >
          {workout.name}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            position: 'relative',
          }}
        >
          {workout.description}
        </Typography>
      </Box>

      {/* Exercise List */}
      <Box>
        {workout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            adjustedWeight={getAdjustedWeight(exercise.id)}
            baseWeight={userWeights[exercise.id] ?? 0}
            onWeightChange={onWeightChange}
            onDelete={() => onDeleteExercise(workout.id, exercise.id)}
            rir={weekData.rir}
          />
        ))}
      </Box>

      {/* Add Exercise FAB */}
      <Fab
        color="primary"
        onClick={onAddExercise}
        sx={{
          position: 'fixed',
          bottom: 88,
          right: 20,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
