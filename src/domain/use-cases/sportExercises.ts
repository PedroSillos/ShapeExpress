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
 * Ciclismo exercise IDs:
 *   Regra: apenas exercícios sem equipamento (peso corporal) ou que usam bicicleta.
 *   — Cardio principal —
 *   37  = Ciclismo              (principal — bicicleta)
 *   36  = Corrida               (cardio complementar / treino cruzado — peso corporal)
 *   — Força complementar (peso corporal) —
 *   10  = Afundo                (quadríceps / unilateral / equilíbrio muscular)
 *   140 = Elevação unilateral   (panturrilha — peso corporal)
 *   — Alongamento (peso corporal) —
 *   12  = Alongamento de isquiotibiais (posteriores da coxa)
 *   163 = Alongamento de panturrilhas  (mobilidade e prevenção)
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
 * Halterofilismo exercise IDs:
 *   — Movimentos competitivos —
 *   156 = Arranco (Snatch)         — levantamento do chão até sobre a cabeça em um movimento
 *   164 = Arremesso (Clean & Jerk) — levantamento do chão até os ombros + impulso acima da cabeça
 *   — Acessório olímpico —
 *   157 = Power Clean              — versão simplificada do arremesso, fundamental para iniciantes
 *   — Força de base —
 *   113 = Front squat              — agachamento frontal, base para a fase Clean do arremesso
 *   2   = Agachamento livre        — back squat, força geral de pernas
 *   6   = Levantamento terra       — puxada inicial do chão
 *   4   = Desenvolvimento militar  — transfere para o Jerk (fase de impulso)
 *   53  = Remada Pendlay           — força de tração / costas
 *   26  = Encolhimento             — trapézio para o shrug explosivo
 *   25  = Gêmeos em pé             — extensão de tornozelo na fase de salto
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
 *
 * Triatlo exercise IDs:
 *   União das disciplinas Natação + Ciclismo + Corrida, sem duplicatas.
 *   Ordem: natação → ciclismo → corrida (sequência das etapas na prova).
 *   — Natação —
 *   147 = Flutuação              — técnica base
 *   148 = Deslizamento           — impulso e alinhamento
 *   149 = Pernadas               — pernadas isoladas
 *   150 = Nado crawl             — estilo principal no triatlo
 *   151 = Nado costas            — equilíbrio corporal
 *   152 = Nado peito             — coordenação
 *   153 = Nado borboleta         — estilo avançado
 *   — Ciclismo —
 *   37  = Ciclismo               — cardio principal (bicicleta)
 *   10  = Afundo                 — quadríceps / unilateral (peso corporal)
 *   140 = Elevação unilateral    — panturrilha (peso corporal)
 *   12  = Alongamento de isquiotibiais — posteriores da coxa
 *   163 = Alongamento de panturrilhas  — mobilidade e prevenção
 *   — Corrida —
 *   36  = Corrida                — cardio principal
 *   155 = Trote                  — ritmo moderado
 *   154 = Caminhada              — recuperação ativa
 *   2   = Agachamento livre      — pernas
 *   22  = Elevação pélvica       — glúteos / cadeia posterior
 *   25  = Gêmeos em pé           — panturrilha
 *   11  = Prancha abdominal      — core
 *   110 = Prancha lateral        — core oblíquo
 *   9   = Flexão de braços       — tronco / postura
 *
 * Yoga exercise IDs:
 *   161 = Postura da Montanha (Tadasana)                              — postura base (início da sequência)
 *   142 = Postura da criança (Balasana)                               — descanso e abertura de quadril
 *   143 = Postura do cachorro olhando para baixo (Adho Mukha Svanasana) — alongamento total
 *   144 = Postura do Guerreiro I (Virabhadrasana I)                   — força e equilíbrio
 *   145 = Postura da árvore (Vrksasana)                               — equilíbrio
 *   146 = Postura do Pombo (Eka Pada Rajakapotasana)                  — quadril profundo
 *   158 = Postura do Triângulo (Trikonasana)                          — abertura lateral e equilíbrio
 *   159 = Postura da Cadeira (Utkatasana)                             — força de pernas
 *   160 = Postura da Cobra (Bhujangasana)                             — extensão da coluna
 *   162 = Postura do Meio Senhor dos Peixes (Ardha Matsyendrasana)    — mobilidade de coluna
 */
export const SPORT_EXERCISE_IDS: Record<string, string[]> = (() => {
  const musculacao:    string[] = ['1', '16', '18', '6', '3', '8', '60', '4', '28', '73', '2', '7', '21', '25', '5', '30', '11'];
  const halterofilismo: string[] = ['156', '164', '157', '113', '2', '6', '4', '53', '26', '25'];
  const corrida:       string[] = ['36', '155', '154', '2', '10', '22', '25', '11', '110', '9'];
  const ciclismo:      string[] = ['37', '36', '10', '140', '12', '163'];
  const natacao:       string[] = ['147', '148', '149', '150', '151', '152', '153'];
  const crossfit:      string[] = ['2', '6', '4', '14', '156', '157', '9', '54', '3', '11', '33', '38', '36', '10'];
  const yoga:          string[] = ['161', '142', '143', '144', '145', '146', '158', '159', '160', '162'];

  // Triatlo = union of Natação + Ciclismo + Corrida, ordered by race sequence, deduped.
  const triatlo = [...new Set([...natacao, ...ciclismo, ...corrida])];

  return {
    'Musculação':     musculacao,
    'Halterofilismo': halterofilismo,
    'Corrida':        corrida,
    'Ciclismo':       ciclismo,
    'Natação':        natacao,
    'Crossfit':       crossfit,
    'Yoga':           yoga,
    'Triatlo':        triatlo,
  };
})();

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
