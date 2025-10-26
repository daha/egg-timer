import { useEffect, useState } from 'react';
import './App.css';
import { useEggTimer } from './hooks/useEggTimer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { getActiveNotifications } from './core/notificationScheduler';
import { EggForm } from './components/EggForm';
import { EggList } from './components/EggList';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { NotificationBanner } from './components/NotificationBanner';

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
  } = useEggTimer();

  const { permission, requestPermission, sendNotification } =
    useNotifications();

  const [dismissedPermissionBanner, setDismissedPermissionBanner] =
    useState(false);

  // Integrate localStorage persistence
  useLocalStorage({
    eggs: state.eggs,
    status: state.status,
    restoreEggs,
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

  // Show permission banner if permission is default and not dismissed
  const showPermissionBanner =
    permission === 'default' && !dismissedPermissionBanner;

  const handleRequestPermission = async () => {
    await requestPermission();
    setDismissedPermissionBanner(true);
  };

  const handleDismissPermissionBanner = () => {
    setDismissedPermissionBanner(true);
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
        <NotificationBanner notifications={notifications} />

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
              onRemoveAllEggs={removeAllEggs}
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
