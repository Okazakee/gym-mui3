import { useCallback, useRef, useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { WorkoutSession, UserWeights, WeekPhase, WeekConfig, DayConfig } from '../types';

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
    weekConfigs?: WeekConfig[];
    dayConfigs?: DayConfig[];
    settings: {
      currentWeek: WeekPhase;
      currentDay?: string;
      restDuration: number;
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
  const lastPushedHashRef = useRef<string | null>(null);

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
    const failedItems: QueuedSync[] = [];

    for (const item of syncQueue) {
      if (!navigator.onLine) {
        failedItems.push(item);
        continue;
      }

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
        const updated = { ...item, retries: item.retries + 1 };
        if (updated.retries >= 3) {
          setSyncFailed(true);
        } else {
          failedItems.push(updated);
        }
      }
    }

    setSyncQueue(failedItems);
  }, [syncQueue, createGist, updateGist, setGistId, setLastSync, setSyncFailed, setSyncQueue]);

  const sync = useCallback(async (data: BackupData) => {
    if (!githubToken) return;

    const hash = JSON.stringify(data.data);
    if (hash === lastPushedHashRef.current) return;

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

      lastPushedHashRef.current = hash;
      setLastSync(new Date().toISOString());
    }, 2000);
  }, [githubToken, gistId, createGist, updateGist, setGistId, setLastSync, setSyncQueue]);

  const disconnect = useCallback(() => {
    setGithubToken(null);
    setGistId(null);
    setLastSync(null);
    setSyncQueue([]);
    setSyncFailed(false);
    lastPushedHashRef.current = null;
  }, [setGithubToken, setGistId, setLastSync, setSyncQueue, setSyncFailed]);

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

  const searchForExistingGist = useCallback(async (token: string): Promise<{ id: string; data: BackupData } | null> => {
    try {
      const response = await fetch('https://api.github.com/gists', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (!response.ok) return null;
      const gists: Array<{ id: string; description: string; files: Record<string, unknown> }> = await response.json();
      const found = gists.find(g => g.description === 'GymTracker Backup' && g.files['gymtracker-backup.json']);
      if (!found) return null;
      const data = await fetchCloudBackup(token, found.id);
      if (!data) return null;
      return { id: found.id, data };
    } catch {
      return null;
    }
  }, [fetchCloudBackup]);

  const connect = useCallback(async (token: string, localData: BackupData): Promise<{ conflict: boolean; cloudData?: BackupData }> => {
    const valid = await validateToken(token);
    if (!valid) {
      return { conflict: false };
    }

    setGithubToken(token);

    if (!gistId) {
      const existing = await searchForExistingGist(token);
      if (existing) {
        setGistId(existing.id);
        return { conflict: true, cloudData: existing.data };
      }
      const newGistId = await createGist(token, localData);
      if (newGistId) {
        setGistId(newGistId);
      }
      return { conflict: false };
    }

    const cloudData = await fetchCloudBackup(token, gistId);
    if (cloudData && cloudData.version !== localData.version) {
      return { conflict: true, cloudData };
    }

    return { conflict: false };
  }, [gistId, validateToken, createGist, fetchCloudBackup, setGithubToken, setGistId, searchForExistingGist]);

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
    connect,
  };
}