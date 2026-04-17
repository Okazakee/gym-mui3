import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  alpha,
  useTheme,
  Alert,
} from '@mui/material';
import { CloudSync as CloudIcon, OpenInNew as LinkIcon } from '@mui/icons-material';

interface CloudSettingsModalProps {
  open: boolean;
  onClose: () => void;
  isConnected: boolean;
  lastSync: string | null;
  onConnect: (token: string) => Promise<boolean>;
  onDisconnect: () => void;
  onSyncNow: () => void;
  showImportDialog?: boolean;
  onReplaceWithCloud?: () => void;
  onKeepLocal?: () => void;
}

export function CloudSettingsModal({
  open,
  onClose,
  isConnected,
  lastSync,
  onConnect,
  onDisconnect,
  onSyncNow,
  showImportDialog,
  onReplaceWithCloud,
  onKeepLocal,
}: CloudSettingsModalProps) {
  const theme = useTheme();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    setLoading(true);
    setError(null);

    const success = await onConnect(token);

    if (success) {
      setToken('');
      onClose();
    } else {
      setError('Invalid token. Please check and try again.');
    }

    setLoading(false);
  };

  const handleDisconnect = () => {
    onDisconnect();
    onClose();
  };

  const formatLastSync = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 4, width: 400 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CloudIcon color="primary" />
        Cloud Backup
      </DialogTitle>

      <DialogContent>
        {showImportDialog ? (
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              A cloud backup was found. What would you like to do?
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              This will replace your current local data with the cloud backup.
            </Alert>
          </Box>
        ) : !isConnected ? (
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              Sync your workout data to a private GitHub Gist. Enter your GitHub Personal Access Token to get started.
            </Typography>

            <TextField
              fullWidth
              label="GitHub Personal Access Token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              sx={{ mb: 1 }}
            />

            <Button
              variant="text"
              size="small"
              endIcon={<LinkIcon fontSize="small" />}
              onClick={() => window.open('https://github.com/settings/personal-access-tokens/new', '_blank')}
              sx={{ mb: 2 }}
            >
              Generate token on GitHub
            </Button>

            <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.disabled }}>
              Required scopes: <strong>gist</strong>
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>
                ✓ Connected to GitHub
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Last synced: {formatLastSync(lastSync)}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              Your data is automatically synced to a private Gist. Changes will appear in the cloud within a few seconds.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {showImportDialog ? (
          <>
            <Button onClick={onKeepLocal} color="inherit">
              Keep Local
            </Button>
            <Button onClick={onReplaceWithCloud} variant="contained" color="primary">
              Replace with Cloud
            </Button>
          </>
        ) : !isConnected ? (
          <>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              variant="contained"
              disabled={loading || !token.trim()}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleDisconnect} color="error">
              Disconnect
            </Button>
            <Button onClick={onSyncNow} variant="outlined">
              Sync Now
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}