import { Exercise, ExerciseInputMode } from "../entities";

export function getInputMode(exercise: Exercise): ExerciseInputMode {
  return exercise.inputMode ?? "weight_reps";
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
  }
}
