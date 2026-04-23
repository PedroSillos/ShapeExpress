import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type MuscleGroup = 'Peito' | 'Costas' | 'Pernas' | 'Ombros' | 'Braços' | 'Core' | 'Full Body';

export type MuscleSubgroup = 
  | 'Peito superior' | 'Peito médio' | 'Peito inferior'
  | 'Dorsal' | 'Trapézio' | 'Lombar'
  | 'Quadríceps' | 'Posterior' | 'Glúteos' | 'Adutor' | 'Abdutor' | 'Panturrilha'
  | 'Deltoide Anterior' | 'Deltoide Lateral' | 'Deltoide Posterior'
  | 'Bíceps' | 'Tríceps' | 'Antebraço'
  | 'Abdominais' | 'Oblíquos' | 'Lombar (Core)';

export type ExerciseCategory = 'Musculação' | 'Alongamento' | 'Exercício em casa' | 'Funcional';
export type Equipment = 'Barra' | 'Halter' | 'Máquina' | 'Peso corporal' | 'Elástico' | 'Kettlebell';
export type ExerciseType = 'compound' | 'isolation' | 'core' | 'cardio';

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
}

export interface UserTrainingProfile {
  user_id: string;
  userEmail?: string;
  avg_set_duration: number;
  avg_rest_duration: number;
  avg_transition_duration: number;
  avg_workout_duration: number;
  preferred_time?: 'Manhã' | 'Tarde' | 'Noite';
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
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  userId?: string; // ID of the user who performed the session
  userEmail?: string;
  workoutId: string;
  workoutName?: string;
  sheetId?: string;
  date: string; // ISO string
  startTime?: string; // ISO string
  duration?: number; // in seconds
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

export type WorkoutCategory = 'basic' | 'multicycle';

export interface WorkoutCycle {
  id: string;
  name: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  sheets: WorkoutSheet[];
}

export interface WorkoutTemplate {
  id: string;
  userId?: string; // ID of the user this template belongs to
  creatorEmail?: string;
  name: string;
  category: WorkoutCategory;
  startDate: string; // ISO string
  endDate: string; // ISO string
  sheets?: WorkoutSheet[]; // For basic workout
  cycles?: WorkoutCycle[]; // For multicycle workout
  // Legacy fields for backward compatibility
  exerciseIds?: string[];
  exercises?: WorkoutTemplateExercise[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'Consistency' | 'Strength' | 'Volume' | 'Frequency' | 'Engagement' | 'Mentorship' | 'Community' | 'Challenges';
  criteria: string;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
  icon: string;
  xpValue: number;
}

export type League = 'Bronze' | 'Prata' | 'Ouro' | 'Platina' | 'Esmeralda' | 'Diamante';

export interface UserStats {
  level: number;
  xp: number;
  streak: number;
  bestStreak: number;
  weeklyGoal: number;
  completedThisWeek: number;
  totalWorkouts: number;
  totalVolume: number;
  medalsCount: number;
  streakResetDate?: string;
  league?: League;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  userType?: 'treinador' | 'atleta';
  height: number;
  initialWeight: number;
  objective: string;
  birthDate: string;
  avatarUrl: string;
  trainingFrequency?: number;
  experienceLevel?: 'Iniciante' | 'Intermediário' | 'Avançado';
  limitations?: string;
  preferredStyle?: string;
  // Trainer specific
  cref?: string;
  experienceYears?: string;
  specialties?: string[];
  serviceType?: 'Presencial' | 'Online' | 'Ambos';
  worksInGym?: boolean;
  gymName?: string;
  studentsCount?: string;
  bio?: string;
  instagram?: string;
  personalCode?: string;
  // Athlete specific
  hasPersonal?: boolean;
  personalCodeConnected?: string;
  age?: number;
  trainingLocation?: 'Casa' | 'Academia';
}

export type AssessmentMethod = '7 Dobras' | '3 Dobras' | 'Bioimpedância';

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
  type: 'PR' | 'Weekly' | 'Program';
  title: string;
  description: string;
  icon: string;
  color?: string;
}

export interface StagnationReport {
  exerciseId: string;
  exerciseName: string;
  level: 'leve' | 'moderada' | 'severa';
  sessionsCount: number;
  type: 'carga travada' | 'repetições travadas' | 'queda de desempenho' | 'falha frequente';
  suggestion: string;
}

export interface ProgressScore {
  score: number;
  classification: 'regressão' | 'estagnação' | 'progresso moderado' | 'progresso incrível' | 'progresso';
  factors: {
    loadProgression: number;
    repsProgression: number;
    trainingVolume: number;
    consistency: number;
  };
  trend: 'subindo' | 'estável' | 'descendo';
  message: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  lastWorkout: string;
  progress: number;
  streak: number;
  status: 'evolving' | 'stagnated' | 'at-risk' | 'new';
  weeklyWorkouts: number[];
  score: number;
  objective?: string;
  experienceLevel?: string;
}

export interface StudentRequest {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  requestedAt: string;
  objective: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderEmail?: string;
  receiverId: string;
  receiverEmail?: string;
  text: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userEmail?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert' | 'connection_request' | 'connection_response' | 'workout_assigned' | 'chat_message';
  data?: any;
}
