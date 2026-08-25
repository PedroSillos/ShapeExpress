import type { Exercise } from "./index";

/**
 * Canonical exercise catalog.
 * Moved from src/constants.ts — domain data belongs with domain types.
 *
 * inputMode conventions:
 *   weight_reps      → external load (barra, halter, máquina com pilha)
 *   reps_only        → bodyweight / elástico, sem carga numérica
 *   duration_only    → isometria ou movimento por tempo sem distância
 *   duration_distance→ cardio com distância mensurável
 *   (omitted)        → defaults to weight_reps via getInputMode()
 */
export const EXERCISES: Exercise[] = [
  // ─── Peito ───────────────────────────────────────────────────────────────
  { id: "1",  name: "Supino reto",                  muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "16", name: "Supino inclinado",              muscleGroup: "Peito", muscleSubgroup: "Peito superior", defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "17", name: "Supino declinado",              muscleGroup: "Peito", muscleSubgroup: "Peito inferior", defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "18", name: "Crucifixo reto",                muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Halter",       type: "isolation" },
  { id: "9",  name: "Flexão de braços",              muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 15, category: "Exercício em casa", equipment: "Peso corporal", type: "compound",  inputMode: "reps_only" },
  { id: "39", name: "Supino reto com halteres",      muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Halter",       type: "compound" },
  { id: "40", name: "Supino inclinado com halteres", muscleGroup: "Peito", muscleSubgroup: "Peito superior", defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Halter",       type: "compound" },
  { id: "41", name: "Supino declinado com halteres", muscleGroup: "Peito", muscleSubgroup: "Peito inferior", defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Halter",       type: "compound" },
  { id: "42", name: "Crucifixo inclinado",            muscleGroup: "Peito", muscleSubgroup: "Peito superior", defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Halter",       type: "isolation" },
  { id: "43", name: "Pullover",                      muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Halter",       type: "isolation" },
  { id: "44", name: "Chest press",                   muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Máquina",      type: "compound" },
  { id: "45", name: "Peck deck",                     muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "46", name: "Supino articulado",              muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Máquina",      type: "compound" },
  { id: "47", name: "Crossover alto",                muscleGroup: "Peito", muscleSubgroup: "Peito inferior", defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Polia",        type: "isolation" },
  { id: "48", name: "Crossover médio",               muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Polia",        type: "isolation" },
  { id: "49", name: "Crossover baixo",               muscleGroup: "Peito", muscleSubgroup: "Peito superior", defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Polia",        type: "isolation" },
  // bodyweight → reps_only
  { id: "50", name: "Flexão inclinada",  muscleGroup: "Peito", muscleSubgroup: "Peito inferior", defaultSets: 3, defaultReps: 15, category: "Exercício em casa", equipment: "Peso corporal", type: "compound", inputMode: "reps_only" },
  { id: "51", name: "Flexão declinada",  muscleGroup: "Peito", muscleSubgroup: "Peito superior", defaultSets: 3, defaultReps: 15, category: "Exercício em casa", equipment: "Peso corporal", type: "compound", inputMode: "reps_only" },
  { id: "52", name: "Flexão arqueiro",   muscleGroup: "Peito", muscleSubgroup: "Peito médio",    defaultSets: 3, defaultReps: 10, category: "Exercício em casa", equipment: "Peso corporal", type: "compound", inputMode: "reps_only" },


  // ─── Pernas ───────────────────────────────────────────────────────────────
  { id: "2",   name: "Agachamento livre",         muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 4, defaultReps: 8,  category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "7",   name: "Leg press",                 muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Máquina",      type: "compound" },
  { id: "19",  name: "Cadeira extensora",         muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "20",  name: "Mesa flexora",              muscleGroup: "Pernas", muscleSubgroup: "Posterior",   defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "21",  name: "Stiff",                     muscleGroup: "Pernas", muscleSubgroup: "Posterior",   defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "22",  name: "Elevação pélvica",          muscleGroup: "Pernas", muscleSubgroup: "Glúteos",     defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "23",  name: "Cadeira adutora",           muscleGroup: "Pernas", muscleSubgroup: "Adutor",      defaultSets: 3, defaultReps: 15, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "24",  name: "Cadeira abdutora",          muscleGroup: "Pernas", muscleSubgroup: "Abdutor",     defaultSets: 3, defaultReps: 15, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "25",  name: "Gêmeos em pé",              muscleGroup: "Pernas", muscleSubgroup: "Panturrilha", defaultSets: 4, defaultReps: 15, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "10",  name: "Afundo",                    muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 3, defaultReps: 12, category: "Exercício em casa", equipment: "Peso corporal", type: "compound",  inputMode: "reps_only" },
  { id: "12",  name: "Alongamento de isquiotibiais", muscleGroup: "Pernas", muscleSubgroup: "Posterior", defaultSets: 2, defaultReps: 30, category: "Alongamento",     equipment: "Peso corporal", type: "isolation", inputMode: "duration_only" },
  { id: "113", name: "Front squat",               muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 4, defaultReps: 8,  category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "114", name: "Hack machine",              muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Máquina",      type: "compound" },
  { id: "115", name: "Agachamento Goblet",        muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Halter",       type: "compound" },
  { id: "116", name: "Passada",                   muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Halter",       type: "compound" },
  { id: "117", name: "Avanço",                    muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Halter",       type: "compound" },
  { id: "118", name: "Agachamento Smith",         muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 4, defaultReps: 10, category: "Musculação",       equipment: "Smith",        type: "compound" },
  { id: "119", name: "Búlgaro Smith",             muscleGroup: "Pernas", muscleSubgroup: "Quadríceps",  defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Smith",        type: "compound" },
  { id: "120", name: "Levantamento terra Romeno", muscleGroup: "Pernas", muscleSubgroup: "Posterior",   defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "121", name: "Good morning",              muscleGroup: "Pernas", muscleSubgroup: "Posterior",   defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "122", name: "Flexora sentada",           muscleGroup: "Pernas", muscleSubgroup: "Posterior",   defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "123", name: "Stiff com halteres",        muscleGroup: "Pernas", muscleSubgroup: "Posterior",   defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Halter",       type: "compound" },
  { id: "124", name: "Hip thrust",                muscleGroup: "Pernas", muscleSubgroup: "Glúteos",     defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "125", name: "Agachamento sumô",          muscleGroup: "Pernas", muscleSubgroup: "Glúteos",     defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Barra",        type: "compound" },
  { id: "126", name: "Glúteo máquina",            muscleGroup: "Pernas", muscleSubgroup: "Glúteos",     defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "127", name: "Abdução máquina",           muscleGroup: "Pernas", muscleSubgroup: "Glúteos",     defaultSets: 3, defaultReps: 15, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "128", name: "Coice na polia",            muscleGroup: "Pernas", muscleSubgroup: "Glúteos",     defaultSets: 3, defaultReps: 15, category: "Musculação",       equipment: "Polia",        type: "isolation" },
  { id: "129", name: "Abdução na polia",          muscleGroup: "Pernas", muscleSubgroup: "Glúteos",     defaultSets: 3, defaultReps: 15, category: "Musculação",       equipment: "Polia",        type: "isolation" },
  { id: "130", name: "Afundo Búlgaro",            muscleGroup: "Pernas", muscleSubgroup: "Glúteos",     defaultSets: 3, defaultReps: 10, category: "Musculação",       equipment: "Halter",       type: "compound" },
  { id: "131", name: "Step-up",                   muscleGroup: "Pernas", muscleSubgroup: "Glúteos",     defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Halter",       type: "compound" },
  { id: "132", name: "Passada lateral",           muscleGroup: "Pernas", muscleSubgroup: "Adutor",      defaultSets: 3, defaultReps: 12, category: "Musculação",       equipment: "Peso corporal", type: "compound",  inputMode: "reps_only" },
  { id: "133", name: "Abdução unilateral",        muscleGroup: "Pernas", muscleSubgroup: "Abdutor",     defaultSets: 3, defaultReps: 15, category: "Musculação",       equipment: "Polia",        type: "isolation" },
  // elástico → reps_only
  { id: "134", name: "Caminhada lateral",         muscleGroup: "Pernas", muscleSubgroup: "Abdutor",     defaultSets: 3, defaultReps: 20, category: "Funcional",        equipment: "Elástico",     type: "isolation", inputMode: "reps_only" },
  { id: "135", name: "Monster walk",              muscleGroup: "Pernas", muscleSubgroup: "Abdutor",     defaultSets: 3, defaultReps: 20, category: "Funcional",        equipment: "Elástico",     type: "isolation", inputMode: "reps_only" },
  { id: "136", name: "Panturrilha em pé máquina", muscleGroup: "Pernas", muscleSubgroup: "Panturrilha", defaultSets: 4, defaultReps: 15, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "137", name: "Panturrilha Smith",         muscleGroup: "Pernas", muscleSubgroup: "Panturrilha", defaultSets: 4, defaultReps: 15, category: "Musculação",       equipment: "Smith",        type: "isolation" },
  { id: "138", name: "Panturrilha sentada",       muscleGroup: "Pernas", muscleSubgroup: "Panturrilha", defaultSets: 4, defaultReps: 15, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  { id: "139", name: "Panturrilha no leg press",  muscleGroup: "Pernas", muscleSubgroup: "Panturrilha", defaultSets: 4, defaultReps: 15, category: "Musculação",       equipment: "Máquina",      type: "isolation" },
  // bodyweight → reps_only
  { id: "140", name: "Elevação unilateral",       muscleGroup: "Pernas", muscleSubgroup: "Panturrilha", defaultSets: 3, defaultReps: 15, category: "Exercício em casa", equipment: "Peso corporal", type: "isolation", inputMode: "reps_only" },
  { id: "141", name: "Saltos pliométricos",       muscleGroup: "Pernas", muscleSubgroup: "Panturrilha", defaultSets: 3, defaultReps: 10, category: "Funcional",        equipment: "Peso corporal", type: "compound",  inputMode: "reps_only" },


  // ─── Costas ───────────────────────────────────────────────────────────────
  { id: "3",  name: "Remada curvada",          muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Barra",     type: "compound" },
  { id: "6",  name: "Levantamento terra",       muscleGroup: "Costas", muscleSubgroup: "Lombar",   defaultSets: 3, defaultReps: 5,  category: "Musculação", equipment: "Barra",     type: "compound" },
  { id: "8",  name: "Puxada alta",             muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Máquina",   type: "compound" },
  { id: "26", name: "Encolhimento",            muscleGroup: "Costas", muscleSubgroup: "Trapézio", defaultSets: 3, defaultReps: 15, category: "Musculação", equipment: "Halter",    type: "isolation" },
  { id: "27", name: "Remada cavalinho",        muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Máquina",   type: "compound" },
  { id: "15", name: "Remada com elástico",     muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 15, category: "Exercício em casa", equipment: "Elástico", type: "compound" },
  { id: "53", name: "Remada Pendlay",          muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 8,  category: "Musculação", equipment: "Barra",     type: "compound" },
  // bodyweight → reps_only
  { id: "54", name: "Barra fixa pronada",      muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 8,  category: "Musculação", equipment: "Barra fixa", type: "compound", inputMode: "reps_only" },
  { id: "55", name: "Barra fixa supinada",     muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 8,  category: "Musculação", equipment: "Barra fixa", type: "compound", inputMode: "reps_only" },
  { id: "56", name: "Barra neutra",            muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 8,  category: "Musculação", equipment: "Barra fixa", type: "compound", inputMode: "reps_only" },
  { id: "57", name: "Puxada articulada",       muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Máquina",   type: "compound" },
  { id: "58", name: "Remada máquina",          muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Máquina",   type: "compound" },
  { id: "59", name: "Pulldown",                muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Máquina",   type: "compound" },
  { id: "60", name: "Remada unilateral",       muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Halter",    type: "compound" },
  { id: "61", name: "Remada serrote",          muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Halter",    type: "compound" },
  { id: "62", name: "Remada baixa",            muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Polia",     type: "compound" },
  { id: "63", name: "Remada sentado",          muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Polia",     type: "compound" },
  { id: "64", name: "Pullover na polia",       muscleGroup: "Costas", muscleSubgroup: "Dorsal",   defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Polia",     type: "isolation" },
  { id: "75", name: "Encolhimento com barra",  muscleGroup: "Costas", muscleSubgroup: "Trapézio", defaultSets: 3, defaultReps: 15, category: "Musculação", equipment: "Barra",     type: "isolation" },
  { id: "76", name: "High pull",               muscleGroup: "Costas", muscleSubgroup: "Trapézio", defaultSets: 3, defaultReps: 8,  category: "Musculação", equipment: "Barra",     type: "compound" },
  { id: "77", name: "Encolhimento na polia",   muscleGroup: "Costas", muscleSubgroup: "Trapézio", defaultSets: 3, defaultReps: 15, category: "Musculação", equipment: "Polia",     type: "isolation" },
  { id: "78", name: "Encolhimento máquina",    muscleGroup: "Costas", muscleSubgroup: "Trapézio", defaultSets: 3, defaultReps: 15, category: "Musculação", equipment: "Máquina",   type: "isolation" },

  // ─── Ombros ───────────────────────────────────────────────────────────────
  { id: "4",  name: "Desenvolvimento militar",          muscleGroup: "Ombros", muscleSubgroup: "Deltoide Anterior", defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Barra",   type: "compound" },
  { id: "28", name: "Elevação lateral",                 muscleGroup: "Ombros", muscleSubgroup: "Deltoide Lateral",  defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Halter",  type: "isolation" },
  { id: "29", name: "Crucifixo inverso",                muscleGroup: "Ombros", muscleSubgroup: "Deltoide Posterior",defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Halter",  type: "isolation" },
  { id: "65", name: "Desenvolvimento atrás da nuca",    muscleGroup: "Ombros", muscleSubgroup: "Deltoide Anterior", defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Barra",   type: "compound" },
  { id: "66", name: "Desenvolvimento sentado",          muscleGroup: "Ombros", muscleSubgroup: "Deltoide Anterior", defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Halter",  type: "compound" },
  { id: "67", name: "Elevação frontal",                 muscleGroup: "Ombros", muscleSubgroup: "Deltoide Anterior", defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Halter",  type: "isolation" },
  { id: "68", name: "Desenvolvimento máquina",          muscleGroup: "Ombros", muscleSubgroup: "Deltoide Anterior", defaultSets: 3, defaultReps: 10, category: "Musculação", equipment: "Máquina", type: "compound" },
  { id: "69", name: "Elevação lateral inclinada",       muscleGroup: "Ombros", muscleSubgroup: "Deltoide Lateral",  defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Halter",  type: "isolation" },
  { id: "70", name: "Elevação lateral unilateral",      muscleGroup: "Ombros", muscleSubgroup: "Deltoide Lateral",  defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Polia",   type: "isolation" },
  { id: "71", name: "Elevação lateral atrás do corpo",  muscleGroup: "Ombros", muscleSubgroup: "Deltoide Lateral",  defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Polia",   type: "isolation" },
  { id: "72", name: "Elevação lateral máquina",         muscleGroup: "Ombros", muscleSubgroup: "Deltoide Lateral",  defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Máquina", type: "isolation" },
  { id: "73", name: "Face pull",                        muscleGroup: "Ombros", muscleSubgroup: "Deltoide Posterior",defaultSets: 3, defaultReps: 15, category: "Musculação", equipment: "Polia",   type: "isolation" },
  { id: "74", name: "Peck deck inverso",                muscleGroup: "Ombros", muscleSubgroup: "Deltoide Posterior",defaultSets: 3, defaultReps: 12, category: "Musculação", equipment: "Máquina", type: "isolation" },


  // ─── Braços ───────────────────────────────────────────────────────────────
  { id: "5",   name: "Rosca direta",             muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Barra",     type: "isolation" },
  { id: "13",  name: "Rosca com halter",         muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Halter",    type: "isolation" },
  { id: "30",  name: "Tríceps pulley",           muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Máquina",   type: "isolation" },
  { id: "31",  name: "Tríceps testa",            muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 10, category: "Musculação",  equipment: "Barra",     type: "isolation" },
  { id: "32",  name: "Rosca inversa",            muscleGroup: "Braços", muscleSubgroup: "Antebraço", defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Barra",     type: "isolation" },
  { id: "79",  name: "Rosca w",                  muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 10, category: "Musculação",  equipment: "Barra",     type: "isolation" },
  { id: "80",  name: "Rosca drag",               muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 10, category: "Musculação",  equipment: "Barra",     type: "isolation" },
  { id: "81",  name: "Rosca alternada",          muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Halter",    type: "isolation" },
  { id: "82",  name: "Rosca concentrada",        muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Halter",    type: "isolation" },
  { id: "83",  name: "Rosca martelo",            muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Halter",    type: "isolation" },
  { id: "84",  name: "Rosca inclinada",          muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Halter",    type: "isolation" },
  { id: "85",  name: "Rosca na polia baixa",     muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Polia",     type: "isolation" },
  { id: "86",  name: "Rosca unilateral",         muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Polia",     type: "isolation" },
  { id: "87",  name: "Rosca Scott máquina",      muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Máquina",   type: "isolation" },
  { id: "88",  name: "Rosca Scott barra",        muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 10, category: "Musculação",  equipment: "Banco Scott", type: "isolation" },
  { id: "89",  name: "Rosca Scott halter",       muscleGroup: "Braços", muscleSubgroup: "Bíceps",    defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Banco Scott", type: "isolation" },
  { id: "90",  name: "Tríceps francês",          muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 10, category: "Musculação",  equipment: "Barra",     type: "isolation" },
  { id: "91",  name: "Francês unilateral",       muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Halter",    type: "isolation" },
  { id: "92",  name: "Coice",                    muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Halter",    type: "isolation" },
  { id: "93",  name: "Tríceps corda",            muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Polia",     type: "isolation" },
  { id: "94",  name: "Tríceps barra reta",       muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Polia",     type: "isolation" },
  { id: "95",  name: "Tríceps inverso",          muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Polia",     type: "isolation" },
  { id: "96",  name: "Extensão acima da cabeça", muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Polia",     type: "isolation" },
  { id: "97",  name: "Tríceps máquina",          muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 12, category: "Musculação",  equipment: "Máquina",   type: "isolation" },
  // bodyweight → reps_only
  { id: "98",  name: "Paralelas",                muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 10, category: "Exercício em casa", equipment: "Peso corporal", type: "compound",  inputMode: "reps_only" },
  { id: "99",  name: "Mergulho no banco",        muscleGroup: "Braços", muscleSubgroup: "Tríceps",   defaultSets: 3, defaultReps: 15, category: "Exercício em casa", equipment: "Peso corporal", type: "compound",  inputMode: "reps_only" },
  { id: "100", name: "Rosca punho",              muscleGroup: "Braços", muscleSubgroup: "Antebraço", defaultSets: 3, defaultReps: 20, category: "Musculação",  equipment: "Barra",     type: "isolation" },
  { id: "101", name: "Rosca punho inversa",      muscleGroup: "Braços", muscleSubgroup: "Antebraço", defaultSets: 3, defaultReps: 20, category: "Musculação",  equipment: "Barra",     type: "isolation" },
  { id: "102", name: "Farmer walk",              muscleGroup: "Braços", muscleSubgroup: "Antebraço", defaultSets: 3, defaultReps: 30, category: "Funcional",   equipment: "Halter",    type: "compound" },
  // isometria por tempo → duration_only
  { id: "103", name: "Dead hang",                muscleGroup: "Braços", muscleSubgroup: "Antebraço", defaultSets: 3, defaultReps: 30, category: "Funcional",   equipment: "Barra fixa", type: "isolation", inputMode: "duration_only" },
  { id: "104", name: "Extensão de punho",        muscleGroup: "Braços", muscleSubgroup: "Antebraço", defaultSets: 3, defaultReps: 20, category: "Musculação",  equipment: "Barra",     type: "isolation" },

  // ─── Core ─────────────────────────────────────────────────────────────────
  { id: "11",  name: "Prancha abdominal", muscleGroup: "Core", muscleSubgroup: "Abdominais", defaultSets: 3, defaultReps: 60, category: "Funcional",  equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "33",  name: "Abdominal supra",   muscleGroup: "Core", muscleSubgroup: "Abdominais", defaultSets: 3, defaultReps: 20, category: "Musculação", equipment: "Peso corporal", type: "core", inputMode: "reps_only" },
  { id: "34",  name: "Abdominal infra",   muscleGroup: "Core", muscleSubgroup: "Abdominais", defaultSets: 3, defaultReps: 20, category: "Musculação", equipment: "Peso corporal", type: "core", inputMode: "reps_only" },
  { id: "35",  name: "Giro russo",        muscleGroup: "Core", muscleSubgroup: "Oblíquos",   defaultSets: 3, defaultReps: 30, category: "Funcional",  equipment: "Peso corporal", type: "core", inputMode: "reps_only" },
  // bodyweight → reps_only
  { id: "105", name: "Crunch",              muscleGroup: "Core", muscleSubgroup: "Abdominais", defaultSets: 3, defaultReps: 20, category: "Musculação", equipment: "Peso corporal", type: "core", inputMode: "reps_only" },
  { id: "106", name: "Abdominal máquina",   muscleGroup: "Core", muscleSubgroup: "Abdominais", defaultSets: 3, defaultReps: 15, category: "Musculação", equipment: "Máquina",       type: "core", inputMode: "reps_only" },
  { id: "107", name: "Elevação de pernas",  muscleGroup: "Core", muscleSubgroup: "Abdominais", defaultSets: 3, defaultReps: 15, category: "Musculação", equipment: "Peso corporal", type: "core", inputMode: "reps_only" },
  { id: "108", name: "Elevação de joelhos", muscleGroup: "Core", muscleSubgroup: "Abdominais", defaultSets: 3, defaultReps: 15, category: "Musculação", equipment: "Peso corporal", type: "core", inputMode: "reps_only" },
  { id: "109", name: "Woodchopper",         muscleGroup: "Core", muscleSubgroup: "Oblíquos",   defaultSets: 3, defaultReps: 12, category: "Funcional",  equipment: "Polia",         type: "core" },
  // isometria → duration_only
  { id: "110", name: "Prancha lateral",     muscleGroup: "Core", muscleSubgroup: "Oblíquos",   defaultSets: 3, defaultReps: 30, category: "Funcional",  equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "111", name: "Dead bug",            muscleGroup: "Core", muscleSubgroup: "Abdominais", defaultSets: 3, defaultReps: 10, category: "Funcional",  equipment: "Peso corporal", type: "core", inputMode: "reps_only" },
  { id: "112", name: "Hollow hold",         muscleGroup: "Core", muscleSubgroup: "Abdominais", defaultSets: 3, defaultReps: 30, category: "Funcional",  equipment: "Peso corporal", type: "core", inputMode: "duration_only" },


  // ─── Halterofilismo olímpico ──────────────────────────────────────────────
  { id: "156", name: "Arranco",    muscleGroup: "Full Body", defaultSets: 4, defaultReps: 3, category: "Funcional", equipment: "Barra", type: "compound" },
  { id: "157", name: "Power Clean", muscleGroup: "Full Body", defaultSets: 4, defaultReps: 3, category: "Funcional", equipment: "Barra", type: "compound" },
  { id: "164", name: "Arremesso",  muscleGroup: "Full Body", defaultSets: 4, defaultReps: 3, category: "Funcional", equipment: "Barra", type: "compound" },

  // ─── Full Body ────────────────────────────────────────────────────────────
  { id: "14", name: "Kettlebell swing", muscleGroup: "Full Body", defaultSets: 3, defaultReps: 20, category: "Funcional", equipment: "Kettlebell", type: "compound" },

  // ─── Cardio ───────────────────────────────────────────────────────────────
  { id: "36",  name: "Corrida",     muscleGroup: "Pernas",    defaultSets: 1, defaultReps: 30,  category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_speed" },
  { id: "37",  name: "Ciclismo",    muscleGroup: "Pernas",    defaultSets: 1, defaultReps: 45,  category: "Funcional", equipment: "Máquina",       type: "cardio", inputMode: "duration_speed" },
  { id: "38",  name: "Pular corda", muscleGroup: "Full Body", defaultSets: 3, defaultReps: 120, category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_only" },
  { id: "154", name: "Caminhada",   muscleGroup: "Pernas",    defaultSets: 1, defaultReps: 1,   category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_speed" },
  { id: "155", name: "Trote",       muscleGroup: "Pernas",    defaultSets: 1, defaultReps: 1,   category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_speed" },

  // ─── Natação ──────────────────────────────────────────────────────────────
  { id: "147", name: "Flutuação",       muscleGroup: "Full Body", defaultSets: 3, defaultReps: 1, category: "Funcional", equipment: "Peso corporal", type: "core",  inputMode: "duration_only" },
  { id: "148", name: "Deslizamento",    muscleGroup: "Full Body", defaultSets: 4, defaultReps: 1, category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_distance" },
  { id: "149", name: "Pernadas",        muscleGroup: "Pernas",    defaultSets: 4, defaultReps: 1, category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_distance" },
  { id: "150", name: "Nado crawl",      muscleGroup: "Full Body", defaultSets: 4, defaultReps: 1, category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_distance" },
  { id: "151", name: "Nado costas",     muscleGroup: "Costas",    defaultSets: 3, defaultReps: 1, category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_distance" },
  { id: "152", name: "Nado peito",      muscleGroup: "Peito",     defaultSets: 3, defaultReps: 1, category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_distance" },
  { id: "153", name: "Nado borboleta",  muscleGroup: "Full Body", defaultSets: 3, defaultReps: 1, category: "Funcional", equipment: "Peso corporal", type: "cardio", inputMode: "duration_distance" },

  // ─── Yoga / Alongamento ───────────────────────────────────────────────────
  { id: "161", name: "Postura da montanha (Tadasana)",                              muscleGroup: "Full Body", defaultSets: 3, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "142", name: "Postura da criança (Balasana)",                               muscleGroup: "Full Body", defaultSets: 3, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "143", name: "Postura do cachorro olhando para baixo (Adho Mukha Svanasana)", muscleGroup: "Full Body", defaultSets: 3, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "144", name: "Postura do guerreiro I (Virabhadrasana I)",                   muscleGroup: "Pernas",    muscleSubgroup: "Quadríceps", defaultSets: 3, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "145", name: "Postura da árvore (Vrksasana)",                               muscleGroup: "Full Body", defaultSets: 3, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "146", name: "Postura do pombo (Eka Pada Rajakapotasana)",                  muscleGroup: "Pernas",    muscleSubgroup: "Glúteos",     defaultSets: 2, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "158", name: "Postura do triângulo (Trikonasana)",                          muscleGroup: "Full Body", defaultSets: 3, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "159", name: "Postura da cadeira (Utkatasana)",                             muscleGroup: "Pernas",    muscleSubgroup: "Quadríceps", defaultSets: 3, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "160", name: "Postura da cobra (Bhujangasana)",                             muscleGroup: "Costas",    muscleSubgroup: "Lombar",      defaultSets: 3, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },
  { id: "162", name: "Postura do meio senhor dos peixes (Ardha Matsyendrasana)",    muscleGroup: "Costas",    muscleSubgroup: "Lombar",      defaultSets: 3, defaultReps: 1, category: "Alongamento", equipment: "Peso corporal", type: "core", inputMode: "duration_only" },

  // ─── Ciclismo / alongamento complementar ─────────────────────────────────
  { id: "163", name: "Alongamento de panturrilhas", muscleGroup: "Pernas", muscleSubgroup: "Panturrilha", defaultSets: 2, defaultReps: 30, category: "Alongamento", equipment: "Peso corporal", type: "isolation", inputMode: "duration_only" },
];
