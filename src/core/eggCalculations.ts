import { Egg, DonenessLevel, TemperatureLevel, EggTiming } from '../types';

const DONENESS_ADJUSTMENTS: Record<DonenessLevel, number> = {
  soft: -30,
  medium: 0,
  harder: 45,
  hard: 90,
};

const TEMPERATURE_ADJUSTMENTS: Record<TemperatureLevel, number> = {
  refrigerated: 0,
  room: -30,
};

export function calculateBoilTime(egg: Egg): number {
  const baseTime = 197 + 4.6 * egg.weight;
  const donenessAdjustment = DONENESS_ADJUSTMENTS[egg.doneness];
  const tempAdjustment = TEMPERATURE_ADJUSTMENTS[egg.temperature];

  return Math.round(baseTime + donenessAdjustment + tempAdjustment);
}

export function calculateEggTimings(eggs: Egg[]): EggTiming[] {
  if (eggs.length === 0) return [];

  const timings: EggTiming[] = eggs.map((egg) => ({
    eggId: egg.id,
    boilTime: calculateBoilTime(egg),
    addAtSecond: 0, // Will be calculated next
  }));

  const maxBoilTime = Math.max(...timings.map((t) => t.boilTime));

  return timings.map((timing) => ({
    ...timing,
    addAtSecond: maxBoilTime - timing.boilTime,
  }));
}

export function getTotalTime(eggs: Egg[]): number {
  if (eggs.length === 0) return 0;
  const timings = calculateEggTimings(eggs);
  return Math.max(...timings.map((t) => t.boilTime));
}
