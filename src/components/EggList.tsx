import { Egg, EggTiming } from '../types';
import { EggItem } from './EggItem';
import { formatTime } from '../hooks/useEggTimer';

interface EggListProps {
  eggs: Egg[];
  timings: EggTiming[];
  totalTime: number;
  onRemoveEgg: (eggId: string) => void;
  disabled: boolean;
  elapsedSeconds: number;
}

export function EggList({
  eggs,
  timings,
  totalTime,
  onRemoveEgg,
  disabled,
  elapsedSeconds,
}: EggListProps) {
  if (eggs.length === 0) {
    return (
      <div className="egg-list empty">
        <p className="empty-state">No eggs added yet</p>
        <p className="empty-state-hint">
          Add eggs above to start planning your perfect boil
        </p>
      </div>
    );
  }

  // Sort eggs by addAtSecond (first to add at top)
  const sortedTimings = [...timings].sort(
    (a, b) => a.addAtSecond - b.addAtSecond
  );

  return (
    <div className="egg-list">
      <div className="egg-list-header">
        <h2>Your Eggs</h2>
        <div className="total-time">
          <span className="total-time-label">Total timer duration:</span>
          <span className="total-time-value">{formatTime(totalTime)}</span>
        </div>
      </div>

      <div className="egg-items">
        {sortedTimings.map((timing) => {
          const egg = eggs.find((e) => e.id === timing.eggId);
          if (!egg) return null;

          const isTimeToAdd = elapsedSeconds === timing.addAtSecond;

          return (
            <EggItem
              key={egg.id}
              egg={egg}
              timing={timing}
              onRemove={onRemoveEgg}
              disabled={disabled}
              isTimeToAdd={isTimeToAdd}
            />
          );
        })}
      </div>

      <div className="egg-list-footer">
        <p className="egg-count">
          {eggs.length} egg{eggs.length !== 1 ? 's' : ''} added
        </p>
      </div>
    </div>
  );
}
