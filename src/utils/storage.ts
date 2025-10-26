import { Egg, TimerState } from '../types';

const STORAGE_KEY = 'egg-timer-data';

interface StoredData {
  eggs: Egg[];
  timerState?: {
    status: TimerState['status'];
    elapsedSeconds: number;
    coolingElapsed: number;
    savedAt: number; // timestamp when saved
    boilingEndTime: number | null;
    coolingEndTime: number | null;
  };
  version: number; // for future migrations
}

/**
 * Load eggs from localStorage
 * @returns Array of eggs, or empty array if none stored or error occurs
 */
export function loadEggs(): Egg[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data: StoredData = JSON.parse(stored);

    // Validate the data structure
    if (!data || typeof data !== 'object' || !Array.isArray(data.eggs)) {
      console.warn('Invalid data structure in localStorage, ignoring');
      return [];
    }

    return data.eggs;
  } catch (error) {
    console.error('Failed to load eggs from storage:', error);
    return [];
  }
}

/**
 * Load timer state from localStorage
 * @returns Timer state or null if none stored or error occurs
 */
export function loadTimerState(): StoredData['timerState'] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: StoredData = JSON.parse(stored);
    return data.timerState || null;
  } catch (error) {
    console.error('Failed to load timer state from storage:', error);
    return null;
  }
}

/**
 * Save eggs to localStorage
 * @param eggs - Array of eggs to save
 */
export function saveEggs(eggs: Egg[]): void {
  try {
    // Load existing data to preserve timer state
    const existing = localStorage.getItem(STORAGE_KEY);
    const existingData: StoredData = existing
      ? JSON.parse(existing)
      : { eggs: [], version: 1 };

    const data: StoredData = {
      ...existingData,
      eggs,
      version: 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save eggs to storage:', error);
    // Could be quota exceeded or other localStorage errors
  }
}

/**
 * Save timer state to localStorage
 * @param state - Timer state to save
 */
export function saveTimerState(
  state: Pick<
    TimerState,
    | 'status'
    | 'elapsedSeconds'
    | 'coolingElapsed'
    | 'boilingEndTime'
    | 'coolingEndTime'
  >
): void {
  try {
    // Load existing data to preserve eggs
    const existing = localStorage.getItem(STORAGE_KEY);
    const existingData: StoredData = existing
      ? JSON.parse(existing)
      : { eggs: [], version: 1 };

    const data: StoredData = {
      ...existingData,
      timerState: {
        status: state.status,
        elapsedSeconds: state.elapsedSeconds,
        coolingElapsed: state.coolingElapsed,
        savedAt: Date.now(),
        boilingEndTime: state.boilingEndTime,
        coolingEndTime: state.coolingEndTime,
      },
      version: 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save timer state to storage:', error);
  }
}

/**
 * Clear timer state from localStorage (but keep eggs)
 */
export function clearTimerState(): void {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) return;

    const existingData: StoredData = JSON.parse(existing);
    const data: StoredData = {
      ...existingData,
      timerState: undefined,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to clear timer state:', error);
  }
}

/**
 * Clear all saved eggs from localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}
