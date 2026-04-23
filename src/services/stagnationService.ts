import { WorkoutSession, ExerciseSession, StagnationReport, Exercise } from '../types';

export function analyzeExerciseStagnation(
  exerciseId: string,
  exerciseName: string,
  sessions: WorkoutSession[],
  userLevel: 'Iniciante' | 'Intermediário' | 'Avançado' = 'Intermediário'
): StagnationReport | null {
  // 1. Filter sessions that contain this exercise and sort by date (newest first)
  const exerciseHistory = sessions
    .filter(s => s.exercises.some(ex => ex.exerciseId === exerciseId))
    .map(s => ({
      date: new Date(s.date),
      exercise: s.exercises.find(ex => ex.exerciseId === exerciseId)!
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10); // Analyze last 10 sessions

  if (exerciseHistory.length < 3) return null; // Need at least 3 sessions to detect patterns

  const latest = exerciseHistory[0].exercise;
  const history = exerciseHistory.map(h => h.exercise);

  // Helper to get max weight and total reps
  const getMetrics = (ex: ExerciseSession) => {
    const maxWeight = Math.max(...ex.sets.map(s => s.weight));
    const totalReps = ex.sets.reduce((acc, s) => acc + s.reps, 0);
    const avgReps = totalReps / ex.sets.length;
    const volume = ex.sets.reduce((acc, s) => acc + (s.reps * s.weight), 0);
    return { maxWeight, totalReps, avgReps, volume, setsCount: ex.sets.length };
  };

  const metricsHistory = history.map(getMetrics);
  const current = metricsHistory[0];

  // Thresholds based on user level
  const loadStagnationThreshold = userLevel === 'Iniciante' ? 4 : (userLevel === 'Intermediário' ? 5 : 6);
  const repStagnationThreshold = userLevel === 'Iniciante' ? 3 : (userLevel === 'Intermediário' ? 4 : 5);

  // 1. Carga Travada (Load Stuck)
  // Check if max weight hasn't increased (within 2% margin) for X sessions
  let loadStuckCount = 0;
  for (let i = 1; i < metricsHistory.length; i++) {
    const prev = metricsHistory[i];
    // If current weight is not significantly higher than previous
    if (current.maxWeight <= prev.maxWeight * 1.02) {
      loadStuckCount++;
    } else {
      break;
    }
  }

  // 2. Repetições Travadas (Reps Stuck)
  // Check if reps haven't increased for same load
  let repsStuckCount = 0;
  for (let i = 1; i < metricsHistory.length; i++) {
    const prev = metricsHistory[i];
    if (Math.abs(current.maxWeight - prev.maxWeight) < prev.maxWeight * 0.02) { // Same load
      if (current.avgReps <= prev.avgReps) {
        repsStuckCount++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // 3. Queda de Desempenho (Performance Drop)
  // Check if volume or max weight decreased in last 2 sessions
  const isPerformanceDrop = metricsHistory.length >= 3 && 
    metricsHistory[0].volume < metricsHistory[1].volume && 
    metricsHistory[1].volume < metricsHistory[2].volume;

  // Determine Level and Report
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
