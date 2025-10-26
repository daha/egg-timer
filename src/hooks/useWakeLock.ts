import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage Screen Wake Lock API
 * Keeps the screen awake when active (e.g., during timer countdown)
 * Automatically handles visibility changes and cleanup
 *
 * @param isActive - Whether the wake lock should be active
 */
export function useWakeLock(isActive: boolean) {
  // WakeLockSentinel is defined in lib.dom.d.ts but ESLint doesn't see it
  // eslint-disable-next-line no-undef
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Check if Wake Lock API is supported
    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock API not supported in this browser');
      return;
    }

    const requestWakeLock = async () => {
      try {
        if (isActive && !wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock activated - screen will stay awake');
        }
      } catch (err) {
        console.error('Wake Lock request failed:', err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log('Wake Lock released - screen can sleep');
        } catch (err) {
          console.error('Wake Lock release failed:', err);
        }
      }
    };

    if (isActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Handle visibility change (re-acquire lock when page becomes visible)
    // This is necessary because wake locks are automatically released when
    // the page becomes hidden (e.g., switching tabs or minimizing browser)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup: release wake lock and remove event listener
    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);
}
