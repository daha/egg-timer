import { useState, useEffect, useRef } from 'react';

export type NotificationType = 'add_egg' | 'boiling_done' | 'cooling_done';

export interface Notification {
  type: NotificationType;
  message: string;
  eggId?: string;
}

// Detect if running on iOS
function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
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
  const [audioReady, setAudioReady] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on user interaction (required for iOS)
  const initializeAudio = () => {
    if (audioReady) return true;

    try {
      type AudioContextConstructor = new () => AudioContext;
      const win = window as Window & {
        AudioContext?: AudioContextConstructor;
        webkitAudioContext?: AudioContextConstructor;
      };

      const AudioContextClass = win.AudioContext || win.webkitAudioContext;
      if (!AudioContextClass) {
        console.log('AudioContext not supported');
        return false;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
        console.log('AudioContext created');
      }

      // Resume audio context if suspended (common on iOS)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('AudioContext resumed');
          setAudioReady(true);
        });
      } else {
        setAudioReady(true);
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  };

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

    // Vibration for mobile devices (works on iOS in some contexts)
    if ('vibrate' in navigator) {
      if (
        notification.type === 'boiling_done' ||
        notification.type === 'cooling_done'
      ) {
        // Long vibration pattern for important alerts
        navigator.vibrate([200, 100, 200, 100, 200]);
      } else {
        // Short vibration for add egg notifications
        navigator.vibrate(200);
      }
    }

    // Play sound - use loud alert for boiling_done and cooling_done
    if (
      notification.type === 'boiling_done' ||
      notification.type === 'cooling_done'
    ) {
      playLoudAlert(audioContextRef.current, audioReady);
    } else {
      playSound(audioContextRef.current, audioReady);
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    initializeAudio,
    audioReady,
    isIOS: isIOS(),
  };
}

function playSound(audioContext: AudioContext | null, audioReady: boolean) {
  // If audio is ready and we have a context, use it
  if (audioReady && audioContext) {
    playBeep(audioContext);
    return;
  }

  // Fallback: Try to play HTML5 audio (may not work on iOS without user interaction)
  try {
    const audio = new Audio('/egg-timer/sounds/notification.mp3');
    audio.play().catch((error) => {
      console.log('HTML5 audio playback failed:', error);
      // Try to create a new audio context as last resort
      playBeep(null);
    });
  } catch (error) {
    console.error('Failed to create audio element:', error);
  }
}

function playBeep(audioContext: AudioContext | null) {
  try {
    let context = audioContext;

    // If no context provided, try to create one
    if (!context) {
      type AudioContextConstructor = new () => AudioContext;
      const win = window as Window & {
        AudioContext?: AudioContextConstructor;
        webkitAudioContext?: AudioContextConstructor;
      };

      const AudioContextClass = win.AudioContext || win.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      context = new AudioContextClass();
    }

    // Resume context if suspended
    if (context.state === 'suspended') {
      context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Create a pleasant two-tone notification sound
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      context.currentTime + 0.15
    );

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.15);

    // Second tone
    window.setTimeout(() => {
      const oscillator2 = context!.createOscillator();
      const gainNode2 = context!.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(context!.destination);

      oscillator2.frequency.value = 1000;
      oscillator2.type = 'sine';

      gainNode2.gain.setValueAtTime(0.3, context!.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(
        0.01,
        context!.currentTime + 0.15
      );

      oscillator2.start(context!.currentTime);
      oscillator2.stop(context!.currentTime + 0.15);
    }, 100);
  } catch (error) {
    console.error('Failed to play beep sound:', error);
  }
}

function playLoudAlert(audioContext: AudioContext | null, audioReady: boolean) {
  try {
    let context = audioContext;

    // If no context provided or not ready, try to create one
    if (!audioReady || !context) {
      type AudioContextConstructor = new () => AudioContext;
      const win = window as Window & {
        AudioContext?: AudioContextConstructor;
        webkitAudioContext?: AudioContextConstructor;
      };

      const AudioContextClass = win.AudioContext || win.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported');
      }
      context = new AudioContextClass();
    }

    // Resume context if suspended
    if (context.state === 'suspended') {
      context.resume();
    }

    // Play a sequence of 3 loud beeps to get attention
    const frequencies = [880, 1046, 1318]; // A5, C6, E6 (pleasant chord)
    const delays = [0, 300, 600]; // Staggered timing

    frequencies.forEach((freq, index) => {
      window.setTimeout(() => {
        if (!context) return;

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'sine';

        // Louder volume (0.5 instead of 0.3)
        gainNode.gain.setValueAtTime(0.5, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          context.currentTime + 0.3
        );

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.3);
      }, delays[index]);
    });
  } catch (error) {
    console.error('Failed to play loud alert sound:', error);
  }
}
