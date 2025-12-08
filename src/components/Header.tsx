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
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  DeleteOutline as ResetIcon,
  FitnessCenterRounded as LogoIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onResetData: () => void;
}

export function Header({ darkMode, onToggleDarkMode, onResetData }: HeaderProps) {
  const theme = useTheme();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleReset = () => {
    onResetData();
    setResetDialogOpen(false);
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
