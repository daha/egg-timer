import { Egg } from '../types';

const STORAGE_KEY = 'egg-timer-data';

interface StoredData {
  eggs: Egg[];
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
 * Save eggs to localStorage
 * @param eggs - Array of eggs to save
 */
export function saveEggs(eggs: Egg[]): void {
  try {
    const data: StoredData = {
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
 * Clear all saved eggs from localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}
