import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWakeLock } from '../../src/hooks/useWakeLock';

describe('useWakeLock', () => {
  let mockWakeLockSentinel: {
    release: ReturnType<typeof vi.fn>;
    released: boolean;
    type: 'screen';
  };
  let mockWakeLock: {
    request: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Mock WakeLockSentinel
    mockWakeLockSentinel = {
      release: vi.fn().mockResolvedValue(undefined),
      released: false,
      type: 'screen',
    };

    // Mock WakeLock
    mockWakeLock = {
      request: vi.fn().mockResolvedValue(mockWakeLockSentinel),
    };

    // Mock navigator.wakeLock
    Object.defineProperty(navigator, 'wakeLock', {
      value: mockWakeLock,
      writable: true,
      configurable: true,
    });

    // Mock console methods to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should request wake lock when isActive is true', async () => {
    renderHook(() => useWakeLock(true));

    await waitFor(() => {
      expect(mockWakeLock.request).toHaveBeenCalledWith('screen');
    });
  });

  it('should not request wake lock when isActive is false', async () => {
    renderHook(() => useWakeLock(false));

    // Wait a bit to ensure no request is made
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockWakeLock.request).not.toHaveBeenCalled();
  });

  it('should release wake lock when isActive changes from true to false', async () => {
    const { rerender } = renderHook(({ active }) => useWakeLock(active), {
      initialProps: { active: true },
    });

    await waitFor(() => {
      expect(mockWakeLock.request).toHaveBeenCalled();
    });

    // Change to inactive
    rerender({ active: false });

    await waitFor(() => {
      expect(mockWakeLockSentinel.release).toHaveBeenCalled();
    });
  });

  it('should release wake lock on unmount', async () => {
    const { unmount } = renderHook(() => useWakeLock(true));

    await waitFor(() => {
      expect(mockWakeLock.request).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockWakeLockSentinel.release).toHaveBeenCalled();
    });
  });

  it('should handle wake lock request failure gracefully', async () => {
    const error = new Error('Wake lock denied');
    mockWakeLock.request.mockRejectedValueOnce(error);

    renderHook(() => useWakeLock(true));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Wake Lock request failed:',
        error
      );
    });
  });

  it('should handle wake lock release failure gracefully', async () => {
    const error = new Error('Release failed');
    mockWakeLockSentinel.release.mockRejectedValueOnce(error);

    const { unmount } = renderHook(() => useWakeLock(true));

    await waitFor(() => {
      expect(mockWakeLock.request).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Wake Lock release failed:',
        error
      );
    });
  });

  it('should not re-request wake lock on visibility change when inactive', async () => {
    renderHook(() => useWakeLock(false));

    // Simulate page becoming visible
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });
    // eslint-disable-next-line no-undef
    document.dispatchEvent(new Event('visibilitychange'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockWakeLock.request).not.toHaveBeenCalled();
  });

  it('should not request wake lock multiple times if already active', async () => {
    const { rerender } = renderHook(({ active }) => useWakeLock(active), {
      initialProps: { active: true },
    });

    await waitFor(() => {
      expect(mockWakeLock.request).toHaveBeenCalledTimes(1);
    });

    // Re-render with same active state
    rerender({ active: true });

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should still only have been called once
    expect(mockWakeLock.request).toHaveBeenCalledTimes(1);
  });
});
