import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';

interface LocalBackupModalProps {
  open: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function LocalBackupModal({ open, onClose, onExport, onImport }: LocalBackupModalProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 4, width: 400 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Local Backup
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
          Export your workout data to a JSON file or import from a previously saved backup.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            sx={{ flex: 1, py: 1.5 }}
          >
            Export Backup
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={onImport}
            sx={{ flex: 1, py: 1.5 }}
          >
            Import Backup
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}