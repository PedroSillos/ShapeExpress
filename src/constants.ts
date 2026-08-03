import {
  WorkoutTemplate,
  UserStats,
  UserTrainingProfile,
  UserProfile,
} from "./domain/entities";

export { EXERCISES } from "./domain/entities/exercises";


export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [];


export const MOCK_PROTOCOLS = [];

export const DEFAULT_STATS: UserStats = {
  level: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  completedThisWeek: 0,
  totalWorkouts: 0,
  totalVolume: 0,
  medalsCount: 0,
  league: "Bronze",
};

export const DEFAULT_TRAINING_PROFILE: UserTrainingProfile = {
  user_id: "",
  avg_set_duration: 45,
  avg_rest_duration: 90,
  avg_transition_duration: 120,
  avg_workout_duration: 3600,
};

export const DEFAULT_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  height: 0,
  initialWeight: 0,
  objective: "",
  birthDate: "",
  userType: "atleta",
};
