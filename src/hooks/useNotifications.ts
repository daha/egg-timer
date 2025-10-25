import { useState } from 'react';

export type NotificationType = 'add_egg' | 'boiling_done' | 'cooling_done';

export interface Notification {
  type: NotificationType;
  message: string;
  eggId?: string;
}

function getInitialPermission(): 'default' | 'granted' | 'denied' {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission as 'default' | 'granted' | 'denied';
  }
  return 'default';
}

export function useNotifications() {
  const [permission, setPermission] = useState<
    'default' | 'granted' | 'denied'
  >(getInitialPermission());

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
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

    // Play sound
    playSound();
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
