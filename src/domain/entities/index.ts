export type MuscleGroup =
  | "Peito"
  | "Costas"
  | "Pernas"
  | "Ombros"
  | "Braços"
  | "Core"
  | "Full Body";

export type MuscleSubgroup =
  | "Peito superior"
  | "Peito médio"
  | "Peito inferior"
  | "Dorsal"
  | "Trapézio"
  | "Lombar"
  | "Quadríceps"
  | "Posterior"
  | "Glúteos"
  | "Adutor"
  | "Abdutor"
  | "Panturrilha"
  | "Deltoide Anterior"
  | "Deltoide Lateral"
  | "Deltoide Posterior"
  | "Bíceps"
  | "Tríceps"
  | "Antebraço"
  | "Abdominais"
  | "Oblíquos"
  | "Lombar (Core)";

export type ExerciseCategory =
  | "Musculação"
  | "Alongamento"
  | "Exercício em casa"
  | "Funcional";
export type Equipment =
  | "Barra"
  | "Halter"
  | "Máquina"
  | "Peso corporal"
  | "Elástico"
  | "Kettlebell"
  | "Polia"
  | "Barra fixa"
  | "Smith"
  | "Banco Scott";
export type ExerciseType = "compound" | "isolation" | "core" | "cardio";

export type ExerciseInputMode =
  | "weight_reps"       // musculação padrão
  | "reps_only"         // peso corporal sem carga
  | "duration_distance" // corrida, natação, ciclismo
  | "duration_only";    // alongamento, cardio sem métrica

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  muscleSubgroup?: MuscleSubgroup;
  defaultSets: number;
  defaultReps: number;
  category: ExerciseCategory;
  equipment: Equipment;
  type: ExerciseType;
  youtubeUrl?: string;
  inputMode?: ExerciseInputMode;
}

export interface UserTrainingProfile {
  user_id: string;
  userEmail?: string;
  avg_set_duration: number;
  avg_rest_duration: number;
  avg_transition_duration: number;
  avg_workout_duration: number;
  preferred_time?: "Manhã" | "Tarde" | "Noite";
  focus_areas?: string[];
}

export interface ExerciseUserStats {
  user_id: string;
  userEmail?: string;
  exercise_id: string;
  avg_set_duration: number;
  avg_rest_duration: number;
}

export interface UserCalorieProfile {
  user_id: string;
  userEmail?: string;
  avg_calories_per_minute: number;
  avg_workout_calories: number;
  total_workouts: number;
  total_calories_burned: number;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  rest?: string;
  corrected?: boolean;
  durationSeconds?: number;
  distanceMeters?: number;
  speedKmh?: number;
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId?: string;
  userEmail?: string;
  workoutId: string;
  workoutName?: string;
  sheetId?: string;
  date: string;
  startTime?: string;
  duration?: number;
  exercises: ExerciseSession[];
  totalVolume: number;
  xpEarned: number;
  caloriesBurned?: number;
}

export interface WorkoutTemplateExercise {
  exerciseId: string;
  sets: string;
  numSets: number;
  rest: string;
  notes?: string;
  substitutions?: string[];
}

export interface WorkoutSheet {
  id: string;
  name: string;
  order: number;
  exerciseIds: string[];
  exercises: WorkoutTemplateExercise[];
}

export type WorkoutCategory = "basic" | "multicycle";

export interface WorkoutCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  sheets: WorkoutSheet[];
}

export interface WorkoutTemplate {
  id: string;
  userId?: string;
  creatorEmail?: string;
  name: string;
  sport?: string;
  category: WorkoutCategory;
  startDate: string;
  endDate: string;
  sheets?: WorkoutSheet[];
  cycles?: WorkoutCycle[];
  exerciseIds?: string[];
  exercises?: WorkoutTemplateExercise[];
}


export type League =
  | "Bronze"
  | "Prata"
  | "Ouro"
  | "Platina"
  | "Esmeralda"
  | "Diamante";

export interface UserStats {
  level: number;
  xp: number;
  streak: number;
  bestStreak: number;
  completedThisWeek: number;
  totalWorkouts: number;
  totalVolume: number;
  medalsCount: number;
  streakResetDate?: string;
  league?: League;
  score?: number;
  status?: "evolving" | "stagnated" | "at-risk" | "new";
  userEmail?: string;
}

export interface UserProfile {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  userType?: "treinador" | "atleta";
  height: number;
  initialWeight: number;
  objective: string;
  birthDate: string;
  experienceLevel?: "Iniciante" | "Intermediário" | "Avançado";
  limitations?: string;
  preferredStyle?: string;
  cref?: string;
  experienceYears?: string;
  specialties?: string[];
  serviceType?: "Presencial" | "Online" | "Ambos";
  worksInGym?: boolean;
  gymName?: string;
  studentsCount?: string;
  bio?: string;
  instagram?: string;
  personalCode?: string;
  personalCodeConnected?: string;
  age?: number;
  weeklyGoal?: number;
}

/** Returns the full display name from a UserProfile (or any object with firstName/lastName). */
export function fullName(p: { firstName: string; lastName?: string }): string {
  return [p.firstName, p.lastName].filter(Boolean).join(' ');
}

export type AssessmentMethod = "7 Dobras" | "3 Dobras" | "Bioimpedância";

export interface BodyAssessment {
  id: string;
  userEmail?: string;
  date: string;
  method: AssessmentMethod;
  weight: number;
  height?: number;
  bodyFat: number;
  arm?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thigh?: number;
  leg?: number;
  calf?: number;
  skinfolds?: {
    subscapular?: number;
    triceps?: number;
    chest?: number;
    axillary?: number;
    suprailiac?: number;
    abdominal?: number;
    thigh?: number;
  };
  targetWeight?: number;
  targetBodyFat?: number;
  observation?: string;
  photoUrl?: string;
}

export interface ProgressionAlert {
  type: "PR" | "Weekly" | "Program";
  title: string;
  description: string;
  icon: string;
  color?: string;
}

export interface StagnationReport {
  exerciseId: string;
  exerciseName: string;
  level: "leve" | "moderada" | "severa";
  sessionsCount: number;
  type:
    | "carga travada"
    | "repetições travadas"
    | "queda de desempenho"
    | "falha frequente";
  suggestion: string;
}

export interface ProgressScore {
  score: number;
  classification:
    | "regressão"
    | "estagnação"
    | "progresso moderado"
    | "progresso incrível"
    | "progresso";
  factors: {
    loadProgression: number;
    repsProgression: number;
    trainingVolume: number;
    consistency: number;
  };
  trend: "subindo" | "estável" | "descendo";
  message: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  lastWorkout: string;
  progress: number;
  streak: number;
  status: "evolving" | "stagnated" | "at-risk" | "new";
  weeklyWorkouts: number[];
  score: number;
  objective?: string;
  experienceLevel?: string;
  connectionStatus?: "accepted" | "disconnected";
  planId?: string;
  joinedAt?: string;
  cancelledAt?: string;
  paymentStatus?: "paid" | "late" | "pending";
  dueDate?: string;
}

export interface TrainerConnection {
  id: string;
  studentEmail: string;
  trainerEmail: string;
  trainerName?: string;
  trainerAvatar?: string;
  status: "pending" | "accepted" | "rejected" | "disconnected";
  createdAt: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

/** A single workout template listed for sale in the store */
export interface StoreWorkout {
  id: string;
  type: 'workout';
  creatorEmail: string;
  creatorName: string;
  creatorAvatar?: string;
  /** Reference to the WorkoutTemplate document id */
  templateId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  /** Price in BRL cents (e.g. 9700 = R$ 97,00) */
  price: number;
  tags: string[];
  rating: number;
  salesCount: number;
  createdAt: string;
  status: 'draft' | 'published';
}

/** A bundle of workout templates listed for sale as a program */
export interface StoreProgram {
  id: string;
  type: 'program';
  creatorEmail: string;
  creatorName: string;
  creatorAvatar?: string;
  /** References to WorkoutTemplate document ids included in this program */
  templateIds: string[];
  title: string;
  description?: string;
  coverImageUrl?: string;
  /** Total duration in weeks (e.g. 24 = 6 months) */
  durationWeeks: number;
  price: number;
  tags: string[];
  rating: number;
  salesCount: number;
  createdAt: string;
  status: 'draft' | 'published';
}

export type StoreItem = StoreWorkout | StoreProgram;

/** A confirmed purchase recorded after Stripe payment */
export interface StorePurchase {
  id: string;
  buyerEmail: string;
  itemId: string;
  itemType: 'workout' | 'program';
  stripeSessionId: string;
  purchasedAt: string;
}

