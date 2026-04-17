import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
} from '@mui/material';
import type { Exercise } from '../types';

interface AddExerciseDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (exercise: Exercise, position: number) => void;
}

const muscleGroups = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Quads',
  'Hamstrings',
  'Calves',
  'Core',
  'Full Body',
];

export function AddExerciseDialog({ open, onClose, onAdd }: AddExerciseDialogProps) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [sets, setSets] = useState('2');
  const [reps, setReps] = useState('10');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;

    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      muscleGroup,
      sets: parseInt(sets) || 2,
      reps: reps || '10',
      baseWeight: 0,
      notes: notes.trim() || undefined,
    };

    // Position will be set by the parent (at the end of the list)
    onAdd(newExercise, -1);
    
    // Reset form
    setName('');
    setMuscleGroup('Chest');
    setSets('2');
    setReps('10');
    setNotes('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 4 }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Add Exercise</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Exercise Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            placeholder="e.g., Bench Press"
          />
          <TextField
            select
            label="Muscle Group"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            fullWidth
          >
            {muscleGroups.map((group) => (
              <MenuItem key={group} value={group}>
                {group}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Sets"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              type="number"
              inputProps={{ min: 1, max: 10 }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="e.g., 8-10"
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Any tips or reminders..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!name.trim()}
        >
          Add Exercise
        </Button>
      </DialogActions>
    </Dialog>
  );
}

