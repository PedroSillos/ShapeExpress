import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  type Exercise,
  type WeekData,
  type Workout,
  type WorkoutId
} from "../types/workout";
import {
  MAX_EXERCISES,
  TOTAL_WEEKS,
  WORKOUT_IDS
} from "../utils/constants";
import {
  calculateExerciseVolume,
  calculateWeekVolume,
  calculateWorkoutVolume
} from "../utils/calculations";

interface WorkoutStore {
  workouts: Record<WorkoutId, Workout>;
  addExercise: (workoutId: WorkoutId) => void;
  updateWeekData: (
    workoutId: WorkoutId,
    exerciseIndex: number,
    week: number,
    data: Partial<WeekData>
  ) => void;
  updateExercise: (
    workoutId: WorkoutId,
    exerciseIndex: number,
    data: Partial<Pick<Exercise, "name" | "muscleGroup">>
  ) => void;
  autoFillWeeks: (
    workoutId: WorkoutId,
    exerciseIndex: number,
    fromWeek: number
  ) => void;
  resetExercise: (workoutId: WorkoutId, exerciseIndex: number) => void;
}

const createEmptyWeek = (week: number): WeekData => ({
  week,
  sets: null,
  reps: null,
  rest: null,
  load: null,
  volume: null
});

const createEmptyExercise = (index: number): Exercise => ({
  id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
  index,
  muscleGroup: null,
  name: `Exercício ${index + 1}`,
  weeks: Array.from({ length: TOTAL_WEEKS }, (_, i) => createEmptyWeek(i + 1)),
  totalVolume: 0
});

const createEmptyWorkout = (id: WorkoutId): Workout => ({
  id,
  label: `Treino ${id}`,
  exercises: [createEmptyExercise(0)],
  totalVolume: 0,
  lastUpdated: new Date().toISOString()
});

const createInitialWorkouts = (): Record<WorkoutId, Workout> => {
  return WORKOUT_IDS.reduce((acc, id) => {
    acc[id] = createEmptyWorkout(id);
    return acc;
  }, {} as Record<WorkoutId, Workout>);
};

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      workouts: createInitialWorkouts(),

      addExercise: (workoutId) => {
        set((state) => {
          const workout = state.workouts[workoutId];
          if (!workout || workout.exercises.length >= MAX_EXERCISES) {
            return state;
          }

          const newExercise = createEmptyExercise(workout.exercises.length);
          const exercises = [...workout.exercises, newExercise];

          const updatedWorkout: Workout = {
            ...workout,
            exercises,
            lastUpdated: new Date().toISOString()
          };

          return {
            workouts: {
              ...state.workouts,
              [workoutId]: updatedWorkout
            }
          };
        });
      },

      updateWeekData: (
        workoutId,
        exerciseIndex,
        week,
        data
      ): void => {
        set((state) => {
          const workout = state.workouts[workoutId];
          if (!workout) return state;

          const exercises = [...workout.exercises];
          const exercise = exercises[exerciseIndex];
          if (!exercise) return state;

          const weeks = exercise.weeks.map((w) => {
            if (w.week !== week) return w;

            const updated: WeekData = { ...w, ...data };

            const sets = updated.sets ?? undefined;
            const reps = updated.reps ?? undefined;
            const load = updated.load ?? undefined;

            const shouldRecalculateVolume =
              data.sets !== undefined ||
              data.reps !== undefined ||
              data.load !== undefined;

            if (
              shouldRecalculateVolume &&
              sets != null &&
              reps != null &&
              load != null
            ) {
              const volume = calculateWeekVolume(sets, reps, load);
              updated.volume = volume < 0 ? 0 : volume;
            } else if (shouldRecalculateVolume) {
              updated.volume = null;
            }

            return updated;
          });

          const updatedExercise: Exercise = {
            ...exercise,
            weeks
          };
          updatedExercise.totalVolume = calculateExerciseVolume(weeks);

          exercises[exerciseIndex] = updatedExercise;

          const updatedWorkout: Workout = {
            ...workout,
            exercises,
            totalVolume: calculateWorkoutVolume(exercises),
            lastUpdated: new Date().toISOString()
          };

          return {
            workouts: {
              ...state.workouts,
              [workoutId]: updatedWorkout
            }
          };
        });
      },

      updateExercise: (workoutId, exerciseIndex, data): void => {
        set((state) => {
          const workout = state.workouts[workoutId];
          if (!workout) return state;

          const exercises = [...workout.exercises];
          const exercise = exercises[exerciseIndex];
          if (!exercise) return state;

          exercises[exerciseIndex] = {
            ...exercise,
            ...data
          };

          const updatedWorkout: Workout = {
            ...workout,
            exercises,
            lastUpdated: new Date().toISOString()
          };

          return {
            workouts: {
              ...state.workouts,
              [workoutId]: updatedWorkout
            }
          };
        });
      },

      autoFillWeeks: (workoutId, exerciseIndex, fromWeek): void => {
        set((state) => {
          const workout = state.workouts[workoutId];
          if (!workout) return state;

          const exercises = [...workout.exercises];
          const exercise = exercises[exerciseIndex];
          if (!exercise) return state;

          const sourceWeek = exercise.weeks.find(
            (w) => w.week === fromWeek
          );
          if (!sourceWeek) return state;

          const weeks = exercise.weeks.map((w) => {
            if (w.week <= fromWeek) return w;

            const isEmpty = !w.sets && !w.reps;
            if (!isEmpty) return w;

            return {
              ...w,
              sets: sourceWeek.sets,
              reps: sourceWeek.reps,
              rest: sourceWeek.rest,
              load: null,
              volume: null
            };
          });

          const updatedExercise: Exercise = {
            ...exercise,
            weeks
          };
          updatedExercise.totalVolume = calculateExerciseVolume(weeks);

          exercises[exerciseIndex] = updatedExercise;

          const updatedWorkout: Workout = {
            ...workout,
            exercises,
            totalVolume: calculateWorkoutVolume(exercises),
            lastUpdated: new Date().toISOString()
          };

          return {
            workouts: {
              ...state.workouts,
              [workoutId]: updatedWorkout
            }
          };
        });
      },

      resetExercise: (workoutId, exerciseIndex): void => {
        set((state) => {
          const workout = state.workouts[workoutId];
          if (!workout) return state;

          const exercises = [...workout.exercises];
          if (!exercises[exerciseIndex]) return state;

          exercises[exerciseIndex] = createEmptyExercise(exerciseIndex);

          const updatedWorkout: Workout = {
            ...workout,
            exercises,
            totalVolume: calculateWorkoutVolume(exercises),
            lastUpdated: new Date().toISOString()
          };

          return {
            workouts: {
              ...state.workouts,
              [workoutId]: updatedWorkout
            }
          };
        });
      }
    }),
    {
      name: "workout-store",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

