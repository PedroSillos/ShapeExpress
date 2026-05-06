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
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const calculatedStreak = useMemo(() => {
    if (userSessions.length === 0) return 0;

    let sessionDates = Array.from(
      new Set(
        userSessions.map((s) => {
          try { return format(parseISO(s.date), "yyyy-MM-dd"); }
          catch (e) { return ""; }
        }),
      ),
    ).filter((d) => d !== "").sort((a, b) => b.localeCompare(a));

    if (userStats.streakResetDate) {
      sessionDates = sessionDates.filter((d) => d > userStats.streakResetDate!);
    }

    if (sessionDates.length === 0) return 0;

    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

    if (sessionDates[0] !== today && sessionDates[0] !== yesterday) return 0;

    let streak = 1;
    let currentDate = parseISO(sessionDates[0]);

    for (let i = 1; i < sessionDates.length; i++) {
      const expectedPrevDate = new Date(currentDate.getTime() - 86400000);
      const expectedPrevDateStr = format(expectedPrevDate, "yyyy-MM-dd");
      if (sessionDates[i] === expectedPrevDateStr) {
        streak++;
        currentDate = expectedPrevDate;
      } else {
        break;
      }
    }
    return streak;
  }, [userSessions, userStats.streakResetDate]);

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
    setAiAdvice(null);
  };

  return {
    progressionAlerts, setProgressionAlerts,
    stagnationReports, setStagnationReports,
    progressScore, setProgressScore,
    aiAdvice, setAiAdvice,
    isAiLoading, setIsAiLoading,
    calculatedStreak,
    personalRecords,
    resetProgressStates,
  };
};
