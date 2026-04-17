import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  alpha,
  useTheme,
  Fab,
} from '@mui/material';
import { Add as AddIcon, DragIndicator as DragIcon } from '@mui/icons-material';
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
}: WorkoutViewProps) {
  const theme = useTheme();
  const weekData = getWeekInfo(currentWeek);
  
  // Sort exercises by position for consistent display
  const sortedExercises = [...workout.exercises].sort((a, b) => {
    const posA = a.position ?? 0;
    const posB = b.position ?? 0;
    return posA - posB;
  });
  
  // Drag state for reordering
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragStartY = useRef<number>(0);

  const handleDragStart = (index: number, event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    dragStartY.current = clientY;
    setDraggingIndex(index);
    
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleDragMove = (event: React.TouchEvent | React.MouseEvent) => {
    if (draggingIndex === null) return;
    
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    // Calculate which item we're hovering over based on position
    const container = document.getElementById('exercise-list-container');
    if (!container) return;
    
    const items = container.querySelectorAll('.exercise-item');
    let newDragOverIndex: number | null = null;
    
    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      if (clientY > rect.top && clientY < rect.bottom) {
        if (clientY < midY) {
          newDragOverIndex = index;
        } else {
          newDragOverIndex = index;
        }
      }
    });
    
    if (newDragOverIndex !== null && newDragOverIndex !== dragOverIndex) {
      setDragOverIndex(newDragOverIndex);
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleDragEnd = () => {
    if (draggingIndex !== null && dragOverIndex !== null && draggingIndex !== dragOverIndex) {
      onReorderExercises(workout.id, draggingIndex, dragOverIndex);
    }
    
    setDraggingIndex(null);
    setDragOverIndex(null);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  // Long press timer reference
  const longPressTimerRef = useRef<number | null>(null);
  const LONG_PRESS_DURATION = 500; // ms

  const startLongPress = (index: number, event: React.TouchEvent | React.MouseEvent) => {
    // Cancel any existing timer
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = window.setTimeout(() => {
      handleDragStart(index, event);
    }, LONG_PRESS_DURATION);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Touch move handler for while dragging
  const handleTouchMove = (event: React.TouchEvent) => {
    if (draggingIndex === null) return;
    
    // Cancel long press if still waiting
    cancelLongPress();
    
    handleDragMove(event);
  };

  // Touch end handler for while dragging
  const handleTouchEnd = () => {
    if (draggingIndex !== null) {
      handleDragEnd();
    } else {
      cancelLongPress();
    }
  };

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
      <Box id="exercise-list-container">
        {sortedExercises.map((exercise, index) => (
          <Box
            key={exercise.id}
            className="exercise-item"
            sx={{
              position: 'relative',
              mb: 2,
              transition: draggingIndex === index ? 'none' : 'all 0.3s ease',
              zIndex: draggingIndex === index ? 1000 : 'auto',
              transform: draggingIndex === index 
                ? `translateY(${dragOverIndex !== null ? (dragOverIndex - draggingIndex) * 10 : 0}px) scale(1.02)` 
                : dragOverIndex !== null && dragOverIndex > index && draggingIndex !== null
                  ? 'translateY(0)'
                  : 'none',
              opacity: draggingIndex === index ? 0.9 : 1,
              '&::before': dragOverIndex === index ? {
                content: '""',
                display: 'block',
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.palette.primary.main,
                mb: 2,
                animation: 'pulse 0.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.5 },
                  '50%': { opacity: 1 },
                },
              } : {},
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Drag Handle */}
              <Box
                onMouseDown={(e) => startLongPress(index, e)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={(e) => startLongPress(index, e)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  cursor: draggingIndex === index ? 'grabbing' : 'grab',
                  backgroundColor: draggingIndex === index 
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.text.primary, 0.05),
                  color: theme.palette.text.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <DragIcon fontSize="small" />
              </Box>
              
              {/* Exercise Card */}
              <Box sx={{ flex: 1 }}>
                <ExerciseCard
                  exercise={exercise}
                  adjustedWeight={getAdjustedWeight(exercise.id)}
                  baseWeight={userWeights[exercise.id] ?? 0}
                  onWeightChange={onWeightChange}
                  onDelete={() => onDeleteExercise(workout.id, exercise.id)}
                  rir={weekData.rir}
                />
              </Box>
            </Box>
          </Box>
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
