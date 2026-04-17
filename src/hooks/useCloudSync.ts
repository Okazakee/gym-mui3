import { useCallback, useRef, useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { WorkoutSession, UserWeights, WeekPhase } from '../types';

const STORAGE_KEYS = {
  GITHUB_TOKEN: 'gym-tracker-github-token',
  GIST_ID: 'gym-tracker-gist-id',
  LAST_SYNC: 'gym-tracker-last-sync',
  SYNC_QUEUE: 'gym-tracker-sync-queue',
  SYNC_FAILED: 'gym-tracker-sync-failed',
};

interface BackupData {
  version: number;
  exportedAt: string;
  data: {
    workouts: WorkoutSession[];
    userWeights: UserWeights;
    settings: {
      currentWeek: WeekPhase;
      restDuration: number;
      weekSelectorVisible: boolean;
      darkMode: boolean;
    };
  };
}

interface QueuedSync {
  timestamp: number;
  data: BackupData;
  retries: number;
}

export function useCloudSync() {
  const [githubToken, setGithubToken] = useLocalStorage<string | null>(STORAGE_KEYS.GITHUB_TOKEN, null);
  const [gistId, setGistId] = useLocalStorage<string | null>(STORAGE_KEYS.GIST_ID, null);
  const [lastSync, setLastSync] = useLocalStorage<string | null>(STORAGE_KEYS.LAST_SYNC, null);
  const [syncFailed, setSyncFailed] = useState(false);
  
  const [syncQueue, setSyncQueue] = useLocalStorage<QueuedSync[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  const debounceTimerRef = useRef<number | null>(null);

  const isConnected = !!githubToken;

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const createGist = useCallback(async (token: string, data: BackupData): Promise<string | null> => {
    try {
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'GymTracker Backup',
          public: false,
          files: {
            'gymtracker-backup.json': {
              content: JSON.stringify(data, null, 2),
            },
          },
        }),
      });

      if (!response.ok) return null;
      const result = await response.json();
      return result.id;
    } catch {
      return null;
    }
  }, []);

  const updateGist = useCallback(async (token: string, id: string, data: BackupData): Promise<boolean> => {
    try {
      const response = await fetch(`https://api.github.com/gists/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'GymTracker Backup',
          files: {
            'gymtracker-backup.json': {
              content: JSON.stringify(data, null, 2),
            },
          },
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }, []);

  const fetchCloudBackup = useCallback(async (token: string, id: string): Promise<BackupData | null> => {
    try {
      const response = await fetch(`https://api.github.com/gists/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!response.ok) return null;
      const result = await response.json();
      const content = result.files['gymtracker-backup.json']?.content;
      if (!content) return null;
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, []);

  const processSyncQueue = useCallback(async (token: string, existingGistId: string | null) => {
    if (!navigator.onLine) return;
    
    let currentGistId = existingGistId;
    
    for (const item of syncQueue) {
      if (!navigator.onLine) break;
      
      try {
        if (!currentGistId) {
          currentGistId = await createGist(token, item.data);
          if (currentGistId) {
            setGistId(currentGistId);
          }
        } else {
          await updateGist(token, currentGistId, item.data);
        }
        
        setLastSync(new Date().toISOString());
      } catch {
        const newQueue = [...syncQueue];
        const idx = newQueue.findIndex(q => q.timestamp === item.timestamp);
        if (idx !== -1) {
          newQueue[idx] = { ...item, retries: item.retries + 1 };
          if (newQueue[idx].retries >= 3) {
            newQueue.splice(idx, 1);
            setSyncFailed(true);
          } else {
            setSyncQueue(newQueue);
          }
        }
      }
    }
    
    if (syncQueue.length > 0 && navigator.onLine) {
      setSyncQueue([]);
    }
  }, [syncQueue, createGist, updateGist, setGistId, setLastSync, setSyncFailed, setSyncQueue]);

  const sync = useCallback(async (data: BackupData) => {
    if (!githubToken) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(async () => {
      if (!navigator.onLine) {
        setSyncQueue(prev => [...prev, { timestamp: Date.now(), data, retries: 0 }]);
        return;
      }

      let currentGistId = gistId;

      if (!currentGistId) {
        currentGistId = await createGist(githubToken, data);
        if (currentGistId) {
          setGistId(currentGistId);
        }
      } else {
        await updateGist(githubToken, currentGistId, data);
      }

      setLastSync(new Date().toISOString());
    }, 2000);
  }, [githubToken, gistId, createGist, updateGist, setGistId, setLastSync, setSyncQueue]);

  const disconnect = useCallback(() => {
    setGithubToken(null);
    setGistId(null);
    setLastSync(null);
  }, [setGithubToken, setGistId, setLastSync]);

  const triggerSyncNow = useCallback(async (data: BackupData) => {
    if (!githubToken || !gistId) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    const success = await updateGist(githubToken, gistId, data);
    if (success) {
      setLastSync(new Date().toISOString());
    }
  }, [githubToken, gistId, updateGist, setLastSync]);

  const clearSyncFailed = useCallback(() => {
    setSyncFailed(false);
  }, [setSyncFailed]);

  useEffect(() => {
    const handleOnline = () => {
      if (githubToken && syncQueue.length > 0) {
        processSyncQueue(githubToken, gistId);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [githubToken, gistId, syncQueue, processSyncQueue]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    lastSync,
    githubToken,
    gistId,
    validateToken,
    sync,
    disconnect,
    triggerSyncNow,
    fetchCloudBackup,
    setGithubToken,
    syncFailed,
    clearSyncFailed,
    hasPendingSync: syncQueue.length > 0,
  };
}