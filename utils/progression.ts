import type { ProgressionSuggestion, WeekData } from "../types/workout";

export function suggestProgression(
  weeks: WeekData[],
  targetWeek: number
): ProgressionSuggestion | null {
  const baseWeek = weeks.find((w) => w.week === targetWeek - 2);
  if (!baseWeek?.load) return null;

  const increment = baseWeek.load <= 20 ? 1 : baseWeek.load * 0.025;
  const suggestedLoad = Math.round((baseWeek.load + increment) * 2) / 2;

  return {
    exerciseId: "",
    week: targetWeek,
    suggestedLoad,
    baseLoad: baseWeek.load
  };
}

