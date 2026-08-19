import { useEffect } from 'react';
import { startOfWeek, endOfWeek, subWeeks, parseISO, isWithinInterval, format } from 'date-fns';
import { WorkoutSession, UserStats, UserProfile } from '../../domain/entities';
import { STORAGE_KEYS } from '../../shared/lib/storageKeys';

interface UseWeeklyGoalParams {
  isLoggedIn: boolean;
  userSessions: WorkoutSession[];
  userStats: UserStats;
  userProfile: UserProfile;
  updateStats: (s: UserStats) => void;
}

export function useWeeklyGoal({ isLoggedIn, userSessions, userStats, userProfile, updateStats }: UseWeeklyGoalParams) {
  const weeklyGoal = userProfile.weeklyGoal ?? 3;

  useEffect(() => {
    if (!isLoggedIn || userSessions.length === 0) return;

    const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_GOAL_CHECK);
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 0 });

    if (lastCheck) {
      const lastCheckWeekStart = startOfWeek(parseISO(lastCheck), { weekStartsOn: 0 });

      if (currentWeekStart > lastCheckWeekStart) {
        const previousWeekStart = subWeeks(currentWeekStart, 1);
        const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 0 });

        const distinctDaysInPreviousWeek = new Set(
          userSessions
            .filter(s => isWithinInterval(parseISO(s.date), { start: previousWeekStart, end: previousWeekEnd }))
            .map(s => s.date.slice(0, 10)),
        ).size;

        if (distinctDaysInPreviousWeek < weeklyGoal) {
          alert(`Você não bateu sua meta de ${weeklyGoal} treinos na semana passada. Sua streak foi zerada!`);
          updateStats({ ...userStats, streakResetDate: format(previousWeekEnd, 'yyyy-MM-dd') });
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.LAST_GOAL_CHECK, now.toISOString());
  }, [isLoggedIn, userSessions, weeklyGoal]);
}
