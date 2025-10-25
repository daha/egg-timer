import { describe, it, expect } from 'vitest';
import { getActiveNotifications } from '../../src/core/notificationScheduler';
import { EggTiming, TimerState } from '../../src/types';

describe('notificationScheduler', () => {
  describe('getActiveNotifications', () => {
    const mockTimings: EggTiming[] = [
      { eggId: 'egg1', boilTime: 400, addAtSecond: 0 },
      { eggId: 'egg2', boilTime: 350, addAtSecond: 50 },
      { eggId: 'egg3', boilTime: 300, addAtSecond: 100 },
    ];

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

    it('should return "add egg" notification when elapsed time matches addAtSecond', () => {
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

    it('should return "boiling done" notification when timer reaches total time', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        400, // elapsedSeconds - matches totalTime
        400, // totalTime
        0,
        'running'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'boiling_done',
        message: 'All eggs are done boiling! Move them to cold water.',
      });
    });

    it('should not return "boiling done" when status is not running', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        0,
        'cooling' // status is cooling, not running
      );

      expect(notifications).toEqual([]);
    });

    it('should return "cooling done" notification when cooling elapsed is 120 seconds', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        120, // coolingElapsed - 2 minutes
        'cooling'
      );

      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toEqual({
        type: 'cooling_done',
        message: 'Cooling complete! Your eggs are ready.',
      });
    });

    it('should not return "cooling done" when status is not cooling', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        120,
        'running' // status is running, not cooling
      );

      // Should only return boiling_done, not cooling_done
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('boiling_done');
    });

    it('should handle multiple simultaneous notifications', () => {
      // If somehow an egg needs to be added at the same time boiling is done
      const timings: EggTiming[] = [
        { eggId: 'egg1', boilTime: 400, addAtSecond: 400 },
      ];

      const notifications = getActiveNotifications(
        timings,
        400,
        400,
        0,
        'running'
      );

      expect(notifications).toHaveLength(2);
      expect(notifications.map((n) => n.type)).toContain('add_egg');
      expect(notifications.map((n) => n.type)).toContain('boiling_done');
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

    it('should not trigger cooling done before 120 seconds', () => {
      const notifications = getActiveNotifications(
        mockTimings,
        400,
        400,
        119, // One second before cooling done
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
