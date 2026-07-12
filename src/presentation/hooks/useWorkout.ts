import { parseISO, subWeeks, isWithinInterval, differenceInWeeks, format } from 'date-fns';
import React from 'react';
import {
  WorkoutTemplate, WorkoutSession, WorkoutSheet, UserProfile, UserStats,
  UserTrainingProfile, ExerciseUserStats, UserCalorieProfile, BodyAssessment,
  ProgressionAlert, StagnationReport,
} from '../../domain/entities';
import {
  estimateWorkoutDuration, estimateWorkoutCalories,
  updateTrainingProfile, updateExerciseStats, updateCalorieProfile, estimateInitialWeight,
} from '../../domain/use-cases/workoutEstimation';
import { analyzeExerciseStagnation } from '../../domain/use-cases/analyzeStagnation';
import { EXERCISES } from '../../constants';
import { getInputMode } from '../../domain/use-cases/exerciseInputMode';

interface UseWorkoutParams {
  api: any;
  userProfile: UserProfile;
  userStats: UserStats;
  userTrainingProfile: UserTrainingProfile;
  exerciseUserStats: ExerciseUserStats[];
  userCalorieProfile: UserCalorieProfile;
  assessments: BodyAssessment[];
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  userSessions: WorkoutSession[];
  activeWorkout: WorkoutSession | null;
  setActiveWorkout: (s: WorkoutSession | null) => void;
  setShowWorkoutSelector: (v: boolean) => void;
  setLastCompletedSession: (s: WorkoutSession | null) => void;
  setProgressionAlerts: (a: ProgressionAlert[]) => void;
  setStagnationReports: (r: StagnationReport[]) => void;
  setUserTrainingProfile: (p: UserTrainingProfile) => void;
  setExerciseUserStats: (s: ExerciseUserStats[]) => void;
  setUserCalorieProfile: (p: UserCalorieProfile) => void;
  createSession: (s: WorkoutSession) => Promise<void>;
  updateStats: (s: UserStats) => Promise<void>;
}

export function useWorkout({
  api, userProfile, userStats, userTrainingProfile, exerciseUserStats,
  userCalorieProfile, assessments, sessions, templates, userSessions,
  activeWorkout, setActiveWorkout, setShowWorkoutSelector,
  setLastCompletedSession, setProgressionAlerts, setStagnationReports,
  setUserTrainingProfile, setExerciseUserStats, setUserCalorieProfile,
  createSession, updateStats,
}: UseWorkoutParams) {

  const activeWorkoutRef = React.useRef(activeWorkout);
  React.useEffect(() => { activeWorkoutRef.current = activeWorkout; }, [activeWorkout]);

  const startWorkout = (template: WorkoutTemplate, sheetIndex?: number) => {
    let sheets: WorkoutSheet[] = [];

    if (template.category === 'multicycle' && template.cycles) {
      const now = new Date();
      const currentCycle = template.cycles.find(c => {
        const start = parseISO(c.startDate);
        const end = parseISO(c.endDate);
        return now >= start && now <= end;
      });
      if (currentCycle) sheets = currentCycle.sheets;
    } else if (template.sheets) {
      sheets = template.sheets;
    }

    const sheet = sheets.length > 0 ? sheets[sheetIndex !== undefined ? sheetIndex : 0] : null;
    const exercisesToUse = sheet
      ? sheet.exercises
      : (template.exercises && template.exercises.length > 0
        ? template.exercises
        : (template.exerciseIds || []).map(id => ({ exerciseId: id, sets: '10', numSets: 3, rest: '1 min' })));

    if (exercisesToUse.length === 0) {
      alert('Este treino não possui exercícios configurados.');
      return;
    }

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      userId: userProfile?.email || '',
      workoutId: template.id,
      sheetId: sheet?.id,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      exercises: exercisesToUse.map(config => {
        const lastSessionWithExercise = userSessions.find(s =>
          s.exercises.some(ex => ex.exerciseId === config.exerciseId),
        );
        const lastWeight = lastSessionWithExercise?.exercises
          .find(ex => ex.exerciseId === config.exerciseId)?.sets[0]?.weight
          ?? estimateInitialWeight(config.exerciseId, userProfile);

        return {
          id: Math.random().toString(36).substr(2, 9),
          exerciseId: config.exerciseId,
          sets: Array.from({ length: config.numSets || 3 }).map((_, i) => {
            const repsArray = config.sets.split(',').map((s: string) => parseInt(s.trim()));
            const reps = repsArray[i] !== undefined && !isNaN(repsArray[i]) ? repsArray[i] : (repsArray[0] || 10);
            const restArray = config.rest.split(',').map((s: string) => s.trim());
            const rest = restArray[i] !== undefined ? restArray[i] : (restArray[0] || '1 min');
            const exerciseData = EXERCISES.find(e => e.id === config.exerciseId);
            const inputMode = getInputMode(exerciseData ?? { inputMode: undefined } as any);
            const isDuration = inputMode === 'duration_distance' || inputMode === 'duration_only';
            return {
              id: `${Date.now()}-${i}`,
              reps: isDuration ? 0 : reps,
              weight: isDuration || inputMode === 'reps_only' ? 0 : lastWeight,
              completed: false,
              rest,
              ...(isDuration ? { durationSeconds: 0 } : {}),
            };
          }),
        };
      }),
      totalVolume: 0,
      xpEarned: 0,
    };

    setActiveWorkout(newSession);
    setShowWorkoutSelector(false);
  };

  const finishWorkout = (metrics: { avgSetDuration: number; avgRestDuration: number; totalDuration: number }) => {
    const activeWorkout = activeWorkoutRef.current;
    if (!activeWorkout) return;

    const completedSets = activeWorkout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
    const durationMinutes = Math.floor(metrics.totalDuration / 60);
    const calculatedXp = 50 + completedSets * 10 + durationMinutes * 2;

    const completedSession: WorkoutSession = {
      ...activeWorkout,
      totalVolume: activeWorkout.exercises.reduce(
        (acc, ex) => {
          const exerciseData = EXERCISES.find(e => e.id === ex.exerciseId);
          const inputMode = getInputMode(exerciseData ?? { inputMode: undefined } as any);
          if (inputMode !== 'weight_reps') return acc;
          return acc + ex.sets.reduce((sAcc, s) => sAcc + (s.completed ? s.reps * s.weight : 0), 0);
        }, 0,
      ),
      duration: metrics.totalDuration,
      xpEarned: calculatedXp,
      caloriesBurned: 0,
    };

    // Calories
    const weightKg = assessments.length > 0 ? assessments[0].weight : userProfile?.initialWeight;
    const template = templates.find(t => t.id === activeWorkout.workoutId);
    const sheet = template?.sheets?.find(s => s.id === activeWorkout.sheetId) || (template?.sheets ? template.sheets[0] : null);

    if (sheet) {
      const estimatedCalories = estimateWorkoutCalories(sheet.exercises, weightKg, userTrainingProfile, exerciseUserStats, userCalorieProfile);
      const sessionCpm = estimatedCalories / estimateWorkoutDuration(sheet.exercises, userTrainingProfile, exerciseUserStats);
      const actualCalories = Math.round(sessionCpm * (metrics.totalDuration / 60));
      completedSession.caloriesBurned = actualCalories;
      setUserCalorieProfile(updateCalorieProfile(userCalorieProfile, actualCalories, metrics.totalDuration));
    }

    createSession(completedSession);
    setActiveWorkout(null);
    setLastCompletedSession(completedSession);

    // Training profile evolution
    const newProfile = updateTrainingProfile(userTrainingProfile, {
      avgSetDuration: metrics.avgSetDuration,
      avgRestDuration: metrics.avgRestDuration,
      avgTransitionDuration: 45,
      totalDuration: metrics.totalDuration,
    });
    setUserTrainingProfile(newProfile);
    api.updateTrainingProfile(newProfile);

    // Exercise stats
    const newExerciseStats = [...exerciseUserStats];
    activeWorkout.exercises.forEach(ex => {
      const idx = newExerciseStats.findIndex(s => s.exercise_id === ex.exerciseId);
      if (idx >= 0) {
        newExerciseStats[idx] = updateExerciseStats(newExerciseStats[idx], {
          avgSetDuration: metrics.avgSetDuration, avgRestDuration: metrics.avgRestDuration,
        });
      } else {
        newExerciseStats.push({
          user_id: userTrainingProfile.user_id, exercise_id: ex.exerciseId,
          avg_set_duration: metrics.avgSetDuration, avg_rest_duration: metrics.avgRestDuration,
        });
      }
    });
    setExerciseUserStats(newExerciseStats);
    api.updateExerciseStats(newExerciseStats);

    // Stats + level up
    const newStats = {
      ...userStats,
      completedThisWeek: userStats.completedThisWeek + 1,
      totalWorkouts: userStats.totalWorkouts + 1,
      totalVolume: userStats.totalVolume + completedSession.totalVolume,
      xp: userStats.xp + completedSession.xpEarned,
    };
    if (newStats.xp >= 1000) { newStats.level += 1; newStats.xp -= 1000; }
    updateStats(newStats);

    // Progression alerts
    const alerts: ProgressionAlert[] = [];
    activeWorkout.exercises.forEach(ex => {
      const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
      const prevSessions = sessions.filter(s => s.exercises.some(e => e.exerciseId === ex.exerciseId));
      if (prevSessions.length > 0) {
        const currentMaxWeight = Math.max(...ex.sets.map(s => s.weight));
        const currentVolume = ex.sets.reduce((acc, s) => acc + s.reps * s.weight, 0);
        let bestWeight = 0; let bestVolume = 0;
        prevSessions.forEach(ps => {
          const psEx = ps.exercises.find(e => e.exerciseId === ex.exerciseId);
          if (psEx) {
            psEx.sets.forEach(s => { if (s.weight > bestWeight) bestWeight = s.weight; });
            const psVol = psEx.sets.reduce((acc, s) => acc + s.reps * s.weight, 0);
            if (psVol > bestVolume) bestVolume = psVol;
          }
        });
        if (currentMaxWeight > bestWeight && bestWeight > 0) {
          alerts.push({ type: 'PR', title: `Novo recorde no ${exercise?.name}!`, description: `+${currentMaxWeight - bestWeight} kg desde o último treino`, icon: '🏆', color: 'text-yellow-400' });
        } else if (currentVolume > bestVolume && bestVolume > 0) {
          alerts.push({ type: 'PR', title: `Evolução no ${exercise?.name}!`, description: 'Você aumentou o volume total deste exercício.', icon: '📈', color: 'text-emerald-400' });
        }
      }
    });

    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const twoWeeksAgo = subWeeks(now, 2);
    const thisWeekVol = sessions.filter(s => isWithinInterval(parseISO(s.date), { start: oneWeekAgo, end: now })).reduce((acc, s) => acc + s.totalVolume, 0) + completedSession.totalVolume;
    const lastWeekVol = sessions.filter(s => isWithinInterval(parseISO(s.date), { start: twoWeeksAgo, end: oneWeekAgo })).reduce((acc, s) => acc + s.totalVolume, 0);
    if (lastWeekVol > 0) {
      const inc = ((thisWeekVol - lastWeekVol) / lastWeekVol) * 100;
      if (inc > 5) alerts.push({ type: 'Weekly', title: 'Progressão Semanal', description: `Seu volume subiu ${inc.toFixed(0)}% esta semana!`, icon: '📊', color: 'text-blue-400' });
    }
    const thisWeekCount = sessions.filter(s => isWithinInterval(parseISO(s.date), { start: oneWeekAgo, end: now })).length;
    if (thisWeekCount + 1 >= (userProfile.weeklyGoal ?? 3)) {
      alerts.push({ type: 'Weekly', title: 'Consistência Excelente', description: `Você atingiu sua meta de ${userProfile.weeklyGoal ?? 3} treinos esta semana!`, icon: '📊', color: 'text-emerald-400' });
    }
    if (template) {
      const totalCompleted = sessions.filter(s => s.workoutId === template.id).length + 1;
      const weeks = Math.max(1, Math.ceil(differenceInWeeks(parseISO(template.endDate), parseISO(template.startDate))));
      const totalExpected = weeks * (userProfile.weeklyGoal ?? 3);
      if (totalCompleted % 3 === 0 || totalCompleted === totalExpected) {
        alerts.push({ type: 'Program', title: 'Progresso no Programa', description: `Treino ${totalCompleted} de ${totalExpected} concluído (${Math.round((totalCompleted / totalExpected) * 100)}%)`, icon: '🎯', color: 'text-brand-red' });
      }
    }
    setProgressionAlerts(alerts);

    // Stagnation
    const stagnation: StagnationReport[] = [];
    activeWorkout.exercises.forEach(ex => {
      const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
      if (exercise) {
        const report = analyzeExerciseStagnation(ex.exerciseId, exercise.name, [completedSession, ...userSessions], 'Intermediário');
        if (report) stagnation.push(report);
      }
    });
    setStagnationReports(stagnation);
  };

  return { startWorkout, finishWorkout };
}
