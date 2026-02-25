import type { StagnationLevel, WeekData } from "../types/workout";

export function detectStagnation(weeks: WeekData[]): StagnationLevel {
  const loadedWeeks = weeks
    .filter((w) => w.load !== null)
    .sort((a, b) => a.week - b.week);

  if (loadedWeeks.length < 2) return "none";

  let stagnantCount = 0;
  for (let i = loadedWeeks.length - 1; i > 0; i -= 1) {
    if (loadedWeeks[i].load! <= loadedWeeks[i - 1].load!) {
      stagnantCount += 1;
    } else {
      break;
    }
  }

  if (stagnantCount === 0) return "progress";
  if (stagnantCount >= 4) return "critical";
  if (stagnantCount >= 3) return "warning";
  return "none";
}

