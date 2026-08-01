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
 *   Regra: apenas exercícios sem equipamento (peso corporal).
 *   — Cardio principal —
 *   36  = Corrida               (principal)
 *   155 = Trote                 (ritmo moderado)
 *   154 = Caminhada             (recuperação ativa)
 *   — Força complementar (peso corporal) —
 *   10  = Afundo                (quadríceps / unilateral)
 *   140 = Elevação unilateral   (panturrilha — peso corporal)
 *   11  = Prancha abdominal     (core)
 *   110 = Prancha lateral       (core oblíquo)
 *   9   = Flexão de braços      (tronco / postura)
 *
 * Musculação exercise IDs:
 *   Pool completo de musculação — todos os exercícios com equipamento de academia.
 *   — Peito —
 *   1, 16, 17, 18, 39–52 (supinos, crucifixos, chest press, crossover, flexões)
 *   — Costas —
 *   3, 6, 8, 27, 53, 55–64, 60, 75–78 (remadas, puxadas, pulldowns, trapézio)
 *   — Ombros —
 *   4, 28, 29, 65–74 (desenvolvimentos, elevações laterais/frontais, face pull)
 *   — Pernas —
 *   2, 7, 19–25, 114–139 (agachamentos, leg press, stiff, glúteos, panturrilhas)
 *   — Braços —
 *   5, 13, 30–32, 79–104 (roscas, tríceps, antebraço)
 *   — Core —
 *   11, 34, 35, 105–109, 112
 *
 * Halterofilismo exercise IDs:
 *   — Movimentos competitivos —
 *   156 = Arranco (Snatch)
 *   164 = Arremesso (Clean & Jerk)
 *   — Acessório olímpico —
 *   157 = Power Clean
 *   — Força de base —
 *   113 = Front squat, 2 = Agachamento livre, 6 = Levantamento terra
 *   4 = Desenvolvimento militar, 53 = Remada Pendlay, 26 = Encolhimento, 25 = Gêmeos em pé
 *   — Complementares —
 *   75 = Encolhimento com barra, 76 = High pull, 102 = Farmer walk
 *   120 = Levantamento terra Romeno, 121 = Good morning, 125 = Agachamento sumô
 *
 * Corrida exercise IDs:
 *   Regra: apenas exercícios sem equipamento (peso corporal) ou elástico.
 *   — Cardio principal —
 *   36 = Corrida, 155 = Trote, 154 = Caminhada
 *   — Força complementar (peso corporal) —
 *   10 = Afundo, 140 = Elevação unilateral, 11 = Prancha abdominal
 *   110 = Prancha lateral, 9 = Flexão de braços
 *   — Ativação e funcional —
 *   15 = Remada com elástico, 35 = Giro russo, 109 = Woodchopper
 *   131 = Step-up, 134 = Caminhada lateral, 135 = Monster walk, 141 = Saltos pliométricos
 *
 * Ciclismo exercise IDs:
 *   Regra: apenas exercícios sem equipamento (peso corporal) ou que usam bicicleta.
 *   37 = Ciclismo, 36 = Corrida, 10 = Afundo, 140 = Elevação unilateral
 *   12 = Alongamento de isquiotibiais, 163 = Alongamento de panturrilhas
 *   15 = Remada com elástico, 131 = Step-up
 *
 * Crossfit exercise IDs:
 *   — Compostos fundamentais —
 *   2 = Agachamento livre, 6 = Levantamento terra, 4 = Desenvolvimento militar
 *   14 = Kettlebell swing, 156 = Arranco, 157 = Power Clean
 *   — Ginástica / calistenia —
 *   9 = Flexão de braços, 50 = Flexão inclinada, 51 = Flexão declinada, 52 = Flexão arqueiro
 *   54 = Barra fixa pronada, 55 = Barra fixa supinada, 56 = Barra neutra
 *   98 = Paralelas, 99 = Mergulho no banco, 103 = Dead hang
 *   — Costas —
 *   3 = Remada curvada, 76 = High pull
 *   — Core —
 *   11 = Prancha abdominal, 33 = Abdominal supra, 34 = Abdominal infra
 *   35 = Giro russo, 105 = Crunch, 107 = Elevação de pernas, 108 = Elevação de joelhos
 *   109 = Woodchopper, 112 = Hollow hold
 *   — Pernas funcionais —
 *   10 = Afundo, 115 = Agachamento Goblet, 116 = Passada, 117 = Avanço, 130 = Afundo Búlgaro
 *   — Cardio / metcon —
 *   38 = Pular corda, 36 = Corrida, 141 = Saltos pliométricos
 *   — Funcional —
 *   102 = Farmer walk
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
 *   11  = Prancha abdominal      — core
 *   110 = Prancha lateral        — core oblíquo
 *   9   = Flexão de braços       — tronco / postura
 *   (10 e 140 já cobertos pelo bloco Ciclismo acima)
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
  const musculacao: string[] = [
    // Peito
    '1', '16', '17', '18', '39', '40', '41', '42', '43',
    '44', '45', '46', '47', '48', '49', '50', '51', '52',
    // Costas
    '6', '3', '8', '60', '27', '53', '55', '56', '57', '58', '59', '61', '62', '63', '64',
    '75', '76', '77', '78',
    // Ombros
    '4', '28', '29', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74',
    // Pernas
    '2', '7', '19', '20', '21', '22', '23', '24', '25',
    '114', '115', '116', '117', '118', '119',
    '120', '121', '122', '123',
    '124', '125', '126', '127', '128', '129', '130', '131', '132', '133',
    '136', '137', '138', '139',
    // Braços
    '5', '13', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
    '30', '31', '32', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99',
    '100', '101', '102', '103', '104',
    // Core
    '11', '34', '35', '105', '106', '107', '108', '109', '112',
  ];
  const halterofilismo: string[] = [
    // Movimentos competitivos
    '156', '164', '157',
    // Acessório olímpico
    '113', '2', '6', '4', '53', '26', '25',
    // Complementares
    '75', '76', '102', '120', '121', '125',
  ];
  const corrida: string[] = [
    // Cardio principal
    '36', '155', '154',
    // Força complementar (peso corporal)
    '10', '140', '11', '110', '9',
    // Ativação e funcional
    '15', '35', '109', '131', '134', '135', '141',
  ];
  const ciclismo: string[] = [
    '37', '36', '10', '140', '12', '163',
    // Funcional complementar
    '15', '131',
  ];
  const natacao:       string[] = ['147', '148', '149', '150', '151', '152', '153'];
  const crossfit: string[] = [
    // Compostos fundamentais
    '2', '6', '4', '14', '156', '157',
    // Ginástica / calistenia
    '9', '50', '51', '52', '54', '55', '56', '98', '99', '103',
    // Costas
    '3', '76',
    // Core
    '11', '33', '34', '35', '105', '107', '108', '109', '112',
    // Pernas funcionais
    '10', '115', '116', '117', '130',
    // Cardio metabólico
    '38', '36', '141',
    // Funcional
    '102',
  ];
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
