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
  Collapse,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  FitnessCenterRounded as WeightIcon,
  ExpandMore as ExpandIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import type { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  adjustedWeight: number;
  baseWeight: number;
  onWeightChange: (exerciseId: string, newWeight: number) => void;
  onDelete: () => void;
  rir: number;
}

export function ExerciseCard({
  exercise,
  adjustedWeight,
  baseWeight,
  onWeightChange,
  onDelete,
  rir,
}: ExerciseCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(baseWeight.toString());

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
              {/* Set pills */}
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
              <Chip
                label={`RIR ${rir}`}
                size="small"
                sx={{
                  fontSize: '0.8rem',
                  height: 28,
                  fontWeight: 500,
                  backgroundColor: alpha(theme.palette.warning.main, 0.12),
                  color: theme.palette.warning.dark,
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandIcon />
            </IconButton>
          </Box>
        </Box>

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
              <EditIcon
                sx={{
                  fontSize: 18,
                  color: theme.palette.text.disabled,
                  ml: 0.5,
                }}
              />
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

        {/* Expandable Notes & Delete */}
        <Collapse in={expanded}>
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            {exercise.notes && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                💡 {exercise.notes}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{ display: 'block', color: theme.palette.text.disabled, mb: 2 }}
            >
              Base weight: {baseWeight}kg • Adjusted: {adjustedWeight}kg
            </Typography>
            <IconButton
              onClick={onDelete}
              sx={{
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.2),
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
