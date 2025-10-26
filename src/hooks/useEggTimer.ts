import { useReducer, useEffect, useCallback } from 'react';
import { Egg, TimerState, EggTiming } from '../types';
import { calculateEggTimings, getTotalTime } from '../core/eggCalculations';

// Action types
type TimerAction =
  | { type: 'ADD_EGG'; payload: Egg }
  | { type: 'REMOVE_EGG'; payload: string }
  | { type: 'REMOVE_ALL_EGGS' }
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'TICK' }
  | { type: 'START_COOLING' }
  | { type: 'COMPLETE' }
  | { type: 'RESTORE_EGGS'; payload: Egg[] }
  | {
      type: 'RESTORE_TIMER_STATE';
      payload: {
        status: TimerState['status'];
        elapsedSeconds: number;
        coolingElapsed: number;
      };
    };

// Initial state
const initialState: TimerState = {
  eggs: [],
  timings: [],
  totalTime: 0,
  status: 'idle',
  elapsedSeconds: 0,
  coolingElapsed: 0,
};

// Reducer function
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'ADD_EGG': {
      // Cannot add eggs while timer is running or cooling
      if (state.status === 'running' || state.status === 'cooling') {
        return state;
      }

      const newEggs = [...state.eggs, action.payload];
      const newTimings = calculateEggTimings(newEggs);
      const newTotalTime = getTotalTime(newEggs);

      return {
        ...state,
        eggs: newEggs,
        timings: newTimings,
        totalTime: newTotalTime,
      };
    }

    case 'REMOVE_EGG': {
      // Cannot remove eggs while timer is running or cooling
      if (state.status === 'running' || state.status === 'cooling') {
        return state;
      }

      const newEggs = state.eggs.filter((egg) => egg.id !== action.payload);
      const newTimings = calculateEggTimings(newEggs);
      const newTotalTime = getTotalTime(newEggs);

      return {
        ...state,
        eggs: newEggs,
        timings: newTimings,
        totalTime: newTotalTime,
      };
    }

    case 'REMOVE_ALL_EGGS': {
      // Cannot remove eggs while timer is running or cooling
      if (state.status === 'running' || state.status === 'cooling') {
        return state;
      }

      return {
        ...state,
        eggs: [],
        timings: [],
        totalTime: 0,
      };
    }

    case 'START_TIMER': {
      // Can only start from idle or paused
      if (state.status !== 'idle' && state.status !== 'paused') {
        return state;
      }

      // Must have eggs to start
      if (state.eggs.length === 0) {
        return state;
      }

      return {
        ...state,
        status: 'running',
      };
    }

    case 'PAUSE_TIMER': {
      // Can only pause when running
      if (state.status !== 'running') {
        return state;
      }

      return {
        ...state,
        status: 'paused',
      };
    }

    case 'RESET_TIMER': {
      return {
        ...state,
        status: 'idle',
        elapsedSeconds: 0,
        coolingElapsed: 0,
      };
    }

    case 'TICK': {
      // Only tick when running or cooling
      if (state.status === 'running') {
        const newElapsed = state.elapsedSeconds + 1;

        // Check if boiling is complete
        if (newElapsed >= state.totalTime) {
          return {
            ...state,
            elapsedSeconds: newElapsed,
            status: 'cooling',
            coolingElapsed: 0,
          };
        }

        return {
          ...state,
          elapsedSeconds: newElapsed,
        };
      } else if (state.status === 'cooling') {
        const newCoolingElapsed = state.coolingElapsed + 1;

        // Check if cooling is complete (120 seconds = 2 minutes)
        if (newCoolingElapsed >= 120) {
          return {
            ...state,
            coolingElapsed: newCoolingElapsed,
            status: 'complete',
          };
        }

        return {
          ...state,
          coolingElapsed: newCoolingElapsed,
        };
      }

      return state;
    }

    case 'START_COOLING': {
      return {
        ...state,
        status: 'cooling',
        coolingElapsed: 0,
      };
    }

    case 'COMPLETE': {
      return {
        ...state,
        status: 'complete',
      };
    }

    case 'RESTORE_EGGS': {
      // Only restore when idle
      if (state.status !== 'idle') {
        return state;
      }

      const newTimings = calculateEggTimings(action.payload);
      const newTotalTime = getTotalTime(action.payload);

      return {
        ...state,
        eggs: action.payload,
        timings: newTimings,
        totalTime: newTotalTime,
      };
    }

    case 'RESTORE_TIMER_STATE': {
      // Restore timer state (status, elapsed time) from localStorage
      return {
        ...state,
        status: action.payload.status,
        elapsedSeconds: action.payload.elapsedSeconds,
        coolingElapsed: action.payload.coolingElapsed,
      };
    }

    default:
      return state;
  }
}

// Custom hook
export function useEggTimer() {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // Timer tick effect - runs every second when timer is running or cooling
  useEffect(() => {
    if (state.status === 'running' || state.status === 'cooling') {
      const intervalId = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [state.status]);

  // Action dispatchers wrapped in useCallback for stable references
  const addEgg = useCallback((egg: Egg) => {
    dispatch({ type: 'ADD_EGG', payload: egg });
  }, []);

  const removeEgg = useCallback((eggId: string) => {
    dispatch({ type: 'REMOVE_EGG', payload: eggId });
  }, []);

  const startTimer = useCallback(() => {
    dispatch({ type: 'START_TIMER' });
  }, []);

  const pauseTimer = useCallback(() => {
    dispatch({ type: 'PAUSE_TIMER' });
  }, []);

  const resetTimer = useCallback(() => {
    dispatch({ type: 'RESET_TIMER' });
  }, []);

  const restoreEggs = useCallback((eggs: Egg[]) => {
    dispatch({ type: 'RESTORE_EGGS', payload: eggs });
  }, []);

  const restoreTimerState = useCallback(
    (timerState: {
      status: TimerState['status'];
      elapsedSeconds: number;
      coolingElapsed: number;
    }) => {
      dispatch({ type: 'RESTORE_TIMER_STATE', payload: timerState });
    },
    []
  );

  const removeAllEggs = useCallback(() => {
    dispatch({ type: 'REMOVE_ALL_EGGS' });
  }, []);

  return {
    state,
    addEgg,
    removeEgg,
    removeAllEggs,
    startTimer,
    pauseTimer,
    resetTimer,
    restoreEggs,
    restoreTimerState,
  };
}

// Helper to get eggs that should be added at current time
export function getEggsToAddNow(
  timings: EggTiming[],
  elapsedSeconds: number
): EggTiming[] {
  return timings.filter((timing) => timing.addAtSecond === elapsedSeconds);
}

// Helper to get time remaining for boiling phase
export function getBoilingTimeRemaining(
  totalTime: number,
  elapsedSeconds: number
): number {
  return Math.max(0, totalTime - elapsedSeconds);
}

// Helper to get time remaining for cooling phase
export function getCoolingTimeRemaining(coolingElapsed: number): number {
  return Math.max(0, 120 - coolingElapsed);
}

// Helper to format seconds as MM:SS
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
