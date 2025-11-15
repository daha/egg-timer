import { EggTiming, TimerState } from '../types';
import { Notification } from '../hooks/useNotifications';

// Cooling time in seconds (2.5 minutes)
const COOLING_TIME_SECONDS = 150;

// Track which notifications have been sent to avoid duplicates
const sentNotifications = new Set<string>();

// Track the last state to detect transitions
let lastElapsedSeconds = -1;
let lastCoolingElapsed = -1;
let lastStatus: TimerState['status'] = 'idle';

// Reset notification state (useful for tests and when timer truly resets)
export function resetNotificationState(): void {
  sentNotifications.clear();
  lastElapsedSeconds = -1;
  lastCoolingElapsed = -1;
  lastStatus = 'idle';
}

export function getActiveNotifications(
  timings: EggTiming[],
  elapsedSeconds: number,
  _totalTime: number, // Unused but kept for API consistency
  coolingElapsed: number,
  status: TimerState['status']
): Notification[] {
  const notifications: Notification[] = [];

  // Reset sent notifications when timer resets (status changes to idle from another state)
  if (status === 'idle' && lastStatus !== 'idle') {
    sentNotifications.clear();
  }

  // Reset tracking when timer starts (status changes from idle to running)
  // This ensures notifications fire correctly when timer starts
  if (status === 'running' && lastStatus === 'idle') {
    lastElapsedSeconds = -1;
    lastCoolingElapsed = -1;
  }

  // Check for "add egg" notifications
  // Fire when we cross the threshold (handles timer skips from iOS throttling)
  // On first call (lastElapsedSeconds === -1), only fire for exact matches
  // Only fire when timer is running
  timings.forEach((timing) => {
    const notificationKey = `add_egg_${timing.eggId}`;
    let shouldFire = false;

    if (lastElapsedSeconds === -1) {
      // First call: only fire for exact match
      shouldFire = elapsedSeconds === timing.addAtSecond;
    } else {
      // Subsequent calls: fire if we crossed the threshold
      shouldFire =
        elapsedSeconds >= timing.addAtSecond &&
        lastElapsedSeconds < timing.addAtSecond;
    }

    if (
      status === 'running' &&
      shouldFire &&
      !sentNotifications.has(notificationKey)
    ) {
      const eggNumber = timings.findIndex((t) => t.eggId === timing.eggId) + 1;
      notifications.push({
        type: 'add_egg',
        message: `Add egg #${eggNumber} to the pot now!`,
        eggId: timing.eggId,
      });
      sentNotifications.add(notificationKey);
    }
  });

  // Check for "boiling done" notification
  // Fire when we transition from running to cooling (boiling just completed)
  const boilingDoneKey = 'boiling_done';
  const justFinishedBoiling =
    status === 'cooling' &&
    lastStatus === 'running' &&
    !sentNotifications.has(boilingDoneKey);

  if (justFinishedBoiling) {
    notifications.push({
      type: 'boiling_done',
      message: 'All eggs are done boiling! Move them to cold water.',
    });
    sentNotifications.add(boilingDoneKey);
  }

  // Check for "cooling done" notification
  // Fire when we cross cooling time threshold
  const coolingDoneKey = 'cooling_done';
  let shouldFireCoolingDone = false;

  if (lastCoolingElapsed === -1) {
    shouldFireCoolingDone = coolingElapsed === COOLING_TIME_SECONDS;
  } else {
    shouldFireCoolingDone =
      coolingElapsed >= COOLING_TIME_SECONDS &&
      lastCoolingElapsed < COOLING_TIME_SECONDS;
  }

  if (
    status === 'cooling' &&
    shouldFireCoolingDone &&
    !sentNotifications.has(coolingDoneKey)
  ) {
    notifications.push({
      type: 'cooling_done',
      message: 'Cooling complete! Your eggs are ready.',
    });
    sentNotifications.add(coolingDoneKey);
  }

  // Update tracking
  lastElapsedSeconds = elapsedSeconds;
  lastCoolingElapsed = coolingElapsed;
  lastStatus = status;

  return notifications;
}

// Export for use in other modules
export { COOLING_TIME_SECONDS };
