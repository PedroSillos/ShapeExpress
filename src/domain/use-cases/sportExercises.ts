/**
 * Sport → exercise mapping.
 *
 * Data is derived from exercises.csv (via exercises.ts).
 * To change which exercises belong to a sport, edit the `sports` column in
 * exercises.csv — no code changes needed.
 *
 * Triatlo is computed automatically as Natação ∪ Ciclismo ∪ Corrida.
 */
export {
  SPORT_EXERCISE_IDS,
  DEFAULT_EXERCISE_IDS,
} from "@/src/domain/entities/exercises";

import { SPORT_EXERCISE_IDS, DEFAULT_EXERCISE_IDS } from "@/src/domain/entities/exercises";

/**
 * Returns the ordered list of exercise IDs for a given sport.
 * Falls back to DEFAULT_EXERCISE_IDS for unknown sports.
 */
export function getExerciseIdsForSport(sport: string): string[] {
  return SPORT_EXERCISE_IDS[sport] ?? DEFAULT_EXERCISE_IDS;
}

/**
 * Returns whether an exercise belongs to a given sport's canonical pool.
 * Useful for filtering the exercise picker in CreateWorkoutView.
 */
export function exerciseBelongsToSport(exerciseId: string, sport: string): boolean {
  const ids = SPORT_EXERCISE_IDS[sport];
  if (!ids) return true; // unknown sport → show all exercises
  return ids.includes(exerciseId);
}
