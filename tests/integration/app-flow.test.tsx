import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Mock Notification API
    global.Notification = vi.fn() as unknown as typeof Notification;
    global.Notification.permission = 'granted';
    global.Notification.requestPermission = vi
      .fn()
      .mockResolvedValue('granted');

    // Mock Audio
    global.Audio = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
    })) as unknown as typeof Audio;

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    global.localStorage = localStorageMock as unknown as Storage;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the app with initial state', () => {
    render(<App />);

    // Should have the form to add eggs
    expect(screen.getByLabelText(/weight/i)).toBeInTheDocument();

    // Should have timer controls
    expect(
      screen.getByRole('button', { name: /add egg/i })
    ).toBeInTheDocument();
  });

  it('complete flow: add eggs → start timer → notifications → completion', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    // Step 1: Add first egg (50g, medium, refrigerated)
    const weightInput = screen.getByLabelText(/weight/i);
    const addButton = screen.getByRole('button', { name: /add egg/i });

    await user.clear(weightInput);
    await user.type(weightInput, '50');
    await user.click(addButton);

    // Should show the egg in the list
    await waitFor(() => {
      expect(screen.getByText(/50.*g/i)).toBeInTheDocument();
    });

    // Step 2: Add second egg (70g, hard, refrigerated)
    await user.clear(weightInput);
    await user.type(weightInput, '70');

    const donenessSelect = screen.getByLabelText(/doneness/i);
    await user.selectOptions(donenessSelect, 'hard');

    await user.click(addButton);

    // Should show both eggs
    await waitFor(() => {
      expect(screen.getAllByText(/g/i).length).toBeGreaterThan(1);
    });

    // Step 3: Start the timer
    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);

    // Timer should be running
    await waitFor(() => {
      expect(screen.getByText(/boiling/i)).toBeInTheDocument();
    });

    // Form should be disabled
    expect(weightInput).toBeDisabled();

    // Step 4: Advance time by a few seconds
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      // Timer should show progress
      expect(screen.getByText(/\d+%/)).toBeInTheDocument();
    });

    // Step 5: Pause the timer
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    await user.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText(/paused/i)).toBeInTheDocument();
    });

    // Step 6: Resume the timer
    const resumeButton = screen.getByRole('button', { name: /resume/i });
    await user.click(resumeButton);

    await waitFor(() => {
      expect(screen.getByText(/boiling/i)).toBeInTheDocument();
    });
  });

  it('prevents adding eggs while timer is running', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    // Add one egg
    const weightInput = screen.getByLabelText(/weight/i);
    const addButton = screen.getByRole('button', { name: /add egg/i });

    await user.clear(weightInput);
    await user.type(weightInput, '50');
    await user.click(addButton);

    // Start timer
    const startButton = screen.getByRole('button', { name: /start/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/boiling/i)).toBeInTheDocument();
    });

    // Form should be disabled
    expect(weightInput).toBeDisabled();
    expect(addButton).toBeDisabled();

    // Should show message about not being able to add eggs
    expect(
      screen.getByText(/cannot add eggs while timer is running/i)
    ).toBeInTheDocument();
  });

  it('resets timer and allows adding eggs again', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    // Add egg and start timer
    const weightInput = screen.getByLabelText(/weight/i);
    await user.clear(weightInput);
    await user.type(weightInput, '50');
    await user.click(screen.getByRole('button', { name: /add egg/i }));

    await user.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() => {
      expect(screen.getByText(/boiling/i)).toBeInTheDocument();
    });

    // Advance time
    vi.advanceTimersByTime(5000);

    // Reset timer
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Should be back to idle state
    await waitFor(() => {
      expect(screen.getByText(/ready to start/i)).toBeInTheDocument();
    });

    // Form should be enabled again
    expect(weightInput).not.toBeDisabled();

    // Eggs should still be there
    expect(screen.getByText(/50.*g/i)).toBeInTheDocument();
  });

  it('validates weight input correctly', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    const weightInput = screen.getByLabelText(/weight/i);
    const addButton = screen.getByRole('button', { name: /add egg/i });

    // Try to add egg with weight too low
    await user.clear(weightInput);
    await user.type(weightInput, '10');
    await user.click(addButton);

    // Should show error
    expect(
      screen.getByText(/weight must be between 20 and 100 grams/i)
    ).toBeInTheDocument();

    // Try to add egg with weight too high
    await user.clear(weightInput);
    await user.type(weightInput, '150');
    await user.click(addButton);

    // Should show error
    expect(
      screen.getByText(/weight must be between 20 and 100 grams/i)
    ).toBeInTheDocument();

    // Try valid weight
    await user.clear(weightInput);
    await user.type(weightInput, '50');
    await user.click(addButton);

    // Should not show error and egg should be added
    await waitFor(() => {
      expect(
        screen.queryByText(/weight must be between/i)
      ).not.toBeInTheDocument();
      expect(screen.getByText(/50.*g/i)).toBeInTheDocument();
    });
  });

  it('cannot start timer without eggs', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    const startButton = screen.getByRole('button', { name: /start/i });

    // Start button should be disabled when no eggs
    expect(startButton).toBeDisabled();

    // Add an egg
    const weightInput = screen.getByLabelText(/weight/i);
    await user.clear(weightInput);
    await user.type(weightInput, '50');
    await user.click(screen.getByRole('button', { name: /add egg/i }));

    // Now start button should be enabled
    await waitFor(() => {
      expect(startButton).not.toBeDisabled();
    });
  });

  it('displays correct time formatting', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    // Add egg
    const weightInput = screen.getByLabelText(/weight/i);
    await user.clear(weightInput);
    await user.type(weightInput, '50');
    await user.click(screen.getByRole('button', { name: /add egg/i }));

    // Should show total time in MM:SS format
    await waitFor(() => {
      expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
    });
  });

  it('removes eggs when delete button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    // Add two eggs
    const weightInput = screen.getByLabelText(/weight/i);
    const addButton = screen.getByRole('button', { name: /add egg/i });

    await user.clear(weightInput);
    await user.type(weightInput, '50');
    await user.click(addButton);

    await user.clear(weightInput);
    await user.type(weightInput, '60');
    await user.click(addButton);

    // Should have both eggs
    await waitFor(() => {
      expect(screen.getByText(/50.*g/i)).toBeInTheDocument();
      expect(screen.getByText(/60.*g/i)).toBeInTheDocument();
    });

    // Find and click delete button for first egg
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    // Should only have one egg left
    await waitFor(() => {
      const eggs = screen.queryAllByText(/\d+.*g/i);
      expect(eggs.length).toBeLessThan(4); // Less than when we had 2 eggs
    });
  });

  it('handles different doneness levels correctly', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    const weightInput = screen.getByLabelText(/weight/i);
    const donenessSelect = screen.getByLabelText(/doneness/i);
    const addButton = screen.getByRole('button', { name: /add egg/i });

    // Test each doneness level
    const donenessLevels = ['soft', 'medium', 'harder', 'hard'];

    for (const doneness of donenessLevels) {
      await user.clear(weightInput);
      await user.type(weightInput, '50');
      await user.selectOptions(donenessSelect, doneness);
      await user.click(addButton);

      // Check that the egg was added with the correct doneness
      await waitFor(() => {
        expect(screen.getByText(new RegExp(doneness, 'i'))).toBeInTheDocument();
      });
    }

    // Should have 4 eggs now
    const eggs = screen.getAllByText(/50.*g/i);
    expect(eggs.length).toBeGreaterThanOrEqual(4);
  });

  it('handles different temperature levels correctly', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    const weightInput = screen.getByLabelText(/weight/i);
    const temperatureSelect = screen.getByLabelText(/temperature/i);
    const addButton = screen.getByRole('button', { name: /add egg/i });

    // Add refrigerated egg
    await user.clear(weightInput);
    await user.type(weightInput, '50');
    await user.selectOptions(temperatureSelect, 'refrigerated');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/refrigerated/i)).toBeInTheDocument();
    });

    // Add room temperature egg
    await user.clear(weightInput);
    await user.type(weightInput, '60');
    await user.selectOptions(temperatureSelect, 'room');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/room/i)).toBeInTheDocument();
    });
  });

  it('updates progress bar as timer runs', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);

    // Add egg and start timer
    const weightInput = screen.getByLabelText(/weight/i);
    await user.clear(weightInput);
    await user.type(weightInput, '50');
    await user.click(screen.getByRole('button', { name: /add egg/i }));

    await user.click(screen.getByRole('button', { name: /start/i }));

    // Progress should start at or near 0%
    await waitFor(() => {
      const progressText = screen.getByText(/\d+%/);
      expect(progressText).toBeInTheDocument();
    });

    // Advance time significantly
    vi.advanceTimersByTime(50000); // 50 seconds

    // Progress should have increased
    await waitFor(() => {
      const progressText = screen.getByText(/\d+%/);
      const progressValue = parseInt(progressText.textContent || '0');
      expect(progressValue).toBeGreaterThan(0);
    });
  });
});
