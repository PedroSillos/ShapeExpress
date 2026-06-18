import { 
  ExerciseType, 
  UserTrainingProfile, 
  ExerciseUserStats, 
  WorkoutTemplateExercise,
  UserCalorieProfile,
  UserProfile,
} from '../entities';
import { EXERCISES } from '../../constants';

// Base weight as % of body weight per muscle group and exercise type
export function estimateInitialWeight(
  exerciseId: string,
  userProfile: UserProfile,
): number {
  const exercise = EXERCISES.find(e => e.id === exerciseId);
  if (!exercise || exercise.type === 'cardio' || exercise.type === 'core') return 0;

  // Fixed weight per experience level
  const weights: Record<string, number> = {
    'Nunca pratiquei': 20,
    'Iniciante':       40,
    'Intermediário':   60,
    'Avançado':        80,
  };

  const level = userProfile?.experienceLevel ?? 'Nunca pratiquei';
  return weights[level] ?? 20;
}


const TYPE_DURATIONS: Record<ExerciseType, number> = {
  compound: 4,
  isolation: 3,
  core: 2,
  cardio: 5
};

const DEFAULT_TRANSITION_DURATION = 45;

export const estimateExerciseDuration = (
  exerciseId: string,
  numSets: number,
  reps: number,
  restSeconds: number,
  userStats?: ExerciseUserStats,
  transitionDuration: number = DEFAULT_TRANSITION_DURATION
): number => {
  const exercise = EXERCISES.find(ex => ex.id === exerciseId);
  if (!exercise) return 0;

  let tempoSerie: number;
  let tempoDescanso: number;

  if (userStats) {
    tempoSerie = userStats.avg_set_duration;
    tempoDescanso = userStats.avg_rest_duration;
  } else {
    const tempoRep = TYPE_DURATIONS[exercise.type];
    tempoSerie = reps * tempoRep;
    tempoDescanso = restSeconds;
  }

  const tempoSeriesTotal = numSets * tempoSerie;
  const tempoDescansoTotal = (numSets - 1) * tempoDescanso;

  return tempoSeriesTotal + tempoDescansoTotal + transitionDuration;
};

export const estimateWorkoutDuration = (
  exercises: WorkoutTemplateExercise[],
  userProfile?: UserTrainingProfile,
  exerciseStats: ExerciseUserStats[] = []
): number => {
  const transitionDuration = userProfile?.avg_transition_duration ?? DEFAULT_TRANSITION_DURATION;
  
  const totalSeconds = exercises.reduce((acc, ex) => {
    const stats = exerciseStats.find(s => s.exercise_id === ex.exerciseId);
    
    let reps = 10;
    const repsMatch = ex.sets.match(/x(\d+)/);
    if (repsMatch) {
      reps = parseInt(repsMatch[1]);
    }

    let restSeconds = 60;
    if (ex.rest.includes(',')) {
      const rests = ex.rest.split(',').map(r => {
        const m = r.match(/(\d+)/);
        if (!m) return 60;
        let v = parseInt(m[1]);
        if (r.includes('min')) v *= 60;
        if (r.includes(':')) {
          const p = r.split(':');
          if (p.length === 2) v = parseInt(p[0]) * 60 + parseInt(p[1]);
        }
        return v;
      });
      const totalRest = rests.slice(0, ex.numSets - 1).reduce((a, b) => a + b, 0);
      restSeconds = ex.numSets > 1 ? totalRest / (ex.numSets - 1) : 0;
    } else {
      const restMatch = ex.rest.match(/(\d+)/);
      if (restMatch) {
        restSeconds = parseInt(restMatch[1]);
        if (ex.rest.includes('min')) restSeconds *= 60;
        if (ex.rest.includes(':')) {
          const p = ex.rest.split(':');
          if (p.length === 2) restSeconds = parseInt(p[0]) * 60 + parseInt(p[1]);
        }
      }
    }

    return acc + estimateExerciseDuration(
      ex.exerciseId,
      ex.numSets,
      reps,
      restSeconds,
      stats,
      transitionDuration
    );
  }, 0);

  return Math.ceil(totalSeconds / 60);
};

const MET_VALUES: Record<ExerciseType, number> = {
  compound: 6.0,
  isolation: 4.5,
  core: 3.8,
  cardio: 8.0
};

export const calculateCaloriesPerMinute = (
  met: number,
  weightKg: number,
  userCalorieProfile?: UserCalorieProfile
): number => {
  const metCalc = (met * weightKg * 3.5) / 200;
  
  if (userCalorieProfile && userCalorieProfile.total_workouts > 10) {
    return (userCalorieProfile.avg_calories_per_minute * 0.6) + (metCalc * 0.4);
  }
  
  return metCalc;
};

export const calculateExerciseCalories = (
  exerciseId: string,
  numSets: number,
  reps: number,
  durationSeconds: number,
  weightKg: number,
  userCalorieProfile?: UserCalorieProfile
): number => {
  const exercise = EXERCISES.find(ex => ex.id === exerciseId);
  if (!exercise) return 0;

  const met = MET_VALUES[exercise.type] || 4.5;
  const caloriesPerMinute = calculateCaloriesPerMinute(met, weightKg, userCalorieProfile);
  const durationMinutes = durationSeconds / 60;
  
  let calories = caloriesPerMinute * durationMinutes;
  
  const volume = numSets * reps;
  let multiplier = 1.0;
  if (volume < 30) multiplier = 0.9;
  else if (volume > 60) multiplier = 1.1;
  
  return calories * multiplier;
};

export const estimateWorkoutCalories = (
  exercises: WorkoutTemplateExercise[],
  weightKg: number,
  userProfile?: UserTrainingProfile,
  exerciseStats: ExerciseUserStats[] = [],
  userCalorieProfile?: UserCalorieProfile
): number => {
  const transitionDuration = userProfile?.avg_transition_duration ?? DEFAULT_TRANSITION_DURATION;
  
  return exercises.reduce((acc, ex) => {
    const stats = exerciseStats.find(s => s.exercise_id === ex.exerciseId);
    
    let reps = 10;
    const repsMatch = ex.sets.match(/x(\d+)/);
    if (repsMatch) {
      reps = parseInt(repsMatch[1]);
    }

    let restSeconds = 60;
    if (ex.rest.includes(',')) {
      const rests = ex.rest.split(',').map(r => {
        const m = r.match(/(\d+)/);
        if (!m) return 60;
        let v = parseInt(m[1]);
        if (r.includes('min')) v *= 60;
        if (r.includes(':')) {
          const p = r.split(':');
          if (p.length === 2) v = parseInt(p[0]) * 60 + parseInt(p[1]);
        }
        return v;
      });
      const totalRest = rests.slice(0, ex.numSets - 1).reduce((a, b) => a + b, 0);
      restSeconds = ex.numSets > 1 ? totalRest / (ex.numSets - 1) : 0;
    } else {
      const restMatch = ex.rest.match(/(\d+)/);
      if (restMatch) {
        restSeconds = parseInt(restMatch[1]);
        if (ex.rest.includes('min')) restSeconds *= 60;
        if (ex.rest.includes(':')) {
          const p = ex.rest.split(':');
          if (p.length === 2) restSeconds = parseInt(p[0]) * 60 + parseInt(p[1]);
        }
      }
    }

    const durationSeconds = estimateExerciseDuration(
      ex.exerciseId,
      ex.numSets,
      reps,
      restSeconds,
      stats,
      transitionDuration
    );

    return acc + calculateExerciseCalories(
      ex.exerciseId,
      ex.numSets,
      reps,
      durationSeconds,
      weightKg,
      userCalorieProfile
    );
  }, 0);
};

export const updateCalorieProfile = (
  currentProfile: UserCalorieProfile,
  sessionCalories: number,
  sessionDurationSeconds: number
): UserCalorieProfile => {
  const sessionCpm = sessionCalories / (sessionDurationSeconds / 60);
  
  return {
    ...currentProfile,
    avg_calories_per_minute: calculateNewAverage(currentProfile.avg_calories_per_minute, sessionCpm),
    avg_workout_calories: calculateNewAverage(currentProfile.avg_workout_calories, sessionCalories),
    total_workouts: currentProfile.total_workouts + 1
  };
};

export const calculateNewAverage = (oldAvg: number, newValue: number): number => {
  return (oldAvg * 0.7) + (newValue * 0.3);
};

export const updateTrainingProfile = (
  currentProfile: UserTrainingProfile,
  sessionData: {
    avgSetDuration: number;
    avgRestDuration: number;
    avgTransitionDuration: number;
    totalDuration: number;
  }
): UserTrainingProfile => {
  return {
    ...currentProfile,
    avg_set_duration: calculateNewAverage(currentProfile.avg_set_duration, sessionData.avgSetDuration),
    avg_rest_duration: calculateNewAverage(currentProfile.avg_rest_duration, sessionData.avgRestDuration),
    avg_transition_duration: calculateNewAverage(currentProfile.avg_transition_duration, sessionData.avgTransitionDuration),
    avg_workout_duration: calculateNewAverage(currentProfile.avg_workout_duration, sessionData.totalDuration)
  };
};

export const updateExerciseStats = (
  currentStats: ExerciseUserStats,
  sessionData: {
    avgSetDuration: number;
    avgRestDuration: number;
  }
): ExerciseUserStats => {
  return {
    ...currentStats,
    avg_set_duration: calculateNewAverage(currentStats.avg_set_duration, sessionData.avgSetDuration),
    avg_rest_duration: calculateNewAverage(currentStats.avg_rest_duration, sessionData.avgRestDuration)
  };
};
