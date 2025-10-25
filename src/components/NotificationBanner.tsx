import { useEffect, useState, useRef } from 'react';
import { Notification } from '../hooks/useNotifications';

interface NotificationBannerProps {
  notifications: Notification[];
}

interface DisplayNotification extends Notification {
  id: number;
}

export function NotificationBanner({ notifications }: NotificationBannerProps) {
  const [displayNotifications, setDisplayNotifications] = useState<
    DisplayNotification[]
  >([]);
  const notificationCountRef = useRef(0);

  // Add new notifications when the notifications prop changes
  useEffect(() => {
    if (notifications.length === 0) return;

    // Create display notifications with unique IDs using queueMicrotask to avoid
    // synchronous setState in effect
    const newNotifications: DisplayNotification[] = notifications.map(
      (notif) => ({
        ...notif,
        id: ++notificationCountRef.current,
      })
    );

    // Queue the state update to happen after the current render cycle
    window.queueMicrotask(() => {
      setDisplayNotifications((prev) => [...prev, ...newNotifications]);
    });

    // Set up auto-dismiss timers
    const timers = newNotifications.map((notif) =>
      window.setTimeout(() => {
        setDisplayNotifications((prev) =>
          prev.filter((n) => n.id !== notif.id)
        );
      }, 5000)
    );

    // Cleanup timers on unmount or when effect re-runs
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [notifications]);

  const handleDismiss = (id: number) => {
    setDisplayNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (displayNotifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-banner-container">
      {displayNotifications.map((notif) => (
        <div
          key={notif.id}
          className={`notification-banner notification-${notif.type}`}
        >
          <div className="notification-content">
            <span className="notification-icon">
              {notif.type === 'add_egg' && '🥚'}
              {notif.type === 'boiling_done' && '✅'}
              {notif.type === 'cooling_done' && '🎉'}
            </span>
            <span className="notification-message">{notif.message}</span>
          </div>
          <button
            className="notification-dismiss"
            onClick={() => handleDismiss(notif.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
