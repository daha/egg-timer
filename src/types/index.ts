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
