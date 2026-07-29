import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { EXERCISES } from "../../constants";
import type {
  ProgressionAlert,
  StagnationReport,
  ProgressScore,
  WorkoutSession,
  UserStats,
} from "../../domain/entities";

export const useProgressState = (
  userSessions: WorkoutSession[],
  userStats: UserStats,
) => {
  const [progressionAlerts, setProgressionAlerts] = useState<ProgressionAlert[]>([]);
  const [stagnationReports, setStagnationReports] = useState<StagnationReport[]>([]);
  const [progressScore, setProgressScore] = useState<ProgressScore | null>(null);

  const personalRecords = useMemo(() => {
    const prs: { [key: string]: { weight: number; date: string; name: string } } = {};
    userSessions.forEach((session) => {
      session.exercises.forEach((ex) => {
        const exercise = EXERCISES.find((e) => e.id === ex.exerciseId);
        if (!exercise) return;
        const maxWeight = Math.max(...ex.sets.map((s) => (s.completed ? s.weight : 0)));
        if (maxWeight > 0) {
          if (!prs[ex.exerciseId] || maxWeight > prs[ex.exerciseId].weight) {
            prs[ex.exerciseId] = { weight: maxWeight, date: session.date, name: exercise.name };
          }
        }
      });
    });
    return Object.values(prs).sort((a, b) => b.weight - a.weight).slice(0, 3);
  }, [userSessions]);

  const resetProgressStates = () => {
    setProgressionAlerts([]);
    setStagnationReports([]);
    setProgressScore(null);
  };

  return {
    progressionAlerts, setProgressionAlerts,
    stagnationReports, setStagnationReports,
    progressScore, setProgressScore,
    personalRecords,
    resetProgressStates,
  };
};
