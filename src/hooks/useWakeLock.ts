import { useEffect, useRef, useCallback, useState } from 'react';

// Use any for wake lock since TypeScript doesn't have full support yet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WakeLockSentinelType = any;

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinelType>(null);
  const [isActive, setIsActive] = useState(false);
  
  // Check wake lock support once
  const [isSupported] = useState(() => 'wakeLock' in navigator);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return false;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wakeLock = (navigator as any).wakeLock;
      wakeLockRef.current = await wakeLock.request('screen');
      setIsActive(true);

      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false);
      });

      return true;
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
      return false;
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setIsActive(false);
      } catch (err) {
        console.warn('Wake Lock release failed:', err);
      }
    }
  }, []);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, requestWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
  };
}
