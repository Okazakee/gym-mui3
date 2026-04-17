import { 
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import { ErrorOutline as ErrorIcon, Close as CloseIcon } from '@mui/icons-material';

interface SyncErrorModalProps {
  open: boolean;
  onClose: () => void;
}

export function SyncErrorModal({ open, onClose }: SyncErrorModalProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, minWidth: 300 },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <ErrorIcon sx={{ fontSize: 32, color: theme.palette.warning.main }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Cloud Sync Failed
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Unable to sync to GitHub. Please check your internet connection and try again later.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}