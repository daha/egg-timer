import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadEggs, saveEggs, clearStorage } from '../../src/utils/storage';
import { Egg } from '../../src/types';

describe('storage utilities', () => {
  // Mock localStorage
  let mockStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Clear mock storage before each test
    mockStorage = {};

    // Mock localStorage methods
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return mockStorage[key] || null;
    });

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key: string, value: string) => {
        mockStorage[key] = value;
      }
    );

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
      (key: string) => {
        delete mockStorage[key];
      }
    );
  });

  describe('loadEggs', () => {
    it('should return empty array when no data in localStorage', () => {
      const eggs = loadEggs();
      expect(eggs).toEqual([]);
    });

    it('should load eggs from localStorage', () => {
      const testEggs: Egg[] = [
        {
          id: '1',
          weight: 50,
          doneness: 'soft',
          temperature: 'refrigerated',
        },
        {
          id: '2',
          weight: 60,
          doneness: 'hard',
          temperature: 'room',
        },
      ];

      // Manually set data in mock storage
      mockStorage['egg-timer-data'] = JSON.stringify({
        eggs: testEggs,
        version: 1,
      });

      const loaded = loadEggs();
      expect(loaded).toEqual(testEggs);
    });

    it('should return empty array on invalid JSON', () => {
      mockStorage['egg-timer-data'] = 'invalid json';

      const eggs = loadEggs();
      expect(eggs).toEqual([]);
    });

    it('should return empty array on invalid data structure', () => {
      mockStorage['egg-timer-data'] = JSON.stringify({ notEggs: 'data' });

      const eggs = loadEggs();
      expect(eggs).toEqual([]);
    });
  });

  describe('saveEggs', () => {
    it('should save eggs to localStorage', () => {
      const testEggs: Egg[] = [
        {
          id: '1',
          weight: 50,
          doneness: 'soft',
          temperature: 'refrigerated',
        },
      ];

      saveEggs(testEggs);

      const stored = mockStorage['egg-timer-data'];
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored);
      expect(parsed.eggs).toEqual(testEggs);
      expect(parsed.version).toBe(1);
    });

    it('should save empty array', () => {
      saveEggs([]);

      const stored = mockStorage['egg-timer-data'];
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored);
      expect(parsed.eggs).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock setItem to throw an error (e.g., quota exceeded)
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      // Should not throw, just log error
      expect(() => saveEggs([])).not.toThrow();
    });
  });

  describe('clearStorage', () => {
    it('should remove data from localStorage', () => {
      mockStorage['egg-timer-data'] = JSON.stringify({
        eggs: [],
        version: 1,
      });

      clearStorage();

      expect(mockStorage['egg-timer-data']).toBeUndefined();
    });

    it('should handle errors gracefully', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearStorage()).not.toThrow();
    });
  });
});
