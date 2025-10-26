import { useEffect, useRef } from 'react';
import { Egg, TimerState } from '../types';
import {
  loadEggs,
  saveEggs,
  loadTimerState,
  saveTimerState,
  clearTimerState,
  clearStorage as clearStorageUtil,
} from '../utils/storage';

interface UseLocalStorageOptions {
  eggs: Egg[];
  status: TimerState['status'];
  elapsedSeconds: number;
  coolingElapsed: number;
  restoreEggs: (eggs: Egg[]) => void;
  restoreTimerState: (state: {
    status: TimerState['status'];
    elapsedSeconds: number;
    coolingElapsed: number;
  }) => void;
}

/**
 * Hook to manage localStorage persistence for eggs and timer state
 * Automatically loads eggs and timer state on mount and saves them when they change
 */
export function useLocalStorage({
  eggs,
  status,
  elapsedSeconds,
  coolingElapsed,
  restoreEggs,
  restoreTimerState,
}: UseLocalStorageOptions) {
  const isInitialMount = useRef(true);

  // Load eggs and timer state from localStorage on mount
  useEffect(() => {
    if (isInitialMount.current) {
      const storedEggs = loadEggs();
      const storedTimerState = loadTimerState();

      if (storedEggs.length > 0) {
        restoreEggs(storedEggs);
      }

      // Restore timer state if it was running or cooling
      if (
        storedTimerState &&
        (storedTimerState.status === 'running' ||
          storedTimerState.status === 'cooling')
      ) {
        // Calculate time elapsed since save
        const now = Date.now();
        const timeSinceSave = Math.floor(
          (now - storedTimerState.savedAt) / 1000
        );

        // Add elapsed time to the saved state
        const adjustedElapsed = storedTimerState.elapsedSeconds + timeSinceSave;

        restoreTimerState({
          status: storedTimerState.status,
          elapsedSeconds: adjustedElapsed,
          coolingElapsed: storedTimerState.coolingElapsed,
        });
      }

      isInitialMount.current = false;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save eggs to localStorage whenever they change (but not while timer is running/cooling)
  useEffect(() => {
    // Don't save on initial mount (we just loaded)
    if (isInitialMount.current) {
      return;
    }

    // Only save eggs when timer is idle, paused, or complete (not running or cooling)
    if (status === 'idle' || status === 'paused' || status === 'complete') {
      saveEggs(eggs);
    }
  }, [eggs, status]);

  // Save timer state when running or cooling
  useEffect(() => {
    // Don't save on initial mount
    if (isInitialMount.current) {
      return;
    }

    if (status === 'running' || status === 'cooling') {
      saveTimerState({ status, elapsedSeconds, coolingElapsed });
    } else if (status === 'idle' || status === 'complete') {
      // Clear timer state when idle or complete
      clearTimerState();
    }
  }, [status, elapsedSeconds, coolingElapsed]);

  // Return a function to manually clear storage
  const clearStorage = () => {
    clearStorageUtil();
  };

  return {
    clearStorage,
  };
}
