import { BottomNavigation, BottomNavigationAction, Paper, alpha, useTheme } from '@mui/material';
import {
  FitnessCenter as PushIcon,
  SwapHoriz as PullIcon,
  DirectionsWalk as LegsIcon,
  Replay as RecallIcon,
} from '@mui/icons-material';
import type { WorkoutDay } from '../types';

interface NavigationProps {
  currentDay: WorkoutDay;
  onDayChange: (day: WorkoutDay) => void;
}

const navItems: { id: WorkoutDay; label: string; icon: React.ReactNode }[] = [
  { id: 'push', label: 'Push', icon: <PushIcon /> },
  { id: 'pull', label: 'Pull', icon: <PullIcon /> },
  { id: 'legs', label: 'Legs', icon: <LegsIcon /> },
  { id: 'recall', label: 'Recall', icon: <RecallIcon /> },
];

export function Navigation({ currentDay, onDayChange }: NavigationProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: 0,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
      elevation={0}
    >
      <BottomNavigation
        value={currentDay}
        onChange={(_, newValue) => onDayChange(newValue)}
        showLabels
        sx={{
          height: 70,
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '8px 12px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.1)',
              },
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            marginTop: '4px',
            fontWeight: 500,
            '&.Mui-selected': {
              fontSize: '0.75rem',
              fontWeight: 600,
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.id}
            value={item.id}
            label={item.label}
            icon={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor:
                    currentDay === item.id
                      ? alpha(theme.palette.primary.main, 0.15)
                      : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.icon}
              </div>
            }
            sx={{
              color:
                currentDay === item.id
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

