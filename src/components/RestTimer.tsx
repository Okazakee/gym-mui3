import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Fab,
  alpha,
  useTheme,
  Collapse,
  Slider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as ResetIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useWakeLock } from '../hooks/useWakeLock';

interface RestTimerProps {
  defaultDuration: number; // in seconds
  onDurationChange: (duration: number) => void;
}

export function RestTimer({ defaultDuration, onDurationChange }: RestTimerProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [duration, setDuration] = useState(defaultDuration);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isSupported: wakeLockSupported, isActive: wakeLockActive, requestWakeLock, releaseWakeLock } = useWakeLock();

  // Initialize audio for timer end
  useEffect(() => {
    // Create a simple beep using Web Audio API
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleW1mcYaGflxTYYqhtax6USpFjMvl3LKBXlxjdIGCd2RjcIqgtLSMakVFhLbZ48CghXlxcnl2alZcc46fr6+TdE9Hi7XI0sGnmY+IhYN8bmBeZ3+PlZ2ejnhdd5i60t3MubKsnp2bkYV0ZWVte4SNk5KKfm5rgZ2vvsrFu7KtrK6poZWIeXRzd36EioqGgHhxcIWcr7zBvba0s7W2saqfi4J9fX9/gYKBfnp3d4GUnKm2vL27ubq7u7mvn46Bf39/f39+fXt4dXiBkZyqtr3Avrq4t7W0rKCUiYOBgIB+fHp4dXN4hJOgrrm+v7y3s7CtqaWckoqFg4KBf316eHZ3fIqXo6+5vL26trKuqqahmZGLhoSCgX99e3l4eHyGk5+rsbi6uLWyr6yppZ6WjoiFg4GAfnt5eHl+h5OeqLK3t7azsK2qqKSfmJCKhoOBf358enl5fYaSmqWusbKxr62rqainop2Vj4qGg4F/fXt6en2FkJiks7e5t7SxrquopaGbk42IhYOAfn17e3x/iJObpK6ztLOwr6yqp6Sgm5SNiYWDgH5+fHt9gYqTm6OrsLGwra2rqaeinpqUjoqGg4GAf359fYGIkJeeo6iqqqmopaOhnpuXkY2JhoOBgH9+f4GGjJKYnqGjoqGgn52bmJWRjouIhoSCgYCAgoSIjZGWmZubnJuamJeVk5COi4mHhYSDg4OEhomMj5KUlZWVlJOSkI+NjIqJiIeGhoaGh4mKjI6PkJCQkI+Ojo2MjIuKioqJiYmJiouMjY6Ojo6OjY2NjYyMjIuLi4uLi4uLjIyMjY2NjY2NjY2NjY2NjYyMjIyMjIyMjIyMjIyMjI2NjY2NjY2NjY2NjY2NjY2NjYyM');
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play sound and vibrate
            audioRef.current?.play().catch(() => {});
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = useCallback(() => {
    if (timeLeft === 0) {
      setTimeLeft(duration);
    }
    setIsRunning((prev) => {
      const newIsRunning = !prev;
      if (newIsRunning) {
        requestWakeLock();
      } else {
        releaseWakeLock();
      }
      return newIsRunning;
    });
  }, [timeLeft, duration, requestWakeLock, releaseWakeLock]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(duration);
  }, [duration]);

  const adjustDuration = useCallback((delta: number) => {
    const newDuration = Math.max(30, Math.min(600, duration + delta));
    setDuration(newDuration);
    setTimeLeft(newDuration);
    onDurationChange(newDuration);
  }, [duration, onDurationChange]);

  const handleSliderChange = (_: Event, value: number | number[]) => {
    const newDuration = value as number;
    setDuration(newDuration);
    if (!isRunning) {
      setTimeLeft(newDuration);
    }
    onDurationChange(newDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const isComplete = timeLeft === 0 && !isRunning;

  return (
    <>
      {/* Timer FAB - shows when closed */}
      {!isOpen && (
        <Fab
          size="medium"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 88,
            left: 20,
            backgroundColor: isComplete 
              ? theme.palette.success.main 
              : alpha(theme.palette.primary.main, 0.9),
            color: '#fff',
            '&:hover': {
              backgroundColor: isComplete 
                ? theme.palette.success.dark 
                : theme.palette.primary.main,
            },
          }}
        >
          <TimerIcon />
        </Fab>
      )}

      {/* Expanded Timer Panel */}
      <Collapse in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 24px)',
            maxWidth: 400,
            zIndex: 1200,
            p: 2,
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.background.paper, 0.98),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon sx={{ fontSize: 20 }} />
              Rest Timer
            </Typography>
            <IconButton size="small" onClick={() => setIsOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Timer Display */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2,
            }}
          >
            {/* Circular Progress Background */}
            <Box
              sx={{
                position: 'relative',
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: `conic-gradient(
                  ${isComplete ? theme.palette.success.main : theme.palette.primary.main} ${progress}%, 
                  ${alpha(theme.palette.primary.main, 0.1)} ${progress}%
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.3s ease',
              }}
            >
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.background.paper,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: isComplete ? theme.palette.success.main : theme.palette.text.primary,
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
                {isComplete && (
                  <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                    REST COMPLETE!
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <IconButton
              onClick={resetTimer}
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.text.primary, 0.1),
                '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.2) },
              }}
            >
              <ResetIcon />
            </IconButton>
            <IconButton
              onClick={toggleTimer}
              sx={{
                width: 64,
                height: 64,
                backgroundColor: isRunning 
                  ? alpha(theme.palette.warning.main, 0.2)
                  : theme.palette.primary.main,
                color: isRunning ? theme.palette.warning.main : '#fff',
                '&:hover': {
                  backgroundColor: isRunning 
                    ? alpha(theme.palette.warning.main, 0.3)
                    : theme.palette.primary.dark,
                },
              }}
            >
              {isRunning ? <PauseIcon sx={{ fontSize: 32 }} /> : <PlayIcon sx={{ fontSize: 32 }} />}
            </IconButton>
            <Tooltip title={wakeLockActive ? 'Screen will stay on' : 'Allow screen to sleep'}>
              <IconButton
                onClick={() => wakeLockActive ? releaseWakeLock() : requestWakeLock()}
                disabled={!wakeLockSupported}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: wakeLockActive 
                    ? alpha(theme.palette.success.main, 0.2)
                    : alpha(theme.palette.text.primary, 0.1),
                  color: wakeLockActive ? theme.palette.success.main : theme.palette.text.primary,
                  '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.3) },
                }}
              >
                {wakeLockActive ? <LockIcon /> : <LockOpenIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Secondary Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              onClick={() => setShowSettings(!showSettings)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: showSettings 
                  ? alpha(theme.palette.primary.main, 0.2)
                  : alpha(theme.palette.text.primary, 0.05),
                color: showSettings ? theme.palette.primary.main : theme.palette.text.primary,
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <TimerIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Duration Settings */}
          <Collapse in={showSettings}>
            <Box sx={{ pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
                Adjust rest duration
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  size="small" 
                  onClick={() => adjustDuration(-15)}
                  disabled={duration <= 30}
                >
                  <RemoveIcon />
                </IconButton>
                <Slider
                  value={duration}
                  onChange={handleSliderChange}
                  min={30}
                  max={600}
                  step={15}
                  sx={{ flex: 1 }}
                />
                <IconButton 
                  size="small" 
                  onClick={() => adjustDuration(15)}
                  disabled={duration >= 600}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ textAlign: 'center', color: theme.palette.text.secondary, mt: 1 }}>
                {formatTime(duration)}
              </Typography>
            </Box>
          </Collapse>
        </Paper>
      </Collapse>
    </>
  );
}

