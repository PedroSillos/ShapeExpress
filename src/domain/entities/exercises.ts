import type {
  Exercise,
  ExerciseCategory,
  Equipment,
  ExerciseInputMode,
  ExerciseType,
  MuscleGroup,
  MuscleSubgroup,
} from "./index";

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

// ─── CSV parser ──────────────────────────────────────────────────────────────

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

// ─── Parse ───────────────────────────────────────────────────────────────────

interface ParsedCsv {
  exercises: Exercise[];
  /** sport → ordered exercise IDs (order = row order in CSV for that sport). */
  sportExerciseIds: Record<string, string[]>;
}

function parseCsv(csv: string): ParsedCsv {
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
  // Preserve insertion order per sport — Map gives us that for free.
  const sportMap = new Map<string, string[]>();

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const get = (col: string) => cols[idx(col)] ?? "";

    const id = get("id");
    const name = get("name");
    if (!id || !name) continue;

    // ── Build Exercise object ──────────────────────────────────────────────
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

    // ── Build sport → ids map ──────────────────────────────────────────────
    const sportsCell = get("sports");
    if (sportsCell) {
      for (const sport of sportsCell.split("|").map((s) => s.trim()).filter(Boolean)) {
        if (!sportMap.has(sport)) sportMap.set(sport, []);
        sportMap.get(sport)!.push(id);
      }
    }
  }

  // ── Compute Triatlo = Natação ∪ Ciclismo ∪ Corrida (deduped, order preserved) ──
  const triatloSports = ["Natação", "Ciclismo", "Corrida"] as const;
  const triatloIds = [
    ...new Set(triatloSports.flatMap((s) => sportMap.get(s) ?? [])),
  ];
  if (triatloIds.length > 0) {
    sportMap.set("Triatlo", triatloIds);
  }

  return { exercises, sportExerciseIds: Object.fromEntries(sportMap) };
}

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
