/**
 * Canonical mapping of sport → exercise IDs.
 *
 * Rules:
 * - IDs must exist in EXERCISES (src/constants.ts).
 * - Order matters: first IDs are preferred for AI/static workout generation.
 * - A sport with no entry falls back to DEFAULT_EXERCISE_IDS.
 * - Exercises intentionally do NOT carry a sport attribute; the relationship
 *   is owned here (sport → exercises), not the other way around.
 *
 * Natação exercise IDs:
 *   147 = Flutuação        (duration_only)   — aprender a boiar, controle de respiração
 *   148 = Deslizamento     (duration_distance) — impulso na borda, alinhamento corporal
 *   149 = Pernadas         (duration_distance) — pernadas isoladas de cada estilo
 *    42 = Nado crawl       (duration_distance) — primeiro estilo ensinado
 *    43 = Nado costas      (duration_distance) — equilíbrio corporal e respiração
 *    44 = Nado peito       (duration_distance) — exige coordenação braços/pernas
 *    45 = Nado borboleta   (duration_distance) — último estilo, mais técnico
 */
export const SPORT_EXERCISE_IDS: Record<string, string[]> = {
  'Musculação':     ['1', '2', '3', '4', '5', '7', '8', '30'],
  'Halterofilismo': ['6', '2', '21', '4', '3', '1'],
  'Corrida':        ['36', '41', '40', '10', '25'],
  'Ciclismo':       ['37', '7', '19', '25'],
  'Natação':        ['147', '148', '149', '42', '43', '44', '45'],
  'Crossfit':       ['14', '2', '1', '11', '38', '9'],
  'Yoga':           ['142', '143', '144', '145', '146', '12'],
  'Triatlo':        ['36', '37', '42', '11', '10'],
};

export const DEFAULT_EXERCISE_IDS = ['1', '2', '3', '4', '5'];

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
