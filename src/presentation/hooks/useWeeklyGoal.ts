import { useEffect } from 'react';
import { startOfWeek, endOfWeek, subWeeks, parseISO, isWithinInterval, format } from 'date-fns';
import { WorkoutSession, UserStats } from '../../domain/entities';

interface UseWeeklyGoalParams {
  isLoggedIn: boolean;
  userSessions: WorkoutSession[];
  userStats: UserStats;
  updateStats: (s: UserStats) => void;
}

export function useWeeklyGoal({ isLoggedIn, userSessions, userStats, updateStats }: UseWeeklyGoalParams) {
  useEffect(() => {
    if (!isLoggedIn || userSessions.length === 0) return;

    const lastCheck = localStorage.getItem('shapeexpress_last_goal_check');
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });

    if (lastCheck) {
      const lastCheckWeekStart = startOfWeek(parseISO(lastCheck), { weekStartsOn: 1 });

      if (currentWeekStart > lastCheckWeekStart) {
        const previousWeekStart = subWeeks(currentWeekStart, 1);
        const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });

        const sessionsInPreviousWeek = userSessions.filter(s =>
          isWithinInterval(parseISO(s.date), { start: previousWeekStart, end: previousWeekEnd }),
        ).length;

        if (sessionsInPreviousWeek < userStats.weeklyGoal) {
          alert(`Você não bateu sua meta de ${userStats.weeklyGoal} treinos na semana passada. Sua streak foi zerada!`);
          updateStats({ ...userStats, streakResetDate: format(previousWeekEnd, 'yyyy-MM-dd') });
        }
      }
    }

    localStorage.setItem('shapeexpress_last_goal_check', now.toISOString());
  }, [isLoggedIn, userSessions, userStats.weeklyGoal]);
}
