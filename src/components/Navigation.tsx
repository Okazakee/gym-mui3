import { BottomNavigation, BottomNavigationAction, Paper, alpha, useTheme } from '@mui/material';
import {
  FitnessCenter as PushIcon,
  SwapHoriz as PullIcon,
  DirectionsWalk as LegsIcon,
  Replay as RecallIcon,
  Timer as TimerIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Settings as GearIcon,
} from '@mui/icons-material';
import type { WorkoutDay, DayConfig } from '../types';

interface NavigationProps {
  currentDay: WorkoutDay;
  onDayChange: (day: WorkoutDay) => void;
  dayConfigs: DayConfig[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FitnessCenter: PushIcon,
  SwapHoriz: PullIcon,
  DirectionsWalk: LegsIcon,
  Replay: RecallIcon,
  Timer: TimerIcon,
  Favorite: FavoriteIcon,
  Star: StarIcon,
  Settings: GearIcon,
};

export function Navigation({ currentDay, onDayChange, dayConfigs }: NavigationProps) {
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
          height: 64,
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '4px 6px',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.05)',
              },
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            marginTop: '2px',
            fontWeight: 500,
            '&.Mui-selected': {
              fontSize: '0.7rem',
              fontWeight: 600,
            },
          },
        }}
      >
        {dayConfigs.map((day) => {
          const IconComponent = ICON_MAP[day.icon] || PushIcon;
          return (
            <BottomNavigationAction
              key={day.id}
              value={day.id}
              label={day.name}
              icon={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor:
                      currentDay === day.id
                        ? alpha(theme.palette.primary.main, 0.15)
                        : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconComponent />
                </div>
              }
              sx={{
                color:
                  currentDay === day.id
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
              }}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}