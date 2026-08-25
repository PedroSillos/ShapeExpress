import { Exercise, ExerciseInputMode } from "../entities";

/**
 * Returns the inputMode for an exercise.
 * `inputMode` is required on Exercise, so the fallback is a safety net
 * for legacy data that may not have the field set.
 */
export function getInputMode(exercise: Exercise): ExerciseInputMode {
  return exercise.inputMode ?? "weight_reps";
}

/** Default speed (km/h) per exercise ID for duration_speed exercises — kept as fallback for legacy contexts */
const DEFAULT_SPEED_FALLBACK: Record<string, number> = {
  '36':  10, // Corrida
  '37':  20, // Ciclismo
  '154':  5, // Caminhada
  '155':  8, // Trote
};

/**
 * Returns the default speed for an exercise.
 * Prefers `exercise.defaultSpeedKmh` from the catalog when the full Exercise
 * object is available. This function accepts an ID for legacy call sites that
 * only have the exercise ID.
 */
export function getDefaultSpeed(exerciseId: string): number {
  return DEFAULT_SPEED_FALLBACK[exerciseId] ?? 10;
}

/** Returns true if the set has enough data to be marked as completed */
export function isSetReadyToComplete(
  set: { reps: number; weight: number; durationSeconds?: number; distanceMeters?: number; speedKmh?: number },
  mode: ExerciseInputMode,
): boolean {
  switch (mode) {
    case "weight_reps":
      return set.weight > 0 && set.reps > 0;
    case "reps_only":
      return set.reps > 0;
    case "duration_distance":
    case "duration_only":
      return (set.durationSeconds ?? 0) > 0;
    case "duration_speed":
      return (set.durationSeconds ?? 0) > 0 && (set.speedKmh ?? 0) > 0;
  }
}
