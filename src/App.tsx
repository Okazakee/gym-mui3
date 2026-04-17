import { useMemo, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';

import { lightTheme, darkTheme } from './theme';
import { useWorkoutState } from './hooks/useWorkoutState';
import { useCloudSync } from './hooks/useCloudSync';
import type { WorkoutDay, Exercise, WorkoutSession, UserWeights, WeekPhase, WeekConfig, DayConfig } from './types';

import { Header } from './components/Header';
import { WorkoutView } from './components/WorkoutView';
import { Navigation } from './components/Navigation';
import { AddExerciseDialog } from './components/AddExerciseDialog';
import { RestTimer } from './components/RestTimer';
import { SyncErrorModal } from './components/SyncErrorModal';

function App() {
  const [cloudImportData, setCloudImportData] = useState<{
    version: number;
    exportedAt: string;
    data: {
      workouts: WorkoutSession[];
      userWeights: UserWeights;
      settings: { currentWeek: WeekPhase; currentDay?: WorkoutDay; restDuration: number; darkMode: boolean };
      weekConfigs?: WeekConfig[];
      dayConfigs?: DayConfig[];
    };
  } | null>(null);

  const {
    currentWeek,
    setCurrentWeek,
    currentDay,
    setCurrentDay,
    userWeights,
    updateWeight,
    getAdjustedWeight,
    darkMode,
    setDarkMode,
    resetAll,
    importData,
    workouts,
    addWorkout,
    addExercise,
    editExercise,
    deleteExercise,
    reorderExercises,
    restDuration,
    setRestDuration,
    weekConfigs,
    setWeekConfigs,
    dayConfigs,
    setDayConfigs,
  } = useWorkoutState();

const {
    isConnected: cloudConnected,
    lastSync: cloudLastSync,
    sync: cloudSync,
    disconnect: cloudDisconnect,
    triggerSyncNow: cloudSyncNow,
    syncFailed,
    clearSyncFailed,
    hasPendingSync,
    connect,
  } = useCloudSync();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);

  const backupData = useMemo(() => ({
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      workouts,
      userWeights,
      weekConfigs,
      dayConfigs,
      settings: {
        currentWeek,
        currentDay,
        restDuration,
        darkMode,
      },
    },
  }), [workouts, userWeights, currentWeek, currentDay, restDuration, darkMode, weekConfigs, dayConfigs]);

  const handleCloudConnect = async (token: string): Promise<boolean> => {
    const result = await connect(token, backupData);
    if (result.conflict && result.cloudData) {
      setCloudImportData(result.cloudData);
      return false;
    }
    return true;
  };

  const handleKeepLocal = () => {
    setCloudImportData(null);
  };

  const handleReplaceWithCloud = () => {
    if (cloudImportData) {
      importData(cloudImportData);
      setCloudImportData(null);
    }
  };

  useEffect(() => {
    if (cloudConnected) {
      cloudSync(backupData);
    }
  }, [backupData, cloudConnected, cloudSync]);

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const currentWorkout = useMemo(
    () => workouts.find((w) => w.id === currentDay) || workouts[0] || { id: 'push', name: 'Push', description: '', exercises: [] },
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
          onImportData={importData}
          workouts={workouts}
          userWeights={userWeights}
          currentWeek={currentWeek}
          currentDay={currentDay}
          weekConfigs={weekConfigs}
          dayConfigs={dayConfigs}
          restDuration={restDuration}
          cloudConnected={cloudConnected}
          cloudLastSync={cloudLastSync}
          onCloudConnect={handleCloudConnect}
          onCloudDisconnect={cloudDisconnect}
          onCloudSyncNow={() => cloudSyncNow(backupData)}
          hasPendingSync={hasPendingSync}
          cloudImportData={cloudImportData}
          onKeepLocal={handleKeepLocal}
          onReplaceWithCloud={handleReplaceWithCloud}
        />

        <Container
          maxWidth="sm"
          disableGutters
          sx={{
            flex: 1,
          }}
        >
          <Box sx={{ px: 2, py: 3 }}>
            <WorkoutView
              workout={currentWorkout}
              currentWeek={currentWeek}
              weekConfigs={weekConfigs}
              onWeekChange={setCurrentWeek}
              onWeekConfigsChange={setWeekConfigs}
              dayConfigs={dayConfigs}
              onDayConfigsChange={setDayConfigs}
              onAddDayWithWorkout={(_day, workout) => addWorkout(workout)}
              userWeights={userWeights}
              getAdjustedWeight={getAdjustedWeight}
              onWeightChange={updateWeight}
              onDeleteExercise={handleDeleteExercise}
              onEditExercise={editExercise}
              onAddExercise={() => setAddDialogOpen(true)}
              onReorderExercises={reorderExercises}
              timerOpen={timerOpen}
              weekName={weekConfigs.find(w => w.id === currentWeek)?.name || 'Week 1'}
            />
          </Box>
        </Container>

        <Navigation 
            currentDay={currentDay} 
            onDayChange={setCurrentDay}
            dayConfigs={dayConfigs}
          />

        <RestTimer
          defaultDuration={restDuration}
          onDurationChange={setRestDuration}
          onOpenChange={setTimerOpen}
        />

        <SyncErrorModal
          open={syncFailed}
          onClose={clearSyncFailed}
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
