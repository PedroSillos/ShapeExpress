import type { Exercise } from "./index";
import { parseCsv } from "./exerciseParser";

/**
 * Canonical exercise catalog + sport mappings.
 *
 * All data lives in exercises.csv — edit that file in Excel or any spreadsheet
 * app, save as "CSV UTF-8 (delimitado por vírgula)", and the changes are picked
 * up automatically on the next build or dev-server reload.
 *
 * Column reference:
 *   id, name, muscleGroup, muscleSubgroup, category, equipment, type,
 *   inputMode, defaultSets, defaultReps, defaultWeight,
 *   defaultDurationSeconds, defaultSpeedKmh, defaultDistanceMeters, sports
 *
 * `sports` — pipe-separated list of sport names this exercise belongs to,
 *   in priority order (e.g. "Musculação|Crossfit"). Empty = no sport mapping.
 *   Triatlo is NOT stored here — it is computed at runtime as the union of
 *   Natação ∪ Ciclismo ∪ Corrida, preserving their order.
 *
 * Empty cells mean the field is absent from the Exercise object.
 */
import rawCsv from "./exercises.csv?raw";

// ─── Exported catalog ────────────────────────────────────────────────────────

const { exercises, sportExerciseIds } = parseCsv(rawCsv);

export const EXERCISES: Exercise[] = exercises;

/**
 * Canonical mapping of sport → exercise IDs, derived from exercises.csv.
 * Order within each sport reflects the row order in the CSV.
 * Triatlo is computed as Natação ∪ Ciclismo ∪ Corrida.
 */
export const SPORT_EXERCISE_IDS: Record<string, string[]> = sportExerciseIds;

/** Fallback exercise IDs used when a sport has no mapping. */
export const DEFAULT_EXERCISE_IDS: string[] = ["1", "2", "3", "4", "5"];
