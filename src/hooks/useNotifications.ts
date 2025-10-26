import { useState, useEffect } from 'react';

export type NotificationType = 'add_egg' | 'boiling_done' | 'cooling_done';

export interface Notification {
  type: NotificationType;
  message: string;
  eggId?: string;
}

function getInitialPermission(): 'default' | 'granted' | 'denied' {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const permission = Notification.permission as
      | 'default'
      | 'granted'
      | 'denied';
    console.log('Initial notification permission:', permission);
    return permission;
  }
  console.log('Notification API not available');
  return 'default';
}

export function useNotifications() {
  const [permission, setPermission] = useState<
    'default' | 'granted' | 'denied'
  >(getInitialPermission());

  // Poll for permission changes (especially important for iOS Safari)
  useEffect(() => {
    if (!('Notification' in window)) {
      console.log('Notifications API not supported');
      return;
    }

    // Set up polling to detect permission changes
    // iOS Safari may not trigger events or sync state immediately, so we poll
    const checkPermission = () => {
      const currentPermission = Notification.permission as
        | 'default'
        | 'granted'
        | 'denied';
      console.log('Checking notification permission:', currentPermission);
      setPermission(currentPermission);
    };

    // Check immediately on mount
    checkPermission();

    // Then poll every second to detect changes
    const intervalId = setInterval(checkPermission, 1000);

    return () => {
      console.log('Cleaning up notification permission polling');
      clearInterval(intervalId);
    };
    // Empty deps - we want this effect to run once on mount and set up polling
    // The interval will continuously sync the latest permission state
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.error('Notifications not supported in this browser');
      // Type assertion needed because TypeScript narrows window to never in this block
      (window as Window).alert(
        'Notifications are not supported in this browser'
      );
      return 'denied';
    }

    console.log(
      'Requesting notification permission, current:',
      Notification.permission
    );

    // Check if we're in a secure context (required for iOS Safari)
    const isSecureContext = window.isSecureContext;
    console.log('Is secure context:', isSecureContext);

    if (!isSecureContext) {
      console.warn(
        'Not in secure context (HTTPS or localhost). iOS Safari may not support notifications.'
      );
    }

    try {
      const result = await Notification.requestPermission();
      console.log('Permission request result:', result);
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      window.alert(
        'Failed to request notification permission. This may not be supported on your device/browser over HTTP.'
      );
      return 'denied';
    }
  };

  const sendNotification = (notification: Notification) => {
    // Browser notification
    if (permission === 'granted' && 'Notification' in window) {
      new Notification('Egg Timer', {
        body: notification.message,
        icon: '/egg-timer/favicon.ico',
        badge: '/egg-timer/favicon.ico',
      });
    }

    // Play sound - use loud alert for boiling_done and cooling_done
    if (
      notification.type === 'boiling_done' ||
      notification.type === 'cooling_done'
    ) {
      playLoudAlert();
    } else {
      playSound();
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
  };
}

function playSound() {
  // Try to play MP3 file first
  const audio = new Audio('/egg-timer/sounds/notification.mp3');
  audio.play().catch(() => {
    // Fallback to Web Audio API generated beep
    playBeep();
  });
}

function playBeep() {
  try {
    type AudioContextConstructor = new () => AudioContext;

    const win = window as Window & {
      AudioContext?: AudioContextConstructor;
      webkitAudioContext?: AudioContextConstructor;
    };

    const AudioContextClass = win.AudioContext || win.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported');
    }
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a pleasant two-tone notification sound
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.15
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);

    // Second tone
    window.setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      oscillator2.frequency.value = 1000;
      oscillator2.type = 'sine';

      gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15
      );

      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.15);
    }, 100);
  } catch (error) {
    console.error('Failed to play beep sound:', error);
  }
}

function playLoudAlert() {
  try {
    type AudioContextConstructor = new () => AudioContext;

    const win = window as Window & {
      AudioContext?: AudioContextConstructor;
      webkitAudioContext?: AudioContextConstructor;
    };

    const AudioContextClass = win.AudioContext || win.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported');
    }
    const audioContext = new AudioContextClass();

    // Play a sequence of 3 loud beeps to get attention
    const frequencies = [880, 1046, 1318]; // A5, C6, E6 (pleasant chord)
    const delays = [0, 300, 600]; // Staggered timing

    frequencies.forEach((freq, index) => {
      window.setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        // Louder volume (0.5 instead of 0.3)
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }, delays[index]);
    });
  } catch (error) {
    console.error('Failed to play loud alert sound:', error);
  }
}
