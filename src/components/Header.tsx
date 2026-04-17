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
  CloudSync as CloudIcon,
  SaveAlt as SaveAltIcon,
} from '@mui/icons-material';
import { useState, useRef } from 'react';
import type { WorkoutSession, UserWeights, WeekPhase } from '../types';
import { CloudSettingsModal } from './CloudSettingsModal';
import { LocalBackupModal } from './LocalBackupModal';
import { ImportPreviewModal } from './ImportPreviewModal';

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
  cloudConnected: boolean;
  cloudLastSync: string | null;
  onCloudConnect: (token: string) => Promise<boolean>;
  onCloudDisconnect: () => void;
  onCloudSyncNow: () => void;
  hasPendingSync?: boolean;
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
  cloudConnected,
  cloudLastSync,
  onCloudConnect,
  onCloudDisconnect,
  onCloudSyncNow,
  hasPendingSync = false,
}: HeaderProps) {
  const theme = useTheme();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [localBackupModalOpen, setLocalBackupModalOpen] = useState(false);
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ version: number; exportedAt: string; data: any } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    onResetData();
    setResetDialogOpen(false);
  };

  const handleExportFromModal = () => {
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
    setLocalBackupModalOpen(false);
  };

  const handleImportFromModal = () => {
    fileInputRef.current?.click();
  };

  const handleLocalImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (!backup.version || !backup.data) {
          throw new Error('Invalid backup file');
        }
        setPendingImport(backup);
        setImportPreviewOpen(true);
        setLocalBackupModalOpen(false);
        setImportError(null);
      } catch (err) {
        setImportError('Invalid backup file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmImport = () => {
    if (pendingImport) {
      onImportData(pendingImport);
    }
    setImportPreviewOpen(false);
    setPendingImport(null);
  };

  const handleCancelImport = () => {
    setImportPreviewOpen(false);
    setPendingImport(null);
  };

  const currentBackupData = {
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
            <Tooltip title={hasPendingSync ? "Syncing..." : "Cloud backup"}>
              <IconButton
                onClick={() => setCloudModalOpen(true)}
                sx={{ 
                  color: !cloudConnected 
                    ? theme.palette.text.primary
                    : hasPendingSync 
                      ? theme.palette.warning.main
                      : theme.palette.success.main
                }}
              >
                <CloudIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Local backup">
              <IconButton
                onClick={() => setLocalBackupModalOpen(true)}
                sx={{ color: theme.palette.text.primary }}
              >
                <SaveAltIcon />
              </IconButton>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleLocalImport}
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

      <CloudSettingsModal
        open={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
        isConnected={cloudConnected}
        lastSync={cloudLastSync}
        onConnect={onCloudConnect}
        onDisconnect={onCloudDisconnect}
        onSyncNow={onCloudSyncNow}
      />

      <LocalBackupModal
        open={localBackupModalOpen}
        onClose={() => setLocalBackupModalOpen(false)}
        onExport={handleExportFromModal}
        onImport={handleImportFromModal}
      />

      {pendingImport && (
        <ImportPreviewModal
          open={importPreviewOpen}
          onClose={handleCancelImport}
          onConfirm={handleConfirmImport}
          currentData={currentBackupData}
          importedData={pendingImport}
        />
      )}
    </>
  );
}
