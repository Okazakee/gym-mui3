import { useState, useEffect } from 'react';
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
  exerciseToEdit?: Exercise | null;
  onEdit?: (exercise: Exercise) => void;
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

const defaultValues = {
  name: '',
  muscleGroup: 'Chest',
  sets: '2',
  reps: '10',
  notes: '',
};

export function AddExerciseDialog({ open, onClose, onAdd, exerciseToEdit, onEdit }: AddExerciseDialogProps) {
  const isEditing = !!exerciseToEdit;

  const [name, setName] = useState(defaultValues.name);
  const [muscleGroup, setMuscleGroup] = useState(defaultValues.muscleGroup);
  const [sets, setSets] = useState(defaultValues.sets);
  const [reps, setReps] = useState(defaultValues.reps);
  const [notes, setNotes] = useState(defaultValues.notes);

  // Sync form state when exerciseToEdit changes or dialog opens
  useEffect(() => {
    if (open) {
       
      if (isEditing && exerciseToEdit) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setName(exerciseToEdit.name);
         
        setMuscleGroup(exerciseToEdit.muscleGroup);
         
        setSets(exerciseToEdit.sets.toString());
         
        setReps(exerciseToEdit.reps);
         
        setNotes(exerciseToEdit.notes || '');
      } else {
        setName(defaultValues.name);
        setMuscleGroup(defaultValues.muscleGroup);
        setSets(defaultValues.sets);
        setReps(defaultValues.reps);
        setNotes(defaultValues.notes);
      }
    }
  }, [open, isEditing, exerciseToEdit]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (isEditing && exerciseToEdit && onEdit) {
      const editedExercise: Exercise = {
        ...exerciseToEdit,
        name: name.trim(),
        muscleGroup,
        sets: parseInt(sets) || 2,
        reps: reps || '10',
        notes: notes.trim() || undefined,
      };
      onEdit(editedExercise);
      onClose();
      return;
    }

    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      muscleGroup,
      sets: parseInt(sets) || 2,
      reps: reps || '10',
      baseWeight: 0,
      notes: notes.trim() || undefined,
    };

    onAdd(newExercise, -1);
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
      <DialogTitle sx={{ fontWeight: 600 }}>{isEditing ? 'Edit Exercise' : 'Add Exercise'}</DialogTitle>
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
          {isEditing ? 'Save Changes' : 'Add Exercise'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
