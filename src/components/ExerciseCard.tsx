import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  alpha,
  useTheme,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  FitnessCenterRounded as WeightIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
} from '@mui/icons-material';
import type { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  adjustedWeight: number;
  baseWeight: number;
  onWeightChange: (exerciseId: string, newWeight: number) => void;
  onDelete: () => void;
  onEdit: (exercise: Exercise) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export function ExerciseCard({
  exercise,
  adjustedWeight,
  baseWeight,
  onWeightChange,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: ExerciseCardProps) {
  const theme = useTheme();
  const [editingWeight, setEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(baseWeight.toString());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleWeightAdjust = (delta: number) => {
    const step = baseWeight >= 20 ? 2.5 : 1;
    onWeightChange(exercise.id, baseWeight + delta * step);
  };

  const handleWeightSubmit = () => {
    const newWeight = parseFloat(tempWeight);
    if (!isNaN(newWeight) && newWeight >= 0) {
      onWeightChange(exercise.id, newWeight);
    }
    setEditingWeight(false);
  };

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.3s ease',
        '&:active': {
          transform: 'scale(0.98)',
        },
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1,
                lineHeight: 1.2,
              }}
            >
              {exercise.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={exercise.muscleGroup}
                size="small"
                sx={{
                  fontSize: '0.8rem',
                  height: 28,
                  fontWeight: 500,
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                }}
              />
              {Array.from({ length: exercise.sets }).map((_, i) => (
                <Chip
                  key={i}
                  label={exercise.reps}
                  size="small"
                  sx={{
                    fontSize: '0.8rem',
                    height: 28,
                    fontWeight: 600,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.12),
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.secondary.main 
                      : theme.palette.secondary.dark,
                  }}
                />
              ))}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => onEdit(exercise)}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        {exercise.notes && (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1.5 }}>
            💡 {exercise.notes}
          </Typography>
        )}

        {/* Weight Control */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 2,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <IconButton
            onClick={() => handleWeightAdjust(-1)}
            sx={{
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.2),
              },
            }}
          >
            <RemoveIcon />
          </IconButton>

          {editingWeight ? (
            <TextField
              value={tempWeight}
              onChange={(e) => setTempWeight(e.target.value)}
              onBlur={handleWeightSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleWeightSubmit()}
              autoFocus
              type="number"
              size="small"
              sx={{
                width: 100,
                '& input': {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                },
              }}
            />
          ) : (
            <Box
              onClick={() => {
                setTempWeight(baseWeight.toString());
                setEditingWeight(true);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
            >
              <WeightIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  minWidth: 80,
                  textAlign: 'center',
                }}
              >
                {adjustedWeight}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
              >
                kg
              </Typography>
            </Box>
          )}

          <IconButton
            onClick={() => handleWeightAdjust(1)}
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.success.main, 0.2),
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>

        {/* Bottom Actions */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
          <IconButton
            size="small"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              opacity: canMoveUp ? 1 : 0.3,
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
            }}
          >
            <UpIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              opacity: canMoveDown ? 1 : 0.3,
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
            }}
          >
            <DownIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setDeleteDialogOpen(true)}
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            Delete Exercise?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{exercise.name}"? This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onDelete();
                setDeleteDialogOpen(false);
              }}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
