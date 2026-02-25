import type { MuscleGroup, WorkoutId } from "../types/workout";

export const WORKOUT_IDS: WorkoutId[] = ["A", "B", "C", "D", "E", "F"];

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Peito",
  "Ombro",
  "Tríceps",
  "Bíceps",
  "Dorsal",
  "Trapézio",
  "Quadríceps",
  "Posterior",
  "Panturrilhas",
  "Antebraço",
  "Core"
];

export const MAX_EXERCISES = 10;
export const TOTAL_WEEKS = 8;
export const STAGNATION_WARNING_WEEKS = 3;
export const STAGNATION_CRITICAL_WEEKS = 4;
export const DEFAULT_PROGRESSION_PERCENTAGE = 0.025;

