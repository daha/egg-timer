import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useNotifications,
  Notification as AppNotification,
} from '../../src/hooks/useNotifications';

/* eslint-disable @typescript-eslint/no-unused-vars */
describe('useNotifications', () => {
  // Mock the browser Notification API
  const mockNotificationConstructor = vi.fn(function (
    this: unknown,
    _title: string,
    _options?: unknown
  ) {
    // Mock constructor implementation
  });
  const mockRequestPermission = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset Notification mock
    Object.defineProperty(global, 'Notification', {
      writable: true,
      configurable: true,
      value: mockNotificationConstructor,
    });

    global.Notification.permission = 'default';
    global.Notification.requestPermission = mockRequestPermission;

    // Mock Audio - needs to be a proper constructor too

    global.Audio = vi.fn(function (this: unknown, _src: string) {
      this.play = vi.fn().mockResolvedValue(undefined);
    }) as unknown as typeof Audio;
  });

  it('initializes with default permission when Notification API available', () => {
    global.Notification.permission = 'default';

    const { result } = renderHook(() => useNotifications());

    expect(result.current.permission).toBe('default');
  });

  it('initializes with granted permission when already granted', () => {
    global.Notification.permission = 'granted';

    const { result } = renderHook(() => useNotifications());

    expect(result.current.permission).toBe('granted');
  });

  it('initializes with denied permission when denied', () => {
    global.Notification.permission = 'denied';

    const { result } = renderHook(() => useNotifications());

    expect(result.current.permission).toBe('denied');
  });

  it('requests notification permission successfully', async () => {
    mockRequestPermission.mockResolvedValue('granted');

    const { result } = renderHook(() => useNotifications());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestPermission();
    });

    expect(mockRequestPermission).toHaveBeenCalled();
    expect(permissionResult).toBe('granted');
    expect(result.current.permission).toBe('granted');
  });

  it('handles denied permission request', async () => {
    mockRequestPermission.mockResolvedValue('denied');

    const { result } = renderHook(() => useNotifications());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestPermission();
    });

    expect(mockRequestPermission).toHaveBeenCalled();
    expect(permissionResult).toBe('denied');
    expect(result.current.permission).toBe('denied');
  });

  it('sends browser notification when permission is granted', () => {
    global.Notification.permission = 'granted';
    mockNotificationConstructor.mockImplementation(function (
      this: unknown,
      __title: string,
      _options?: unknown
    ) {});

    const { result } = renderHook(() => useNotifications());

    const notification: AppNotification = {
      type: 'add_egg',
      message: 'Add egg now!',
      eggId: 'egg-1',
    };

    act(() => {
      result.current.sendNotification(notification);
    });

    expect(mockNotificationConstructor).toHaveBeenCalledWith('Egg Timer', {
      body: 'Add egg now!',
      icon: '/egg-timer/favicon.ico',
      badge: '/egg-timer/favicon.ico',
    });
  });

  it('does not send browser notification when permission is denied', () => {
    global.Notification.permission = 'denied';

    const { result } = renderHook(() => useNotifications());

    const notification: AppNotification = {
      type: 'add_egg',
      message: 'Add egg now!',
    };

    act(() => {
      result.current.sendNotification(notification);
    });

    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it('does not send browser notification when permission is default', () => {
    global.Notification.permission = 'default';

    const { result } = renderHook(() => useNotifications());

    const notification: AppNotification = {
      type: 'boiling_done',
      message: 'Boiling complete!',
    };

    act(() => {
      result.current.sendNotification(notification);
    });

    expect(mockNotificationConstructor).not.toHaveBeenCalled();
  });

  it('plays sound when sending notification', () => {
    const mockPlay = vi.fn().mockResolvedValue(undefined);
    global.Audio = vi.fn(function (this: unknown, __src: string) {
      this.play = mockPlay;
    }) as unknown as typeof Audio;

    global.Notification.permission = 'granted';

    const { result } = renderHook(() => useNotifications());

    const notification: AppNotification = {
      type: 'add_egg',
      message: 'Add egg now!',
    };

    act(() => {
      result.current.sendNotification(notification);
    });

    expect(global.Audio).toHaveBeenCalledWith(
      '/egg-timer/sounds/notification.mp3'
    );
    expect(mockPlay).toHaveBeenCalled();
  });

  it('plays sound even when notification permission is denied', () => {
    const mockPlay = vi.fn().mockResolvedValue(undefined);
    global.Audio = vi.fn(function (this: unknown, __src: string) {
      this.play = mockPlay;
    }) as unknown as typeof Audio;

    global.Notification.permission = 'denied';

    const { result } = renderHook(() => useNotifications());

    const notification: AppNotification = {
      type: 'add_egg',
      message: 'Add egg!',
    };

    act(() => {
      result.current.sendNotification(notification);
    });

    // Notification should not be created
    expect(mockNotificationConstructor).not.toHaveBeenCalled();

    // But sound should still play
    expect(mockPlay).toHaveBeenCalled();
  });

  it('sends notification with different types correctly', () => {
    global.Notification.permission = 'granted';
    mockNotificationConstructor.mockImplementation(function (
      this: unknown,
      __title: string,
      _options?: unknown
    ) {});

    const { result } = renderHook(() => useNotifications());

    const notifications: AppNotification[] = [
      { type: 'add_egg', message: 'Add egg 1', eggId: 'egg-1' },
      { type: 'boiling_done', message: 'Boiling done' },
      { type: 'cooling_done', message: 'Cooling done' },
    ];

    notifications.forEach((notification) => {
      act(() => {
        result.current.sendNotification(notification);
      });

      expect(mockNotificationConstructor).toHaveBeenCalledWith('Egg Timer', {
        body: notification.message,
        icon: '/egg-timer/favicon.ico',
        badge: '/egg-timer/favicon.ico',
      });

      mockNotificationConstructor.mockClear();
    });
  });

  it('returns denied when Notification API is not available', async () => {
    // Remove Notification API from window check
    delete (global as Record<string, unknown>).Notification;

    const { result } = renderHook(() => useNotifications());

    let permissionResult;
    await act(async () => {
      permissionResult = await result.current.requestPermission();
    });

    expect(permissionResult).toBe('denied');
  });

  it('handles audio play errors gracefully', () => {
    const mockPlay = vi.fn().mockRejectedValue(new Error('Audio play failed'));
    global.Audio = vi.fn(function (this: unknown, __src: string) {
      this.play = mockPlay;
    }) as unknown as typeof Audio;

    global.Notification.permission = 'granted';

    const { result } = renderHook(() => useNotifications());

    const notification: AppNotification = {
      type: 'add_egg',
      message: 'Test',
    };

    // Should not throw
    expect(() => {
      act(() => {
        result.current.sendNotification(notification);
      });
    }).not.toThrow();
  });
});
