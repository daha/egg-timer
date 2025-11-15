import { describe, it, expect, beforeEach } from 'vitest';
import {
  getActiveNotifications,
  COOLING_TIME_SECONDS,
  resetNotificationState,
} from '../../src/core/notificationScheduler';
import { EggTiming, TimerState } from '../../src/types';

describe('notificationScheduler', () => {
  describe('getActiveNotifications', () => {
    const mockTimings: EggTiming[] = [
      { eggId: 'egg1', boilTime: 400, addAtSecond: 0 },
      { eggId: 'egg2', boilTime: 350, addAtSecond: 50 },
      { eggId: 'egg3', boilTime: 300, addAtSecond: 100 },
    ];

    // Reset notification state before each test
    beforeEach(() => {
      resetNotificationState();
    });

    it('should return empty array when no notifications are due', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        30, // elapsedSeconds
        400, // totalTime
        0, // coolingElapsed
        'running' // status
      );

      expect(notifications).toEqual([]);
    });

    it('should return "add egg" notification when elapsed time matches or exceeds addAtSecond', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        0, // elapsedSeconds - matches egg1
        400,
        0,
        'running'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'add_egg',
        message: 'Add egg #1 to the pot now!',
        eggId: 'egg1',
      });
    });

    it('should return "add egg" notification even if timer skips past addAtSecond', () => {
      // First, simulate being at second 49
      getActiveNotifications(mockTimings, 49, 400, 0, 'running');

      // Then skip to second 52 (missing 50 and 51)
      const notifications = getActiveNotifications(
        mockTimings,
        52, // elapsedSeconds - skipped past egg2's addAtSecond of 50
        400,
        0,
        'running'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'add_egg',
        message: 'Add egg #2 to the pot now!',
        eggId: 'egg2',
      });
    });

    it('should not send duplicate notifications for same egg', () => {
      // First call at exact second
      let notifications = getActiveNotifications(
        mockTimings,
        50,
        400,
        0,
        'running'
      );
      expect(notifications).toHaveLength(1);

      // Second call at same second (e.g., rapid re-render)
      notifications = getActiveNotifications(
        mockTimings,
        50,
        400,
        0,
        'running'
      );
      expect(notifications).toHaveLength(0);

      // Third call after the second (should still not notify)
      notifications = getActiveNotifications(
        mockTimings,
        51,
        400,
        0,
        'running'
      );
      expect(notifications).toHaveLength(0);
    });

    it('should return notification for second egg when its time comes', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        50, // elapsedSeconds - matches egg2
        400,
        0,
        'running'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'add_egg',
        message: 'Add egg #2 to the pot now!',
        eggId: 'egg2',
      });
    });

    it('should return notification for third egg when its time comes', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        100, // elapsedSeconds - matches egg3
        400,
        0,
        'running'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'add_egg',
        message: 'Add egg #3 to the pot now!',
        eggId: 'egg3',
      });
    });

    it('should return "boiling done" notification when transitioning to cooling', () => {
      // First, simulate being in running state
      getActiveNotifications(mockTimings, 399, 400, 0, 'running');

      // Now transition to cooling (this is when boiling completes)
      const notifications = getActiveNotifications(
        mockTimings,
        400, // elapsedSeconds - matches totalTime
        400, // totalTime
        0, // coolingElapsed
        'cooling' // status transitions to cooling
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'boiling_done',
        message: 'All eggs are done boiling! Move them to cold water.',
      });
    });

    it('should not return "boiling done" when already in cooling state', () => {
      // Simulate already being in cooling state (not transitioning)
      getActiveNotifications(mockTimings, 400, 400, 0, 'cooling');

      // Call again while still in cooling
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        1, // coolingElapsed has progressed
        'cooling'
      );

      expect(notifications).toEqual([]);
    });

    it('should not return "add egg" notification when status is idle', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        0, // elapsedSeconds matches egg1's addAtSecond
        400,
        0,
        'idle' // status is idle, not running
      );

      expect(notifications).toEqual([]);
    });

    it('should fire "add egg" notification when timer starts (transitions from idle to running)', () => {
      // Simulate adding an egg while timer is idle
      let notifications = getActiveNotifications(
        mockTimings,
        0,
        400,
        0,
        'idle'
      );
      expect(notifications).toEqual([]); // No notification while idle

      // Now start the timer - should fire notification for first egg
      notifications = getActiveNotifications(mockTimings, 0, 400, 0, 'running');

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'add_egg',
        message: 'Add egg #1 to the pot now!',
        eggId: 'egg1',
      });
    });

    it('should fire "boiling done" notification correctly after idle transition', () => {
      // Simulate being idle first
      getActiveNotifications(mockTimings, 0, 400, 0, 'idle');

      // Start timer
      getActiveNotifications(mockTimings, 0, 400, 0, 'running');

      // Progress to near the end
      getActiveNotifications(mockTimings, 399, 400, 0, 'running');

      // Transition to cooling (boiling complete)
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        0,
        'cooling' // Status transitions to cooling when boiling completes
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'boiling_done',
        message: 'All eggs are done boiling! Move them to cold water.',
      });
    });

    it(`should return "cooling done" notification when cooling elapsed is ${COOLING_TIME_SECONDS} seconds`, () => {
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        COOLING_TIME_SECONDS, // coolingElapsed
        'cooling'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'cooling_done',
        message: 'Cooling complete! Your eggs are ready.',
      });
    });

    it('should return "cooling done" notification even if timer skips past the exact second', () => {
      // First, simulate being just before the threshold
      getActiveNotifications(
        mockTimings,
        400,
        400,
        COOLING_TIME_SECONDS - 1,
        'cooling'
      );

      // Then skip past the threshold
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        COOLING_TIME_SECONDS + 2, // Skip 2 seconds past
        'cooling'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'cooling_done',
        message: 'Cooling complete! Your eggs are ready.',
      });
    });

    it('should not return "cooling done" when status is not cooling', () => {
      // First setup: transition to cooling to trigger boiling_done
      getActiveNotifications(mockTimings, 399, 400, 0, 'running');
      getActiveNotifications(mockTimings, 400, 400, 0, 'cooling');

      // Now check that cooling_done doesn't fire when going back to running
      // (This is a hypothetical scenario to test the status check)
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        COOLING_TIME_SECONDS,
        'running' // status is running, not cooling
      );

      // Should not return cooling_done since status is not cooling
      expect(notifications).toEqual([]);
    });

    it('should handle boiling done notification on transition to cooling', () => {
      // Simulate timer running then transitioning to cooling
      const timings: EggTiming[] = [
        { eggId: 'egg1', boilTime: 400, addAtSecond: 0 },
      ];

      // First, start the timer
      getActiveNotifications(timings, 0, 400, 0, 'running');

      // Then progress to near end
      getActiveNotifications(timings, 399, 400, 0, 'running');

      // Finally, transition to cooling
      const notifications = getActiveNotifications(
        timings,
        400,
        400,
        0,
        'cooling'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('boiling_done');
    });

    it('should handle empty timings array', () => {
      const notifications = getActiveNotifications(
        [],
        0,
        0,
        0,
        'idle' as TimerState['status']
      );

      expect(notifications).toEqual([]);
    });

    it('should handle single egg scenario', () => {
      const singleEgg: EggTiming[] = [
        { eggId: 'egg1', boilTime: 300, addAtSecond: 0 },
      ];

      const notifications = getActiveNotifications(
        singleEgg,
        0,
        300,
        0,
        'running'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'add_egg',
        message: 'Add egg #1 to the pot now!',
        eggId: 'egg1',
      });
    });

    it(`should not trigger cooling done before ${COOLING_TIME_SECONDS} seconds`, () => {
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        COOLING_TIME_SECONDS - 1, // One second before cooling done
        'cooling'
      );

      expect(notifications).toEqual([]);
    });

    it('should not trigger boiling done before total time', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        399, // One second before total time
        400,
        0,
        'running'
      );

      expect(notifications).toEqual([]);
    });
  });
});
