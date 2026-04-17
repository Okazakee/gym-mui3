import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  DeleteOutline as ResetIcon,
  FitnessCenterRounded as LogoIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import type { WorkoutSession, UserWeights } from '../types';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onResetData: () => void;
  workouts: WorkoutSession[];
  userWeights: UserWeights;
  currentWeek: number;
  restDuration: number;
  weekSelectorVisible: boolean;
}

export function Header({ 
  darkMode, 
  onToggleDarkMode, 
  onResetData,
  workouts,
  userWeights,
  currentWeek,
  restDuration,
  weekSelectorVisible,
}: HeaderProps) {
  const theme = useTheme();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleReset = () => {
    onResetData();
    setResetDialogOpen(false);
  };

  const handleExportBackup = () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        workouts,
        userWeights,
        settings: {
          currentWeek,
          restDuration,
          weekSelectorVisible,
          darkMode,
        },
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gymtracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: alpha(theme.palette.background.default, 0.85),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            >
              <LogoIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  lineHeight: 1.2,
                }}
              >
                GymTracker
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Export backup">
              <IconButton
                onClick={handleExportBackup}
                sx={{ color: theme.palette.text.primary }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={onToggleDarkMode}
              sx={{ color: theme.palette.text.primary }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton
              onClick={() => setResetDialogOpen(true)}
              sx={{ color: theme.palette.error.main }}
            >
              <ResetIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 4, maxWidth: 360 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Reset All Data?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will reset all your custom exercises, saved weights, and settings back to defaults. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setResetDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleReset} 
            variant="contained" 
            color="error"
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
