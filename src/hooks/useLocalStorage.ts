import { useEffect, useRef } from 'react';
import { Egg } from '../types';
import {
  loadEggs,
  saveEggs,
  clearStorage as clearStorageUtil,
} from '../utils/storage';

interface UseLocalStorageOptions {
  eggs: Egg[];
  status: 'idle' | 'running' | 'paused' | 'cooling' | 'complete';
  restoreEggs: (eggs: Egg[]) => void;
}

/**
 * Hook to manage localStorage persistence for eggs
 * Automatically loads eggs on mount and saves them when they change (but not during active timer)
 */
export function useLocalStorage({
  eggs,
  status,
  restoreEggs,
}: UseLocalStorageOptions) {
  const isInitialMount = useRef(true);

  // Load eggs from localStorage on mount
  useEffect(() => {
    if (isInitialMount.current && status === 'idle') {
      const storedEggs = loadEggs();
      if (storedEggs.length > 0) {
        restoreEggs(storedEggs);
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

    // Only save when timer is idle, paused, or complete (not running or cooling)
    if (status === 'idle' || status === 'paused' || status === 'complete') {
      saveEggs(eggs);
    }
  }, [eggs, status]);

  // Return a function to manually clear storage
  const clearStorage = () => {
    clearStorageUtil();
  };

  return {
    clearStorage,
  };
}
