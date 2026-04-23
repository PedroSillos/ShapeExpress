import { WorkoutSession, ExerciseSession, StagnationReport } from '../entities';

export function analyzeExerciseStagnation(
  exerciseId: string,
  exerciseName: string,
  sessions: WorkoutSession[],
  userLevel: 'Iniciante' | 'Intermediário' | 'Avançado' = 'Intermediário'
): StagnationReport | null {
  const exerciseHistory = sessions
    .filter(s => s.exercises.some(ex => ex.exerciseId === exerciseId))
    .map(s => ({
      date: new Date(s.date),
      exercise: s.exercises.find(ex => ex.exerciseId === exerciseId)!
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  if (exerciseHistory.length < 3) return null;

  const history = exerciseHistory.map(h => h.exercise);

  const getMetrics = (ex: ExerciseSession) => {
    const maxWeight = Math.max(...ex.sets.map(s => s.weight));
    const totalReps = ex.sets.reduce((acc, s) => acc + s.reps, 0);
    const avgReps = totalReps / ex.sets.length;
    const volume = ex.sets.reduce((acc, s) => acc + (s.reps * s.weight), 0);
    return { maxWeight, totalReps, avgReps, volume, setsCount: ex.sets.length };
  };

  const metricsHistory = history.map(getMetrics);
  const current = metricsHistory[0];

  const loadStagnationThreshold = userLevel === 'Iniciante' ? 4 : (userLevel === 'Intermediário' ? 5 : 6);
  const repStagnationThreshold = userLevel === 'Iniciante' ? 3 : (userLevel === 'Intermediário' ? 4 : 5);

  let loadStuckCount = 0;
  for (let i = 1; i < metricsHistory.length; i++) {
    const prev = metricsHistory[i];
    if (current.maxWeight <= prev.maxWeight * 1.02) {
      loadStuckCount++;
    } else {
      break;
    }
  }

  let repsStuckCount = 0;
  for (let i = 1; i < metricsHistory.length; i++) {
    const prev = metricsHistory[i];
    if (Math.abs(current.maxWeight - prev.maxWeight) < prev.maxWeight * 0.02) {
      if (current.avgReps <= prev.avgReps) {
        repsStuckCount++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  const isPerformanceDrop = metricsHistory.length >= 3 && 
    metricsHistory[0].volume < metricsHistory[1].volume && 
    metricsHistory[1].volume < metricsHistory[2].volume;

  let report: Partial<StagnationReport> | null = null;

  if (isPerformanceDrop) {
    report = {
      type: 'queda de desempenho',
      level: 'moderada',
      sessionsCount: 2,
      suggestion: 'Reduzir carga em 10% (deload) por uma semana para recuperação.'
    };
  } else if (loadStuckCount >= loadStagnationThreshold) {
    report = {
      type: 'carga travada',
      level: loadStuckCount > 6 ? 'severa' : (loadStuckCount >= 4 ? 'moderada' : 'leve'),
      sessionsCount: loadStuckCount,
      suggestion: 'Tente aumentar o tempo de descanso ou alterar a faixa de repetições.'
    };
  } else if (repsStuckCount >= repStagnationThreshold) {
    report = {
      type: 'repetições travadas',
      level: repsStuckCount > 5 ? 'severa' : (repsStuckCount >= 3 ? 'moderada' : 'leve'),
      sessionsCount: repsStuckCount,
      suggestion: 'Considere substituir o exercício por uma variação similar ou reduzir o volume semanal.'
    };
  }

  if (report) {
    return {
      exerciseId,
      exerciseName,
      level: report.level!,
      sessionsCount: report.sessionsCount!,
      type: report.type!,
      suggestion: report.suggestion!
    };
  }

  return null;
}
