import { Egg, EggTiming } from '../types';
import { formatTime } from '../hooks/useEggTimer';

interface EggItemProps {
  egg: Egg;
  timing: EggTiming;
  onRemove: (eggId: string) => void;
  disabled: boolean;
  isTimeToAdd: boolean;
}

export function EggItem({
  egg,
  timing,
  onRemove,
  disabled,
  isTimeToAdd,
}: EggItemProps) {
  const donenessLabels: Record<string, string> = {
    soft: 'Soft',
    medium: 'Medium',
    harder: 'Harder',
    hard: 'Hard',
  };

  const tempLabels: Record<string, string> = {
    refrigerated: 'Refrigerated',
    room: 'Room temp',
  };

  return (
    <div className={`egg-item ${isTimeToAdd ? 'time-to-add' : ''}`}>
      <div className="egg-info">
        <div className="egg-main-info">
          <span className="egg-weight">{egg.weight}g</span>
          <span className="egg-doneness">{donenessLabels[egg.doneness]}</span>
          <span className="egg-temperature">{tempLabels[egg.temperature]}</span>
        </div>
        <div className="egg-timing-info">
          <span className="boil-time">
            Boil time: {formatTime(timing.boilTime)}
          </span>
          <span className="add-at">
            {timing.addAtSecond === 0
              ? 'Add first'
              : `Add at: ${formatTime(timing.addAtSecond)}`}
          </span>
        </div>
        {isTimeToAdd && (
          <div className="add-now-indicator" role="alert">
            🔔 Add this egg now!
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(egg.id)}
        disabled={disabled}
        className="remove-button"
        aria-label="Remove egg"
      >
        ✕
      </button>
    </div>
  );
}
