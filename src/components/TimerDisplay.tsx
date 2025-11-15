import { TimerState } from '../types';
import {
  getBoilingTimeRemaining,
  getCoolingTimeRemaining,
  formatTime,
} from '../hooks/useEggTimer';
import { COOLING_TIME_SECONDS } from '../core/notificationScheduler';

interface TimerDisplayProps {
  state: TimerState;
}

export function TimerDisplay({ state }: TimerDisplayProps) {
  const { status, totalTime, elapsedSeconds, coolingElapsed } = state;

  // Calculate time remaining and progress based on status
  let displayTime = '00:00';
  let progressPercent = 0;
  let phaseLabel = '';
  let statusMessage = '';

  if (status === 'idle') {
    statusMessage = 'Ready to start';
    displayTime = formatTime(totalTime);
  } else if (status === 'running') {
    const remaining = getBoilingTimeRemaining(totalTime, elapsedSeconds);
    displayTime = formatTime(remaining);
    progressPercent = totalTime > 0 ? (elapsedSeconds / totalTime) * 100 : 0;
    phaseLabel = 'Boiling';
  } else if (status === 'paused') {
    const remaining = getBoilingTimeRemaining(totalTime, elapsedSeconds);
    displayTime = formatTime(remaining);
    progressPercent = totalTime > 0 ? (elapsedSeconds / totalTime) * 100 : 0;
    statusMessage = 'Paused';
    phaseLabel = 'Boiling';
  } else if (status === 'cooling') {
    const remaining = getCoolingTimeRemaining(coolingElapsed);
    displayTime = formatTime(remaining);
    progressPercent = (coolingElapsed / COOLING_TIME_SECONDS) * 100;
    phaseLabel = 'Cooling';
  } else if (status === 'complete') {
    statusMessage = 'All done!';
    displayTime = '00:00';
    progressPercent = 100;
  }

  return (
    <div className="timer-display">
      <div className="timer-status">{statusMessage}</div>

      <div className="timer-time">{displayTime}</div>

      {phaseLabel && <div className="timer-phase">{phaseLabel}</div>}

      {status !== 'idle' && (
        <div className="timer-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <div className="progress-label">{Math.round(progressPercent)}%</div>
        </div>
      )}

      {status === 'cooling' && (
        <div className="cooling-info">
          Cooling: {formatTime(coolingElapsed)} /{' '}
          {formatTime(COOLING_TIME_SECONDS)}
        </div>
      )}
    </div>
  );
}
