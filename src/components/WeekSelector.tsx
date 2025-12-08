import { Box, Chip, Typography, alpha, useTheme, Collapse } from '@mui/material';
import { ExpandMore as ExpandIcon } from '@mui/icons-material';
import type { WeekPhase } from '../types';
import { weekInfo } from '../data/workouts';

interface WeekSelectorProps {
  currentWeek: WeekPhase;
  onWeekChange: (week: WeekPhase) => void;
  visible: boolean;
  onToggleVisibility: () => void;
}

export function WeekSelector({ currentWeek, onWeekChange, visible, onToggleVisibility }: WeekSelectorProps) {
  const theme = useTheme();
  const current = weekInfo.find((w) => w.week === currentWeek)!;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Toggle Button */}
      <Box
        onClick={onToggleVisibility}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          py: 1,
          cursor: 'pointer',
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          mb: visible ? 2 : 0,
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
          {visible ? 'Hide' : 'Show'} Week Program
        </Typography>
        <ExpandIcon
          sx={{
            fontSize: 20,
            color: theme.palette.text.secondary,
            transform: visible ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s',
          }}
        />
      </Box>

      <Collapse in={visible}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            justifyContent: 'center',
          }}
        >
          {weekInfo.map((week) => (
            <Chip
              key={week.week}
              label={`W${week.week}`}
              onClick={() => onWeekChange(week.week)}
              sx={{
                px: 1,
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                backgroundColor:
                  currentWeek === week.week
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.1),
                color:
                  currentWeek === week.week
                    ? theme.palette.primary.contrastText
                    : theme.palette.primary.main,
                '&:hover': {
                  backgroundColor:
                    currentWeek === week.week
                      ? theme.palette.primary.dark
                      : alpha(theme.palette.primary.main, 0.2),
                  transform: 'scale(1.05)',
                },
              }}
            />
          ))}
        </Box>
        
        <Box
          sx={{
            textAlign: 'center',
            p: 2,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
              mb: 0.5,
            }}
          >
            {current.name} Phase
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, mb: 1 }}
          >
            {current.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Chip
              size="small"
              label={`RIR ${current.rir}`}
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.15),
                color: theme.palette.success.main,
                fontWeight: 500,
              }}
            />
            <Chip
              size="small"
              label={
                current.loadModifier === 1
                  ? 'Base Load'
                  : current.loadModifier > 1
                  ? `+${Math.round((current.loadModifier - 1) * 100)}% Load`
                  : `${Math.round((current.loadModifier - 1) * 100)}% Load`
              }
              sx={{
                backgroundColor: alpha(theme.palette.secondary.main, 0.15),
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.secondary.main 
                  : theme.palette.secondary.dark,
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
