import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Card,
  Grid,
} from '@mui/material';
import { Settings as SettingsIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
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
import type { WeekConfig, DayConfig, WorkoutSession } from '../types';

interface ProgramSettingsModalProps {
  open: boolean;
  onClose: () => void;
  weekConfigs: WeekConfig[];
  onWeekConfigsChange: (configs: WeekConfig[]) => void;
  dayConfigs: DayConfig[];
  onDayConfigsChange: (configs: DayConfig[]) => void;
  onAddDayWithWorkout?: (day: DayConfig, workout: WorkoutSession) => void;
}

const ICON_OPTIONS = [
  { name: 'FitnessCenter', icon: PushIcon },
  { name: 'SwapHoriz', icon: PullIcon },
  { name: 'DirectionsWalk', icon: LegsIcon },
  { name: 'Replay', icon: RecallIcon },
  { name: 'Timer', icon: TimerIcon },
  { name: 'Favorite', icon: FavoriteIcon },
  { name: 'Star', icon: StarIcon },
  { name: 'Settings', icon: GearIcon },
];

export function ProgramSettingsModal({
  open,
  onClose,
  weekConfigs,
  onWeekConfigsChange,
  dayConfigs,
  onDayConfigsChange,
  onAddDayWithWorkout,
}: ProgramSettingsModalProps) {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [localWeeks, setLocalWeeks] = useState<WeekConfig[]>(weekConfigs);
  const [localDays, setLocalDays] = useState<DayConfig[]>(dayConfigs);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'week' | 'day'; id: number | string } | null>(null);

  const handleWeekChange = (id: number, field: keyof WeekConfig, value: string | number) => {
    setLocalWeeks(prev => prev.map(w => 
      w.id === id ? { ...w, [field]: value } : w
    ));
  };

  const handleDayChange = (id: string, field: keyof DayConfig, value: string) => {
    setLocalDays(prev => prev.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const handleAddWeek = () => {
    if (localWeeks.length >= 4) return;
    const newId = Math.max(...localWeeks.map(w => w.id), 0) + 1;
    setLocalWeeks(prev => [...prev, { id: newId, name: `Week ${newId}`, loadModifier: 1.0, rir: 2 }]);
  };

  const handleAddDay = () => {
    const newId = `day-${Date.now()}`;
    const newDay: DayConfig = { id: newId, name: `Day ${localDays.length + 1}`, icon: 'FitnessCenter' };
    const newWorkout: WorkoutSession = { id: newId, name: `Day ${localDays.length + 1}`, description: '', exercises: [] };
    
    setLocalDays(prev => [...prev, newDay]);
    if (onAddDayWithWorkout) {
      onAddDayWithWorkout(newDay, newWorkout);
    }
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'week') {
      if (localWeeks.length <= 1) {
        setDeleteConfirm(null);
        return;
      }
      setLocalWeeks(prev => prev.filter(w => w.id !== deleteConfirm.id));
    } else {
      if (localDays.length <= 1) {
        setDeleteConfirm(null);
        return;
      }
      setLocalDays(prev => prev.filter(d => d.id !== deleteConfirm.id));
    }
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    onWeekConfigsChange(localWeeks);
    onDayConfigsChange(localDays);
    onClose();
  };

  const getIconComponent = (iconName: string) => {
    const found = ICON_OPTIONS.find(i => i.name === iconName);
    return found ? found.icon : PushIcon;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, pb: 0 }}>
        <SettingsIcon />
        Program Settings
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Weeks" />
        <Tab label="Days" />
      </Tabs>

      <DialogContent sx={{ p: 3 }}>
        {tab === 0 && (
          <Box>
            {localWeeks.length < 4 && (
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddWeek}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              >
                Add Week
              </Button>
            )}

            {localWeeks.map((week) => (
              <Card key={week.id} sx={{ p: 2.5, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={2}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      W{week.id}
                    </Typography>
                  </Grid>
                  <Grid size={7}>
                    <TextField
                      fullWidth
                      size="small"
                      value={week.name}
                      onChange={(e) => handleWeekChange(week.id, 'name', e.target.value)}
                      placeholder="Week name"
                      label="Name"
                    />
                  </Grid>
                  <Grid size={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      onClick={() => setDeleteConfirm({ type: 'week', id: week.id })}
                      disabled={localWeeks.length <= 1}
                      sx={{ color: theme.palette.error.main }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={week.rir}
                      onChange={(e) => handleWeekChange(week.id, 'rir', parseInt(e.target.value) || 0)}
                      label="RIR"
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={Math.round((week.loadModifier - 1) * 100)}
                      onChange={(e) => handleWeekChange(week.id, 'loadModifier', 1 + (parseInt(e.target.value) || 0) / 100)}
                      label="Load %"
                      inputProps={{ min: -50 }}
                      InputProps={{
                        endAdornment: <Typography variant="caption" color="text.secondary">%</Typography>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}
          </Box>
        )}

        {tab === 1 && (
          <Box>
            {localDays.length < 7 && (
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddDay}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              >
                Add Day
              </Button>
            )}

            {localDays.map((day) => {
              const IconComponent = getIconComponent(day.icon);
              return (
                <Card key={day.id} sx={{ p: 2.5, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <IconComponent sx={{ color: theme.palette.primary.main }} />
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      value={day.name}
                      onChange={(e) => handleDayChange(day.id, 'name', e.target.value)}
                      placeholder="Day name"
                      label="Name"
                    />
                    <IconButton
                      onClick={() => setDeleteConfirm({ type: 'day', id: day.id })}
                      disabled={localDays.length <= 1}
                      sx={{ color: theme.palette.error.main, flexShrink: 0 }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {ICON_OPTIONS.map(({ name, icon: Icon }) => (
                      <IconButton
                        key={name}
                        size="small"
                        onClick={() => handleDayChange(day.id, 'icon', name)}
                        sx={{
                          backgroundColor: day.icon === name ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                          border: day.icon === name ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                          borderRadius: 1,
                        }}
                      >
                        <Icon fontSize="small" />
                      </IconButton>
                    ))}
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>

      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete {deleteConfirm?.type === 'week' ? 'Week' : 'Day'}?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            This {deleteConfirm?.type} will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}