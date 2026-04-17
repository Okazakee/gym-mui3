import { useState } from 'react';
import {
  Box,
  Typography,
  alpha,
  useTheme,
  Fab,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Settings as SettingsIcon } from '@mui/icons-material';
import type { WorkoutSession, WeekPhase, WorkoutDay, WeekConfig, DayConfig, Exercise } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { ProgramSettingsModal } from './ProgramSettingsModal';
import { AddExerciseDialog } from './AddExerciseDialog';

interface WorkoutViewProps {
  workout: WorkoutSession;
  currentWeek: WeekPhase;
  weekConfigs: WeekConfig[];
  onWeekChange: (week: WeekPhase) => void;
  onWeekConfigsChange: (configs: WeekConfig[]) => void;
  dayConfigs: DayConfig[];
  onDayConfigsChange: (configs: DayConfig[]) => void;
  onAddDayWithWorkout?: (day: DayConfig, workout: WorkoutSession) => void;
  userWeights: Record<string, number>;
  getAdjustedWeight: (exerciseId: string) => number;
  onWeightChange: (exerciseId: string, newWeight: number) => void;
  onDeleteExercise: (workoutId: string, exerciseId: string) => void;
  onEditExercise: (workoutId: string, exercise: Exercise) => void;
  onAddExercise: () => void;
  onReorderExercises: (workoutId: WorkoutDay, fromIndex: number, toIndex: number) => void;
  timerOpen?: boolean;
  weekName: string;
}

export function WorkoutView({
  workout,
  currentWeek,
  weekConfigs,
  onWeekChange,
  onWeekConfigsChange,
  dayConfigs,
  onDayConfigsChange,
  onAddDayWithWorkout,
  userWeights,
  getAdjustedWeight,
  onWeightChange,
  onDeleteExercise,
  onEditExercise,
  onAddExercise,
  onReorderExercises,
  timerOpen = false,
  weekName,
}: WorkoutViewProps) {
  const theme = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const weekData = weekConfigs.find(w => w.id === currentWeek) || weekConfigs[0] || { name: 'Week 1', loadModifier: 1, rir: 2 };
  
  const sortedExercises = [...workout.exercises].sort((a, b) => {
    const posA = a.position ?? 0;
    const posB = b.position ?? 0;
    return posA - posB;
  });

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

  const handleEditClick = (exercise: Exercise) => {
    setExerciseToEdit(exercise);
    setEditDialogOpen(true);
  };

  const handleEditSave = (exercise: Exercise) => {
    onEditExercise(workout.id, exercise);
    setEditDialogOpen(false);
    setExerciseToEdit(null);
  };

  return (
    <Box sx={{ pb: timerOpen ? 50 : 14 }}>
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

        {/* Row 1: Title centered */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {weekName} - {workout.name}
        </Typography>

        {/* Row 2: RIR and load */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', mt: 2, position: 'relative' }}>
          <Chip
            label={`RIR ${weekData.rir}`}
            size="small"
            sx={{
              fontSize: '0.75rem',
              height: 24,
              fontWeight: 500,
              backgroundColor: alpha(theme.palette.warning.main, 0.12),
              color: theme.palette.warning.dark,
            }}
          />
          <Chip
            label={weekData.loadModifier === 1 ? 'Baseline' : weekData.loadModifier < 1 ? `-${Math.round((1 - weekData.loadModifier) * 100)}%` : `+${Math.round((weekData.loadModifier - 1) * 100)}%`}
            size="small"
            sx={{
              fontSize: '0.75rem',
              height: 24,
              fontWeight: 600,
              backgroundColor: alpha(theme.palette.success.main, 0.12),
              color: theme.palette.success.main,
            }}
          />
        </Box>

        {/* Row 3: Week tabs and settings */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', mt: 2, position: 'relative' }}>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {weekConfigs.map((week) => (
              <Chip
                key={week.id}
                label={`W${week.id}`}
                onClick={() => onWeekChange(week.id)}
                sx={{
                  px: 0.75,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  height: 28,
                  minWidth: 36,
                  transition: 'all 0.2s ease',
                  backgroundColor:
                    currentWeek === week.id
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.1),
                  color:
                    currentWeek === week.id
                      ? theme.palette.primary.contrastText
                      : theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor:
                      currentWeek === week.id
                        ? theme.palette.primary.dark
                        : alpha(theme.palette.primary.main, 0.2),
                    transform: 'scale(1.05)',
                  },
                }}
              />
            ))}
          </Box>
          <Tooltip title="Program Settings">
            <IconButton
              size="small"
              onClick={() => setSettingsOpen(true)}
              sx={{ color: theme.palette.text.secondary, ml: 0.5 }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <ProgramSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        weekConfigs={weekConfigs}
        onWeekConfigsChange={onWeekConfigsChange}
        dayConfigs={dayConfigs}
        onDayConfigsChange={onDayConfigsChange}
        onAddDayWithWorkout={onAddDayWithWorkout}
      />

      <AddExerciseDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setExerciseToEdit(null);
        }}
        onAdd={() => {}}
        exerciseToEdit={exerciseToEdit}
        onEdit={handleEditSave}
      />

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
              onEdit={handleEditClick}
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
