import {
  Box,
  Typography,
  alpha,
  useTheme,
  Fab,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import type { WorkoutSession, WeekPhase, WorkoutDay } from '../types';
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
  onReorderExercises: (workoutId: WorkoutDay, fromIndex: number, toIndex: number) => void;
  timerOpen?: boolean;
}

export function WorkoutView({
  workout,
  currentWeek,
  userWeights,
  getAdjustedWeight,
  onWeightChange,
  onDeleteExercise,
  onAddExercise,
  onReorderExercises,
  timerOpen = false,
}: WorkoutViewProps) {
  const theme = useTheme();
  const weekData = getWeekInfo(currentWeek);
  
  const sortedExercises = [...workout.exercises].sort((a, b) => {
    const posA = a.position ?? 0;
    const posB = b.position ?? 0;
    return posA - posB;
  });

  const uniqueMuscleGroups = [...new Set(sortedExercises.map(e => e.muscleGroup))];

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorderExercises(workout.id, index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < sortedExercises.length - 1) {
      onReorderExercises(workout.id, index, index + 1);
    }
  };

  return (
    <Box sx={{ pb: timerOpen ? 50 : 16 }}>
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
            mb: 1,
            position: 'relative',
          }}
        >
          {workout.name}
          <Box component="span" sx={{ ml: 1.5, display: 'inline-flex', gap: 0.5, verticalAlign: 'middle' }}>
            <Chip
              label={`RIR ${weekData.rir}`}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: 22,
                fontWeight: 500,
                backgroundColor: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.dark,
              }}
            />
            {weekData.loadModifier !== 1 && (
              <Chip
                label={weekData.loadModifier < 1 
                  ? `-${Math.round((1 - weekData.loadModifier) * 100)}%`
                  : `+${Math.round((weekData.loadModifier - 1) * 100)}%`
                }
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 22,
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.success.main, 0.12),
                  color: theme.palette.success.main,
                }}
              />
            )}
          </Box>
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', position: 'relative', flexWrap: 'wrap', mt: 1.5 }}>
          {uniqueMuscleGroups.slice(0, 3).map((muscle) => (
            <Chip
              key={muscle}
              label={muscle}
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                fontWeight: 500,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            />
          ))}
          {uniqueMuscleGroups.length > 3 && (
            <Chip
              label={`+${uniqueMuscleGroups.length - 3}`}
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                fontWeight: 500,
                backgroundColor: alpha(theme.palette.secondary.main, 0.12),
                color: theme.palette.secondary.main,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Exercise List */}
      <Box id="exercise-list-container">
        {sortedExercises.map((exercise, index) => (
          <Box
            key={exercise.id}
            className="exercise-item"
            sx={{
              position: 'relative',
              mb: 2,
            }}
          >
            <ExerciseCard
              exercise={exercise}
              adjustedWeight={getAdjustedWeight(exercise.id)}
              baseWeight={userWeights[exercise.id] ?? 0}
              onWeightChange={onWeightChange}
              onDelete={() => onDeleteExercise(workout.id, exercise.id)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              canMoveUp={index !== 0}
              canMoveDown={index !== sortedExercises.length - 1}
            />
          </Box>
        ))}
      </Box>

      {/* Add Exercise FAB */}
      <Fab
        color="primary"
        size="medium"
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
