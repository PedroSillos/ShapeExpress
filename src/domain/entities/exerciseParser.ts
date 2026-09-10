/**
 * Pure CSV parser for the exercise catalog.
 *
 * This module has NO Vite-specific imports (no `?raw` suffix) so it can be
 * consumed both by the Vite frontend (via exercises.ts) and by the Express
 * backend (server.ts loads the CSV with fs.readFileSync and calls parseCsv
 * directly).
 */

import type {
  Exercise,
  ExerciseCategory,
  Equipment,
  ExerciseInputMode,
  ExerciseType,
  MuscleGroup,
  MuscleSubgroup,
} from "./index";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedCsv {
  exercises: Exercise[];
  /** sport → ordered exercise IDs (order = row order in CSV for that sport). */
  sportExerciseIds: Record<string, string[]>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Split a single CSV line respecting double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseNum(v: string): number | undefined {
  if (v === "" || v === undefined) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Parse a UTF-8 CSV string (with optional BOM) into the exercise catalog.
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
 */
export function parseCsv(csv: string): ParsedCsv {
  const lines = csv
    .replace(/^\uFEFF/, "") // strip UTF-8 BOM
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "");

  if (lines.length < 2) return { exercises: [], sportExerciseIds: {} };

  const headers = splitCsvLine(lines[0]);
  const idx = (col: string) => headers.indexOf(col);

  const exercises: Exercise[] = [];
  const sportMap = new Map<string, string[]>();

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const get = (col: string) => cols[idx(col)] ?? "";

    const id = get("id");
    const name = get("name");
    if (!id || !name) continue;

    const defaultSets = parseNum(get("defaultSets")) ?? 3;
    const defaultReps = parseNum(get("defaultReps"));
    const defaultWeight = parseNum(get("defaultWeight"));
    const defaultDurationSeconds = parseNum(get("defaultDurationSeconds"));
    const defaultSpeedKmh = parseNum(get("defaultSpeedKmh"));
    const defaultDistanceMeters = parseNum(get("defaultDistanceMeters"));
    const muscleSubgroup = get("muscleSubgroup") as MuscleSubgroup | "";

    const exercise: Exercise = {
      id,
      name,
      muscleGroup: get("muscleGroup") as MuscleGroup,
      category: get("category") as ExerciseCategory,
      equipment: get("equipment") as Equipment,
      type: get("type") as ExerciseType,
      inputMode: get("inputMode") as ExerciseInputMode,
      defaultSets,
    };

    if (muscleSubgroup) exercise.muscleSubgroup = muscleSubgroup as MuscleSubgroup;
    if (defaultReps !== undefined) exercise.defaultReps = defaultReps;
    if (defaultWeight !== undefined) exercise.defaultWeight = defaultWeight;
    if (defaultDurationSeconds !== undefined) exercise.defaultDurationSeconds = defaultDurationSeconds;
    if (defaultSpeedKmh !== undefined) exercise.defaultSpeedKmh = defaultSpeedKmh;
    if (defaultDistanceMeters !== undefined) exercise.defaultDistanceMeters = defaultDistanceMeters;

    exercises.push(exercise);

    const sportsCell = get("sports");
    if (sportsCell) {
      for (const sport of sportsCell.split("|").map((s) => s.trim()).filter(Boolean)) {
        if (!sportMap.has(sport)) sportMap.set(sport, []);
        sportMap.get(sport)!.push(id);
      }
    }
  }

  // Triatlo = Natação ∪ Ciclismo ∪ Corrida (deduped, order preserved)
  const triatloSports = ["Natação", "Ciclismo", "Corrida"] as const;
  const triatloIds = [
    ...new Set(triatloSports.flatMap((s) => sportMap.get(s) ?? [])),
  ];
  if (triatloIds.length > 0) {
    sportMap.set("Triatlo", triatloIds);
  }

  return { exercises, sportExerciseIds: Object.fromEntries(sportMap) };
}
