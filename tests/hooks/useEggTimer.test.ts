import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useEggTimer,
  formatTime,
  getEggsToAddNow,
  getBoilingTimeRemaining,
  getCoolingTimeRemaining,
} from '../../src/hooks/useEggTimer';
import { Egg } from '../../src/types';

describe('useEggTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useEggTimer());

    expect(result.current.state.eggs).toEqual([]);
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.elapsedSeconds).toBe(0);
    expect(result.current.state.totalTime).toBe(0);
  });

  it('adds an egg correctly', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'test-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
    });

    expect(result.current.state.eggs).toHaveLength(1);
    expect(result.current.state.eggs[0]).toEqual(egg);
    expect(result.current.state.totalTime).toBeGreaterThan(0);
  });

  it('calculates timings when eggs are added', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg1: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'soft',
      temperature: 'refrigerated',
    };

    const egg2: Egg = {
      id: 'egg-2',
      weight: 70,
      doneness: 'hard',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg1);
      result.current.addEgg(egg2);
    });

    expect(result.current.state.timings).toHaveLength(2);
    expect(result.current.state.timings[0].eggId).toBe('egg-1');
    expect(result.current.state.timings[1].eggId).toBe('egg-2');
  });

  it('removes an egg correctly', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg1: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    const egg2: Egg = {
      id: 'egg-2',
      weight: 60,
      doneness: 'hard',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg1);
      result.current.addEgg(egg2);
    });

    expect(result.current.state.eggs).toHaveLength(2);

    act(() => {
      result.current.removeEgg('egg-1');
    });

    expect(result.current.state.eggs).toHaveLength(1);
    expect(result.current.state.eggs[0].id).toBe('egg-2');
  });

  it('recalculates timings after removing an egg', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg1: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'soft',
      temperature: 'refrigerated',
    };

    const egg2: Egg = {
      id: 'egg-2',
      weight: 70,
      doneness: 'hard',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg1);
      result.current.addEgg(egg2);
    });

    const totalTimeBefore = result.current.state.totalTime;

    act(() => {
      result.current.removeEgg('egg-2'); // Remove the egg with longer time
    });

    const totalTimeAfter = result.current.state.totalTime;

    // Total time should decrease after removing the egg with longer cooking time
    expect(totalTimeAfter).toBeLessThan(totalTimeBefore);
  });

  it('cannot add eggs when timer is running', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg1: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    const egg2: Egg = {
      id: 'egg-2',
      weight: 60,
      doneness: 'hard',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg1);
      result.current.startTimer();
    });

    expect(result.current.state.status).toBe('running');

    // Try to add egg while running
    act(() => {
      result.current.addEgg(egg2);
    });

    // Should still only have 1 egg
    expect(result.current.state.eggs).toHaveLength(1);
  });

  it('cannot remove eggs when timer is running', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg1: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg1);
      result.current.startTimer();
    });

    // Try to remove egg while running
    act(() => {
      result.current.removeEgg('egg-1');
    });

    // Should still have 1 egg
    expect(result.current.state.eggs).toHaveLength(1);
  });

  it('starts timer correctly', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
    });

    expect(result.current.state.status).toBe('idle');

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.state.status).toBe('running');
  });

  it('cannot start timer without eggs', () => {
    const { result } = renderHook(() => useEggTimer());

    act(() => {
      result.current.startTimer();
    });

    // Should remain idle
    expect(result.current.state.status).toBe('idle');
  });

  it('pauses timer correctly', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
      result.current.startTimer();
    });

    expect(result.current.state.status).toBe('running');

    act(() => {
      result.current.pauseTimer();
    });

    expect(result.current.state.status).toBe('paused');
  });

  it('can resume timer from paused state', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
      result.current.startTimer();
      result.current.pauseTimer();
    });

    expect(result.current.state.status).toBe('paused');

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.state.status).toBe('running');
  });

  it('resets timer correctly', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
      result.current.startTimer();
    });

    // Advance time
    act(() => {
      vi.advanceTimersByTime(5000); // 5 seconds
    });

    act(() => {
      result.current.resetTimer();
    });

    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.elapsedSeconds).toBe(0);
    expect(result.current.state.coolingElapsed).toBe(0);
    // Eggs should still be there
    expect(result.current.state.eggs).toHaveLength(1);
  });

  it('increments elapsed time every second when running', async () => {
    vi.useRealTimers(); // Use real timers for this test

    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
      result.current.startTimer();
    });

    expect(result.current.state.elapsedSeconds).toBe(0);

    // Wait for 1 second to elapse
    await waitFor(
      () => {
        expect(result.current.state.elapsedSeconds).toBe(1);
      },
      { timeout: 1500 }
    );

    // Wait for 2 more seconds (total 3 seconds)
    await waitFor(
      () => {
        expect(result.current.state.elapsedSeconds).toBe(3);
      },
      { timeout: 2500 }
    );

    vi.useFakeTimers(); // Restore fake timers
  });

  it('does not increment time when paused', async () => {
    vi.useRealTimers(); // Use real timers for this test

    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
      result.current.startTimer();
    });

    // Wait for 2 seconds to elapse
    await waitFor(
      () => {
        expect(result.current.state.elapsedSeconds).toBe(2);
      },
      { timeout: 2500 }
    );

    // Pause
    act(() => {
      result.current.pauseTimer();
    });

    // Wait 1.5 seconds while paused
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Should still be at 2 (not incrementing while paused)
    expect(result.current.state.elapsedSeconds).toBe(2);

    vi.useFakeTimers(); // Restore fake timers
  });

  it('transitions from running to cooling when boiling is complete', async () => {
    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
      result.current.startTimer();
    });

    const totalTime = result.current.state.totalTime;

    // Advance to completion
    act(() => {
      vi.advanceTimersByTime(totalTime * 1000);
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('cooling');
    });
  });

  it('increments cooling time when in cooling status', async () => {
    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
      result.current.startTimer();
    });

    const totalTime = result.current.state.totalTime;

    // Complete boiling
    act(() => {
      vi.advanceTimersByTime(totalTime * 1000);
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('cooling');
    });

    expect(result.current.state.coolingElapsed).toBe(0);

    // Advance cooling by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(result.current.state.coolingElapsed).toBe(5);
    });
  });

  it('transitions from cooling to complete after 120 seconds', async () => {
    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
      result.current.startTimer();
    });

    const totalTime = result.current.state.totalTime;

    // Complete boiling and cooling (totalTime + 120 seconds)
    act(() => {
      vi.advanceTimersByTime((totalTime + 120) * 1000);
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('complete');
    });
  });

  it('restores eggs from storage', () => {
    const { result } = renderHook(() => useEggTimer());

    const savedEggs: Egg[] = [
      {
        id: 'saved-1',
        weight: 50,
        doneness: 'medium',
        temperature: 'refrigerated',
      },
      {
        id: 'saved-2',
        weight: 60,
        doneness: 'hard',
        temperature: 'refrigerated',
      },
    ];

    act(() => {
      result.current.restoreEggs(savedEggs);
    });

    expect(result.current.state.eggs).toHaveLength(2);
    expect(result.current.state.eggs).toEqual(savedEggs);
    expect(result.current.state.timings).toHaveLength(2);
  });

  it('does not restore eggs when timer is not idle', () => {
    const { result } = renderHook(() => useEggTimer());

    const egg: Egg = {
      id: 'egg-1',
      weight: 50,
      doneness: 'medium',
      temperature: 'refrigerated',
    };

    act(() => {
      result.current.addEgg(egg);
      result.current.startTimer();
    });

    const savedEggs: Egg[] = [
      {
        id: 'saved-1',
        weight: 60,
        doneness: 'hard',
        temperature: 'refrigerated',
      },
    ];

    act(() => {
      result.current.restoreEggs(savedEggs);
    });

    // Should still have the original egg, not the restored one
    expect(result.current.state.eggs).toHaveLength(1);
    expect(result.current.state.eggs[0].id).toBe('egg-1');
  });
});

describe('formatTime', () => {
  it('formats 0 seconds correctly', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds under 1 minute correctly', () => {
    expect(formatTime(30)).toBe('00:30');
    expect(formatTime(59)).toBe('00:59');
  });

  it('formats exactly 1 minute correctly', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  it('formats minutes and seconds correctly', () => {
    expect(formatTime(90)).toBe('01:30');
    expect(formatTime(125)).toBe('02:05');
    expect(formatTime(305)).toBe('05:05');
  });

  it('formats large times (over 10 minutes) correctly', () => {
    expect(formatTime(600)).toBe('10:00');
    expect(formatTime(725)).toBe('12:05');
    expect(formatTime(3599)).toBe('59:59');
  });

  it('pads single digits with zero', () => {
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(123)).toBe('02:03');
  });
});

describe('getEggsToAddNow', () => {
  it('returns empty array when no eggs match current time', () => {
    const timings = [
      { eggId: 'egg-1', boilTime: 400, addAtSecond: 0 },
      { eggId: 'egg-2', boilTime: 300, addAtSecond: 100 },
    ];

    const result = getEggsToAddNow(timings, 50);
    expect(result).toEqual([]);
  });

  it('returns eggs that should be added at current time', () => {
    const timings = [
      { eggId: 'egg-1', boilTime: 400, addAtSecond: 0 },
      { eggId: 'egg-2', boilTime: 300, addAtSecond: 100 },
      { eggId: 'egg-3', boilTime: 200, addAtSecond: 200 },
    ];

    const result = getEggsToAddNow(timings, 100);
    expect(result).toHaveLength(1);
    expect(result[0].eggId).toBe('egg-2');
  });

  it('returns multiple eggs if they should be added at same time', () => {
    const timings = [
      { eggId: 'egg-1', boilTime: 300, addAtSecond: 0 },
      { eggId: 'egg-2', boilTime: 300, addAtSecond: 0 },
      { eggId: 'egg-3', boilTime: 200, addAtSecond: 100 },
    ];

    const result = getEggsToAddNow(timings, 0);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.eggId)).toContain('egg-1');
    expect(result.map((t) => t.eggId)).toContain('egg-2');
  });
});

describe('getBoilingTimeRemaining', () => {
  it('calculates remaining time correctly', () => {
    expect(getBoilingTimeRemaining(300, 100)).toBe(200);
    expect(getBoilingTimeRemaining(500, 250)).toBe(250);
  });

  it('returns 0 when elapsed equals total', () => {
    expect(getBoilingTimeRemaining(300, 300)).toBe(0);
  });

  it('returns 0 when elapsed exceeds total', () => {
    expect(getBoilingTimeRemaining(300, 350)).toBe(0);
  });

  it('handles zero total time', () => {
    expect(getBoilingTimeRemaining(0, 0)).toBe(0);
  });
});

describe('getCoolingTimeRemaining', () => {
  it('calculates remaining cooling time correctly', () => {
    expect(getCoolingTimeRemaining(0)).toBe(120);
    expect(getCoolingTimeRemaining(30)).toBe(90);
    expect(getCoolingTimeRemaining(60)).toBe(60);
  });

  it('returns 0 when cooling is complete', () => {
    expect(getCoolingTimeRemaining(120)).toBe(0);
  });

  it('returns 0 when cooling exceeds 120 seconds', () => {
    expect(getCoolingTimeRemaining(150)).toBe(0);
  });
});
