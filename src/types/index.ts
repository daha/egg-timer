export type DonenessLevel = 'soft' | 'medium' | 'harder' | 'hard';
export type TemperatureLevel = 'refrigerated' | 'room';

export interface Egg {
  id: string;
  weight: number; // grams
  doneness: DonenessLevel;
  temperature: TemperatureLevel;
}

export interface EggTiming {
  eggId: string;
  boilTime: number; // seconds
  addAtSecond: number; // when to add this egg to pot
}

export interface TimerState {
  eggs: Egg[];
  timings: EggTiming[];
  totalTime: number; // longest boil time
  status: 'idle' | 'running' | 'paused' | 'cooling' | 'complete';
  elapsedSeconds: number;
  coolingElapsed: number;
}

// Wake Lock API types
// https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
declare global {
  // eslint-disable-next-line no-undef
  interface WakeLockSentinel extends EventTarget {
    readonly released: boolean;
    readonly type: 'screen';
    release(): Promise<void>;
  }

  interface WakeLock {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  }

  interface Navigator {
    wakeLock?: WakeLock;
  }
}
