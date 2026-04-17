import { useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';

import { lightTheme, darkTheme } from './theme';
import { useWorkoutState } from './hooks/useWorkoutState';
import type { WorkoutDay, Exercise } from './types';

import { Header } from './components/Header';
import { WeekSelector } from './components/WeekSelector';
import { WorkoutView } from './components/WorkoutView';
import { Navigation } from './components/Navigation';
import { AddExerciseDialog } from './components/AddExerciseDialog';
import { RestTimer } from './components/RestTimer';

function App() {
  const {
    currentWeek,
    setCurrentWeek,
    userWeights,
    updateWeight,
    getAdjustedWeight,
    darkMode,
    setDarkMode,
    resetAll,
    workouts,
    addExercise,
    deleteExercise,
    reorderExercises,
    weekSelectorVisible,
    setWeekSelectorVisible,
    restDuration,
    setRestDuration,
  } = useWorkoutState();

  const [currentDay, setCurrentDay] = useState<WorkoutDay>('push');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const currentWorkout = useMemo(
    () => workouts.find((w) => w.id === currentDay)!,
    [workouts, currentDay]
  );

  const handleAddExercise = (exercise: Exercise, position: number) => {
    addExercise(currentDay, exercise, position);
  };

  const handleDeleteExercise = (workoutId: string, exerciseId: string) => {
    deleteExercise(workoutId as WorkoutDay, exerciseId);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onResetData={resetAll}
          workouts={workouts}
          userWeights={userWeights}
          currentWeek={currentWeek}
          restDuration={restDuration}
          weekSelectorVisible={weekSelectorVisible}
        />

        <Container
          maxWidth="sm"
          sx={{
            flex: 1,
            px: 2,
            py: 3,
          }}
        >
          <WeekSelector
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
            visible={weekSelectorVisible}
            onToggleVisibility={() => setWeekSelectorVisible(!weekSelectorVisible)}
          />

          <WorkoutView
            workout={currentWorkout}
            currentWeek={currentWeek}
            userWeights={userWeights}
            getAdjustedWeight={getAdjustedWeight}
            onWeightChange={updateWeight}
            onDeleteExercise={handleDeleteExercise}
            onAddExercise={() => setAddDialogOpen(true)}
            onReorderExercises={reorderExercises}
          />
        </Container>

        <Navigation currentDay={currentDay} onDayChange={setCurrentDay} />

        <RestTimer
          defaultDuration={restDuration}
          onDurationChange={setRestDuration}
        />

        <AddExerciseDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onAdd={handleAddExercise}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
