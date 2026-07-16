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
 * Corrida exercise IDs:
 *   — Cardio principal —
 *   36  = Corrida               (principal)
 *   155 = Trote                 (ritmo moderado)
 *   154 = Caminhada             (recuperação ativa)
 *   — Força complementar —
 *   2   = Agachamento livre     (pernas)
 *   10  = Afundo                (unilateral)
 *   22  = Elevação pélvica      (glúteos / cadeia posterior)
 *   25  = Gêmeos em pé          (panturrilha)
 *   11  = Prancha abdominal     (core)
 *   110 = Prancha lateral       (core oblíquo)
 *   9   = Flexão de braços      (tronco / postura)
 *
 * Musculação exercise IDs:
 *   — Peito —
 *   1   = Supino reto           (composto principal)
 *   16  = Supino inclinado      (porção superior)
 *   18  = Crucifixo reto        (isolamento)
 *   — Costas —
 *   6   = Levantamento terra    (composto total)
 *   3   = Remada curvada        (espessura dorsal)
 *   8   = Puxada alta           (largura dorsal)
 *   60  = Remada unilateral     (dorsal unilateral)
 *   — Ombros —
 *   4   = Desenvolvimento militar (composto principal)
 *   28  = Elevação lateral      (deltoide médio)
 *   73  = Face pull             (deltoide posterior)
 *   — Pernas —
 *   2   = Agachamento livre     (composto principal)
 *   7   = Leg press             (quadríceps)
 *   21  = Stiff                 (cadeia posterior)
 *   25  = Gêmeos em pé          (panturrilha)
 *   — Braços —
 *   5   = Rosca direta          (bíceps)
 *   30  = Tríceps pulley        (tríceps)
 *   — Core —
 *   11  = Prancha abdominal     (core)
 *
 * Crossfit exercise IDs:
 *   2   = Agachamento livre     — força funcional fundamental
 *   6   = Levantamento terra    — composto total
 *   4   = Desenvolvimento militar — overhead press
 *   14  = Kettlebell swing      — movimento característico do Crossfit
 *   156 = Arranco (Snatch)      — halterofilismo olímpico
 *   157 = Power Clean           — halterofilismo olímpico
 *   9   = Flexão de braços      — ginástica / peso corporal
 *   54  = Barra fixa pronada    — pull-up
 *   3   = Remada curvada        — costas compound
 *   11  = Prancha abdominal     — core
 *   33  = Abdominal supra       — core
 *   38  = Pular corda           — cardio metabólico
 *   36  = Corrida               — sprint / metcon
 *   10  = Afundo                — funcional de pernas
 *
 * Natação exercise IDs:
 *   147 = Flutuação        (duration_only)   — aprender a boiar, controle de respiração
 *   148 = Deslizamento     (duration_distance) — impulso na borda, alinhamento corporal
 *   149 = Pernadas         (duration_distance) — pernadas isoladas de cada estilo
 *   150 = Nado crawl       (duration_distance) — primeiro estilo ensinado
 *   151 = Nado costas      (duration_distance) — equilíbrio corporal e respiração
 *   152 = Nado peito       (duration_distance) — exige coordenação braços/pernas
 *   153 = Nado borboleta   (duration_distance) — último estilo, mais técnico
 */
export const SPORT_EXERCISE_IDS: Record<string, string[]> = {
  'Musculação':     ['1', '16', '18', '6', '3', '8', '60', '4', '28', '73', '2', '7', '21', '25', '5', '30', '11'],
  'Halterofilismo': ['6', '2', '21', '4', '3', '1'],
  'Corrida':        ['36', '155', '154', '2', '10', '22', '25', '11', '110', '9'],
  'Ciclismo':       ['37', '7', '19', '25'],
  'Natação':        ['147', '148', '149', '150', '151', '152', '153'],
  'Crossfit':       ['2', '6', '4', '14', '156', '157', '9', '54', '3', '11', '33', '38', '36', '10'],
  'Yoga':           ['142', '143', '144', '145', '146', '12'],
  'Triatlo':        ['36', '37', '150', '11', '10'],
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
