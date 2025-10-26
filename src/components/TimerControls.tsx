import { useState } from 'react';
import { TimerState } from '../types';

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onRemoveAllEggs: () => void;
}

export function TimerControls({
  state,
  onStart,
  onPause,
  onReset,
  onRemoveAllEggs,
}: TimerControlsProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { status, eggs } = state;

  // Determine button states
  const canStart = status === 'idle' && eggs.length > 0;
  const canPause = status === 'running';
  const canResume = status === 'paused';

  const handleReset = () => {
    if (status === 'running' || status === 'cooling') {
      // Show confirmation if timer is active
      setShowResetConfirm(true);
    } else {
      onReset();
    }
  };

  const confirmReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className="timer-controls">
      {showResetConfirm && (
        <div className="reset-confirmation">
          <p>Are you sure you want to reset the timer?</p>
          <div className="confirmation-buttons">
            <button onClick={confirmReset} className="btn-confirm">
              Yes, Reset
            </button>
            <button onClick={cancelReset} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="control-buttons">
        {status === 'idle' && (
          <button
            onClick={onStart}
            disabled={!canStart}
            className="btn-start"
            title={
              eggs.length === 0 ? 'Add eggs before starting' : 'Start the timer'
            }
          >
            Start Timer
          </button>
        )}

        {canPause && (
          <button onClick={onPause} className="btn-pause">
            Pause
          </button>
        )}

        {canResume && (
          <button onClick={onStart} className="btn-resume">
            Resume
          </button>
        )}

        {status !== 'idle' && (
          <button onClick={handleReset} className="btn-reset">
            Reset
          </button>
        )}

        {status === 'idle' && eggs.length > 0 && (
          <button onClick={onRemoveAllEggs} className="btn-reset-idle">
            Remove All Eggs
          </button>
        )}
      </div>

      {status === 'idle' && eggs.length === 0 && (
        <p className="no-eggs-hint">Add eggs above to get started</p>
      )}
    </div>
  );
}
