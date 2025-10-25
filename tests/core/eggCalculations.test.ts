import { describe, it, expect } from 'vitest';
import {
  calculateBoilTime,
  calculateEggTimings,
  getTotalTime,
} from '../../src/core/eggCalculations';
import { Egg } from '../../src/types';

describe('calculateBoilTime', () => {
  it('should calculate base formula correctly for 50g medium refrigerated egg', () => {
    const egg: Egg = {
      id: '1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };
    // 197 + 4.6 * 50 + 0 + 0 = 197 + 230 = 427
    expect(calculateBoilTime(egg)).toBe(427);
  });

  it('should calculate soft boiled egg correctly', () => {
    const egg: Egg = {
      id: '1',
      weight: 50,
      doneness: 'soft',
      temperature: 'refrigerated',
    };
    // 197 + 4.6 * 50 - 30 = 397
    expect(calculateBoilTime(egg)).toBe(397);
  });

  it('should calculate harder boiled egg correctly', () => {
    const egg: Egg = {
      id: '1',
      weight: 50,
      doneness: 'harder',
      temperature: 'refrigerated',
    };
    // 197 + 4.6 * 50 + 45 = 472
    expect(calculateBoilTime(egg)).toBe(472);
  });

  it('should calculate hard boiled egg correctly', () => {
    const egg: Egg = {
      id: '1',
      weight: 50,
      doneness: 'hard',
      temperature: 'refrigerated',
    };
    // 197 + 4.6 * 50 + 90 = 517
    expect(calculateBoilTime(egg)).toBe(517);
  });

  it('should calculate room temperature egg correctly', () => {
    const egg: Egg = {
      id: '1',
      weight: 50,
      doneness: 'medium',
      temperature: 'room',
    };
    // 197 + 4.6 * 50 - 30 = 397
    expect(calculateBoilTime(egg)).toBe(397);
  });

  it('should handle room temperature soft boiled egg', () => {
    const egg: Egg = {
      id: '1',
      weight: 50,
      doneness: 'soft',
      temperature: 'room',
    };
    // 197 + 4.6 * 50 - 30 - 30 = 367
    expect(calculateBoilTime(egg)).toBe(367);
  });

  it('should handle small eggs (30g)', () => {
    const egg: Egg = {
      id: '1',
      weight: 30,
      doneness: 'medium',
      temperature: 'refrigerated',
    };
    // 197 + 4.6 * 30 = 197 + 138 = 335
    expect(calculateBoilTime(egg)).toBe(335);
  });

  it('should handle large eggs (80g)', () => {
    const egg: Egg = {
      id: '1',
      weight: 80,
      doneness: 'medium',
      temperature: 'refrigerated',
    };
    // 197 + 4.6 * 80 = 197 + 368 = 565
    expect(calculateBoilTime(egg)).toBe(565);
  });

  it('should round the result to nearest integer', () => {
    const egg: Egg = {
      id: '1',
      weight: 55,
      doneness: 'medium',
      temperature: 'refrigerated',
    };
    // 197 + 4.6 * 55 = 197 + 253 = 450
    expect(calculateBoilTime(egg)).toBe(450);
  });
});

describe('calculateEggTimings', () => {
  it('should return empty array for empty egg list', () => {
    const timings = calculateEggTimings([]);
    expect(timings).toEqual([]);
  });

  it('should calculate timing for single egg', () => {
    const eggs: Egg[] = [
      {
        id: 'egg1',
        weight: 50,
        doneness: 'medium',
        temperature: 'refrigerated',
      },
    ];

    const timings = calculateEggTimings(eggs);

    expect(timings).toHaveLength(1);
    expect(timings[0]).toEqual({
      eggId: 'egg1',
      boilTime: 427,
      addAtSecond: 0, // Only egg, add immediately
    });
  });

  it('should calculate staggered timings for multiple eggs', () => {
    const eggs: Egg[] = [
      {
        id: 'egg-a',
        weight: 50,
        doneness: 'soft',
        temperature: 'refrigerated',
      }, // 397s
      {
        id: 'egg-b',
        weight: 70,
        doneness: 'hard',
        temperature: 'refrigerated',
      }, // 197 + 322 + 90 = 609s
      {
        id: 'egg-c',
        weight: 60,
        doneness: 'medium',
        temperature: 'refrigerated',
      }, // 197 + 276 = 473s
    ];

    const timings = calculateEggTimings(eggs);

    expect(timings).toHaveLength(3);

    // Find timings for each egg
    const timingA = timings.find((t) => t.eggId === 'egg-a');
    const timingB = timings.find((t) => t.eggId === 'egg-b');
    const timingC = timings.find((t) => t.eggId === 'egg-c');

    // Egg B has longest time (609s), should be added first
    expect(timingB?.boilTime).toBe(609);
    expect(timingB?.addAtSecond).toBe(0);

    // Egg C should be added after 136s (609 - 473)
    expect(timingC?.boilTime).toBe(473);
    expect(timingC?.addAtSecond).toBe(136);

    // Egg A should be added after 242s (609 - 367... wait let me recalculate)
    // egg-a: 197 + 4.6*50 - 30 = 197 + 230 - 30 = 397
    expect(timingA?.boilTime).toBe(397);
    expect(timingA?.addAtSecond).toBe(212); // 609 - 397
  });

  it('should handle eggs with same boil time', () => {
    const eggs: Egg[] = [
      {
        id: 'egg1',
        weight: 50,
        doneness: 'medium',
        temperature: 'refrigerated',
      },
      {
        id: 'egg2',
        weight: 50,
        doneness: 'medium',
        temperature: 'refrigerated',
      },
    ];

    const timings = calculateEggTimings(eggs);

    expect(timings).toHaveLength(2);
    // Both should have same boil time and be added at second 0
    expect(timings[0].boilTime).toBe(427);
    expect(timings[0].addAtSecond).toBe(0);
    expect(timings[1].boilTime).toBe(427);
    expect(timings[1].addAtSecond).toBe(0);
  });

  it('should maintain egg IDs in timings', () => {
    const eggs: Egg[] = [
      {
        id: 'unique-id-123',
        weight: 50,
        doneness: 'medium',
        temperature: 'refrigerated',
      },
      {
        id: 'unique-id-456',
        weight: 60,
        doneness: 'hard',
        temperature: 'refrigerated',
      },
    ];

    const timings = calculateEggTimings(eggs);

    const eggIds = timings.map((t) => t.eggId);
    expect(eggIds).toContain('unique-id-123');
    expect(eggIds).toContain('unique-id-456');
  });
});

describe('getTotalTime', () => {
  it('should return 0 for empty egg list', () => {
    expect(getTotalTime([])).toBe(0);
  });

  it('should return boil time for single egg', () => {
    const eggs: Egg[] = [
      {
        id: 'egg1',
        weight: 50,
        doneness: 'medium',
        temperature: 'refrigerated',
      },
    ];

    expect(getTotalTime(eggs)).toBe(427);
  });

  it('should return longest boil time for multiple eggs', () => {
    const eggs: Egg[] = [
      {
        id: 'egg1',
        weight: 50,
        doneness: 'soft',
        temperature: 'refrigerated',
      }, // 397s
      {
        id: 'egg2',
        weight: 70,
        doneness: 'hard',
        temperature: 'refrigerated',
      }, // 609s
      {
        id: 'egg3',
        weight: 60,
        doneness: 'medium',
        temperature: 'refrigerated',
      }, // 473s
    ];

    // Should return 609s (longest time)
    expect(getTotalTime(eggs)).toBe(609);
  });

  it('should handle all eggs with same boil time', () => {
    const eggs: Egg[] = [
      {
        id: 'egg1',
        weight: 50,
        doneness: 'medium',
        temperature: 'refrigerated',
      },
      {
        id: 'egg2',
        weight: 50,
        doneness: 'medium',
        temperature: 'refrigerated',
      },
      {
        id: 'egg3',
        weight: 50,
        doneness: 'medium',
        temperature: 'refrigerated',
      },
    ];

    expect(getTotalTime(eggs)).toBe(427);
  });
});

describe('integration: full calculation flow', () => {
  it('should calculate complete timing schedule correctly', () => {
    // Real-world scenario: cooking 3 different eggs
    const eggs: Egg[] = [
      {
        id: 'breakfast-soft',
        weight: 55,
        doneness: 'soft',
        temperature: 'refrigerated',
      },
      {
        id: 'salad-medium',
        weight: 60,
        doneness: 'medium',
        temperature: 'room',
      },
      {
        id: 'deviled-hard',
        weight: 65,
        doneness: 'hard',
        temperature: 'refrigerated',
      },
    ];

    const timings = calculateEggTimings(eggs);
    const totalTime = getTotalTime(eggs);

    // Verify all eggs finish at the same time
    timings.forEach((timing) => {
      expect(timing.addAtSecond + timing.boilTime).toBe(totalTime);
    });

    // Verify we have timing for each egg
    expect(timings).toHaveLength(3);

    // Verify timings are sorted logically (could add at different times)
    const addTimes = timings.map((t) => t.addAtSecond);
    expect(Math.min(...addTimes)).toBe(0); // At least one egg starts at 0
  });
});
