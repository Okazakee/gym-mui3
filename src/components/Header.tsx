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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  DeleteOutline as ResetIcon,
  FitnessCenterRounded as LogoIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useState, useRef } from 'react';
import type { WorkoutSession, UserWeights, WeekPhase } from '../types';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onResetData: () => void;
  onImportData: (backup: { version: number; data: { workouts: WorkoutSession[]; userWeights: UserWeights; settings: { currentWeek: WeekPhase; restDuration: number; weekSelectorVisible: boolean; darkMode: boolean } } }) => void;
  workouts: WorkoutSession[];
  userWeights: UserWeights;
  currentWeek: WeekPhase;
  restDuration: number;
  weekSelectorVisible: boolean;
}

export function Header({ 
  darkMode, 
  onToggleDarkMode, 
  onResetData,
  onImportData,
  workouts,
  userWeights,
  currentWeek,
  restDuration,
  weekSelectorVisible,
}: HeaderProps) {
  const theme = useTheme();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    onResetData();
    setResetDialogOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (!backup.version || !backup.data) {
          throw new Error('Invalid backup file');
        }
        onImportData(backup);
        setImportError(null);
      } catch (err) {
        setImportError('Invalid backup file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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
            <Tooltip title="Import backup">
              <IconButton
                onClick={handleImportClick}
                sx={{ color: theme.palette.text.primary }}
              >
                <UploadIcon />
              </IconButton>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
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

      <Snackbar
        open={!!importError}
        autoHideDuration={4000}
        onClose={() => setImportError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setImportError(null)}>
          {importError}
        </Alert>
      </Snackbar>
    </>
  );
}
