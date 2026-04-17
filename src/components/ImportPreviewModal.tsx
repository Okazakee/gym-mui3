import { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';

interface BackupData {
  version: number;
  exportedAt: string;
  data: {
    workouts: any[];
    userWeights: Record<string, number>;
    settings: {
      currentWeek: number;
      restDuration: number;
      weekSelectorVisible: boolean;
      darkMode: boolean;
    };
  };
}

interface ImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentData: BackupData | null;
  importedData: BackupData;
}

interface ChangeSummary {
  workouts: { name: string; added: number; removed: number; modified: number }[];
  settings: { key: string; from: string; to: string }[];
  totalChanges: number;
}

function detectChanges(current: BackupData | null, imported: BackupData): ChangeSummary {
  const changes: ChangeSummary = {
    workouts: [],
    settings: [],
    totalChanges: 0,
  };

  if (!current) {
    changes.workouts.push({ name: 'All workouts', added: imported.data.workouts.length, removed: 0, modified: 0 });
    changes.totalChanges = imported.data.workouts.length;
    return changes;
  }

  const currentWorkouts = current.data.workouts;
  const importedWorkouts = imported.data.workouts;

  const currentIds = new Set(currentWorkouts.map((w: any) => w.id));
  const importedIds = new Set(importedWorkouts.map((w: any) => w.id));

  for (const workout of importedWorkouts) {
    if (!currentIds.has(workout.id)) {
      changes.workouts.push({ name: workout.name, added: workout.exercises?.length || 0, removed: 0, modified: 0 });
    }
  }

  for (const workout of currentWorkouts) {
    if (!importedIds.has(workout.id)) {
      changes.workouts.push({ name: workout.name, added: 0, removed: workout.exercises?.length || 0, modified: 0 });
    }
  }

  for (const workout of importedWorkouts) {
    const currentWorkout = currentWorkouts.find((w: any) => w.id === workout.id);
    if (currentWorkout) {
      const currentExercises = new Set(currentWorkout.exercises?.map((e: any) => e.id) || []);
      const importedExercises = new Set(workout.exercises?.map((e: any) => e.id) || []);
      
      let added = 0, removed = 0;
      for (const id of importedExercises) {
        if (!currentExercises.has(id)) added++;
      }
      for (const id of currentExercises) {
        if (!importedExercises.has(id)) removed++;
      }
      
      if (added > 0 || removed > 0) {
        changes.workouts.push({ name: workout.name, added, removed, modified: 0 });
      }
    }
  }

  const currentSettings = current.data.settings;
  const importedSettings = imported.data.settings;

  if (currentSettings.currentWeek !== importedSettings.currentWeek) {
    changes.settings.push({ key: 'Current Week', from: String(currentSettings.currentWeek), to: String(importedSettings.currentWeek) });
  }
  if (currentSettings.restDuration !== importedSettings.restDuration) {
    changes.settings.push({ key: 'Rest Duration', from: `${currentSettings.restDuration}s`, to: `${importedSettings.restDuration}s` });
  }
  if (currentSettings.darkMode !== importedSettings.darkMode) {
    changes.settings.push({ key: 'Dark Mode', from: currentSettings.darkMode ? 'On' : 'Off', to: importedSettings.darkMode ? 'On' : 'Off' });
  }

  changes.totalChanges = changes.workouts.reduce((sum, w) => sum + w.added + w.removed, 0) + changes.settings.length;

  return changes;
}

export function ImportPreviewModal({
  open,
  onClose,
  onConfirm,
  currentData,
  importedData,
}: ImportPreviewModalProps) {
  const theme = useTheme();

  const changes = useMemo(() => detectChanges(currentData, importedData), [currentData, importedData]);

  const MAX_WORKOUTS = 3;
  const displayWorkouts = changes.workouts.slice(0, MAX_WORKOUTS);
  const extraWorkouts = changes.workouts.length - MAX_WORKOUTS;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 4, width: 450, maxHeight: 500 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Import Preview
      </DialogTitle>

      <DialogContent sx={{ overflow: 'auto' }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
          {changes.totalChanges === 0 
            ? 'No changes detected. The backup is identical to your current data.'
            : `Found ${changes.totalChanges} change${changes.totalChanges > 1 ? 's' : ''}. Review before applying.`}
        </Typography>

        {changes.workouts.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Workouts
            </Typography>
            {displayWorkouts.map((w, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {w.name}
                </Typography>
                {w.added > 0 && <Chip size="small" label={`+${w.added} added`} sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, height: 20, fontSize: '0.7rem' }} />}
                {w.removed > 0 && <Chip size="small" label={`${w.removed} removed`} sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, height: 20, fontSize: '0.7rem' }} />}
              </Box>
            ))}
            {extraWorkouts > 0 && (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                +{extraWorkouts} more workout{extraWorkouts > 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        )}

        {changes.settings.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Settings
            </Typography>
            {changes.settings.map((s, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {s.key}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {s.from} → {s.to}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={changes.totalChanges === 0}
        >
          Apply Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}