import type { StagnationLevel } from "../types/workout";

export const STATUS_COLORS = {
  progress: "#22c55e",
  warning: "#f97316",
  critical: "#ef4444",
  none: "#6b7280",
  suggestion: "#eab308"
} as const;

export function getStagnationColor(level: StagnationLevel): string {
  return STATUS_COLORS[level];
}

