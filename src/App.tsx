import { useEffect, useState, useRef } from 'react';
import './App.css';
import { useEggTimer } from './hooks/useEggTimer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { useWakeLock } from './hooks/useWakeLock';
import { getActiveNotifications } from './core/notificationScheduler';
import { EggForm } from './components/EggForm';
import { EggList } from './components/EggList';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import {
  NotificationBanner,
  NotificationBannerRef,
} from './components/NotificationBanner';

function App() {
  const {
    state,
    addEgg,
    removeEgg,
    removeAllEggs,
    startTimer,
    pauseTimer,
    resetTimer,
    restoreEggs,
    restoreTimerState,
  } = useEggTimer();

  const { permission, requestPermission, sendNotification } =
    useNotifications();

  // Keep screen awake when timer is running or cooling
  const shouldStayAwake =
    state.status === 'running' || state.status === 'cooling';
  useWakeLock(shouldStayAwake);

  // Persist banner dismissal in localStorage
  const [dismissedPermissionBanner, setDismissedPermissionBanner] = useState(
    () => {
      try {
        const stored = localStorage.getItem('notification-banner-dismissed');
        return stored === 'true';
      } catch {
        return false;
      }
    }
  );

  // Save dismissal state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'notification-banner-dismissed',
        String(dismissedPermissionBanner)
      );
    } catch (error) {
      console.error('Failed to save banner dismissal state:', error);
    }
  }, [dismissedPermissionBanner]);

  const notificationBannerRef = useRef<NotificationBannerRef>(null);

  // Integrate localStorage persistence
  useLocalStorage({
    eggs: state.eggs,
    status: state.status,
    elapsedSeconds: state.elapsedSeconds,
    coolingElapsed: state.coolingElapsed,
    restoreEggs,
    restoreTimerState,
  });

  // Calculate active notifications based on current state
  const notifications = getActiveNotifications(
    state.timings,
    state.elapsedSeconds,
    state.totalTime,
    state.coolingElapsed,
    state.status
  );

  // Send browser notifications when there are active notifications
  // This effect only triggers notifications (side effect), doesn't update state
  useEffect(() => {
    if (notifications.length > 0) {
      notifications.forEach((notification) => {
        sendNotification(notification);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.elapsedSeconds,
    state.coolingElapsed,
    state.status,
    // We intentionally don't include 'notifications' to avoid triggering
    // on every render. We only want to send notifications when timer state changes.
    sendNotification,
  ]);

  // Auto-dismiss banner if permission is granted or denied
  useEffect(() => {
    if (permission !== 'default') {
      setDismissedPermissionBanner(true);
    }
  }, [permission]);

  // Show permission banner if permission is default and not dismissed
  const showPermissionBanner =
    permission === 'default' && !dismissedPermissionBanner;

  const handleRequestPermission = async () => {
    await requestPermission();
    // Banner will be auto-dismissed when permission changes
  };

  const handleDismissPermissionBanner = () => {
    setDismissedPermissionBanner(true);
  };

  const handleRemoveAllEggs = () => {
    removeAllEggs();
    notificationBannerRef.current?.clearAll();
  };

  // Determine if controls should be disabled
  const isTimerActive =
    state.status === 'running' || state.status === 'cooling';

  return (
    <div className="app">
      <header className="app-header">
        <h1>🥚 Egg Timer</h1>
        <p className="app-subtitle">Perfect eggs every time</p>

        {showPermissionBanner && permission === 'default' && (
          <div className="permission-banner">
            <p>Enable notifications to be alerted when to add eggs!</p>
            {!window.isSecureContext && (
              <p className="warning-text" style={{ fontSize: '0.9em' }}>
                ⚠️ Notifications may not work over HTTP. For full support, use
                HTTPS.
              </p>
            )}
            <div className="permission-buttons">
              <button onClick={handleRequestPermission} className="btn-primary">
                Enable Notifications
              </button>
              <button
                onClick={handleDismissPermissionBanner}
                className="btn-secondary"
              >
                Not Now
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="app-main">
        <NotificationBanner
          ref={notificationBannerRef}
          notifications={notifications}
        />

        <div className="app-layout">
          <section className="input-section">
            <EggForm onAddEgg={addEgg} disabled={isTimerActive} />

            <EggList
              eggs={state.eggs}
              timings={state.timings}
              totalTime={state.totalTime}
              onRemoveEgg={removeEgg}
              disabled={isTimerActive}
              elapsedSeconds={state.elapsedSeconds}
            />
          </section>

          <section className="timer-section">
            <TimerDisplay state={state} />

            <TimerControls
              state={state}
              onStart={startTimer}
              onPause={pauseTimer}
              onReset={resetTimer}
              onRemoveAllEggs={handleRemoveAllEggs}
            />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Notification permission:{' '}
          <strong>
            {permission === 'granted'
              ? '✓ Enabled'
              : permission === 'denied'
                ? '✗ Denied'
                : '○ Not set'}
          </strong>
        </p>
      </footer>
    </div>
  );
}

export default App;
