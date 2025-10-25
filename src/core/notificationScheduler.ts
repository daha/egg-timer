import { EggTiming, TimerState } from '../types';
import { Notification } from '../hooks/useNotifications';

export function getActiveNotifications(
  timings: EggTiming[],
  elapsedSeconds: number,
  totalTime: number,
  coolingElapsed: number,
  status: TimerState['status']
): Notification[] {
  const notifications: Notification[] = [];

  // Check for "add egg" notifications
  timings.forEach((timing) => {
    if (elapsedSeconds === timing.addAtSecond) {
      const eggNumber = timings.findIndex((t) => t.eggId === timing.eggId) + 1;
      notifications.push({
        type: 'add_egg',
        message: `Add egg #${eggNumber} to the pot now!`,
        eggId: timing.eggId,
      });
    }
  });

  // Check for "boiling done" notification
  if (status === 'running' && elapsedSeconds === totalTime) {
    notifications.push({
      type: 'boiling_done',
      message: 'All eggs are done boiling! Move them to cold water.',
    });
  }

  // Check for "cooling done" notification
  if (status === 'cooling' && coolingElapsed === 120) {
    notifications.push({
      type: 'cooling_done',
      message: 'Cooling complete! Your eggs are ready.',
    });
  }

  return notifications;
}
