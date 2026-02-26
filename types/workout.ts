import { z } from "zod";

export type MuscleGroup =
  | "Peito"
  | "Ombro"
  | "Tríceps"
  | "Bíceps"
  | "Dorsal"
  | "Trapézio"
  | "Quadríceps"
  | "Posterior"
  | "Panturrilhas"
  | "Antebraço"
  | "Core";

export type WorkoutId = "A" | "B" | "C" | "D" | "E" | "F";

export interface WeekData {
  week: number;
  sets: number | null;
  reps: number | null;
  rest: string | null;
  load: number | null;
  volume: number | null;
}

export interface Exercise {
  id: string;
  index: number;
  muscleGroup: MuscleGroup | null;
  name: string;
  weeks: WeekData[];
  totalVolume: number;
}

export interface Workout {
  id: WorkoutId;
  label: string;
  exercises: Exercise[];
  totalVolume: number;
  lastUpdated: string;
}

export type StagnationLevel = "none" | "warning" | "critical" | "progress";

export interface StagnationStatus {
  exerciseId: string;
  level: StagnationLevel;
  weeksStagnant: number;
}

export interface ProgressionSuggestion {
  exerciseId: string;
  week: number;
  suggestedLoad: number;
  baseLoad: number;
}

export const WeekDataSchema = z.object({
  week: z.number().int().min(1).max(8),
  sets: z.number().int().min(1).max(20).nullable(),
  reps: z.number().int().min(1).max(100).nullable(),
  rest: z.string().nullable(),
  load: z.number().min(0).max(1000).nullable(),
  volume: z.number().min(0).nullable()
});

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  index: z.number().int().min(0).max(9),
  muscleGroup: z
    .union([
      z.literal("Peito"),
      z.literal("Ombro"),
      z.literal("Tríceps"),
      z.literal("Bíceps"),
      z.literal("Dorsal"),
      z.literal("Trapézio"),
      z.literal("Quadríceps"),
      z.literal("Posterior"),
      z.literal("Panturrilhas"),
      z.literal("Antebraço"),
      z.literal("Core")
    ])
    .nullable(),
  name: z.string().min(1).max(100),
  weeks: z.array(WeekDataSchema).length(8),
  totalVolume: z.number().min(0)
});

