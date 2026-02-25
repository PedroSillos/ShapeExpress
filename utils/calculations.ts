import type { Exercise, WeekData } from "../types/workout";

export function calculateWeekVolume(sets: number, reps: number, load: number): number {
  return sets * reps * load;
}

export function calculateExerciseVolume(weeks: WeekData[]): number {
  return weeks.reduce((acc, w) => acc + (w.volume ?? 0), 0);
}

export function calculateWorkoutVolume(exercises: Exercise[]): number {
  return exercises.reduce((acc, e) => acc + e.totalVolume, 0);
}

