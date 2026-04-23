import { WorkoutSession, ProgressScore, UserProfile } from '../types';
import { subDays, isAfter, parseISO, differenceInDays } from 'date-fns';

export function calculateProgressScore(
  sessions: WorkoutSession[],
  userProfile: UserProfile,
  daysToAnalyze: number = 30
): ProgressScore {
  if (sessions.length === 0) {
    return {
      score: 0,
      classification: 'progresso',
      factors: { loadProgression: 0, repsProgression: 0, trainingVolume: 0, consistency: 0 },
      trend: 'estável',
      message: 'Comece a treinar para ver seu progresso!'
    };
  }

  if (sessions.length === 1) {
    return {
      score: 100,
      classification: 'progresso incrível',
      factors: { loadProgression: 25, repsProgression: 25, trainingVolume: 25, consistency: 25 },
      trend: 'subindo',
      message: 'Primeiro passo dado! Você saiu do zero e iniciou sua jornada.'
    };
  }

  const now = new Date();
  const cutoffDate = subDays(now, daysToAnalyze);
  const recentSessions = sessions
    .filter(s => isAfter(parseISO(s.date), cutoffDate))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  if (recentSessions.length === 0) {
    return {
      score: 0,
      classification: 'regressão',
      factors: { loadProgression: 0, repsProgression: 0, trainingVolume: 0, consistency: 0 },
      trend: 'descendo',
      message: 'Você não registrou treinos recentemente. Mantenha a consistência!'
    };
  }

  // Split into recent (last 50%) and previous (first 50%) for comparison
  const midPoint = Math.floor(recentSessions.length / 2);
  const previousSessions = recentSessions.slice(0, midPoint);
  const currentSessions = recentSessions.slice(midPoint);

  // 1. Load Progression (40%)
  const loadScore = calculateLoadProgression(previousSessions, currentSessions);
  
  // 2. Reps Progression (20%)
  const repsScore = calculateRepsProgression(previousSessions, currentSessions);
  
  // 3. Training Volume (25%)
  const volumeScore = calculateVolumeProgression(previousSessions, currentSessions);
  
  // 4. Consistency (15%)
  const consistencyScore = calculateConsistency(recentSessions, userProfile?.trainingFrequency || 3, daysToAnalyze);

  const finalScore = Math.round(
    (loadScore * 0.4) + 
    (repsScore * 0.2) + 
    (volumeScore * 0.25) + 
    (consistencyScore * 0.15)
  );

  let classification: ProgressScore['classification'] = 'estagnação';
  let message = '';
  let trend: ProgressScore['trend'] = 'estável';

  if (finalScore >= 76) {
    classification = 'progresso incrível';
    message = 'Seu progresso está forte. Você está evoluindo de forma consistente nos últimos treinos.';
    trend = 'subindo';
  } else if (finalScore >= 51) {
    classification = 'progresso moderado';
    message = 'Seu progresso está estável. Pequenos ajustes podem ajudar a melhorar seu desempenho.';
    trend = 'subindo';
  } else if (finalScore >= 31) {
    classification = 'estagnação';
    message = 'Seu progresso está estável. Pequenos ajustes podem ajudar a melhorar seu desempenho.';
    trend = 'estável';
  } else {
    classification = 'regressão';
    message = 'Seu progresso caiu nas últimas sessões. Pode ser necessário ajustar carga, descanso ou frequência de treino.';
    trend = 'descendo';
  }

  return {
    score: finalScore,
    classification,
    factors: {
      loadProgression: Math.round(loadScore * 0.4),
      repsProgression: Math.round(repsScore * 0.2),
      trainingVolume: Math.round(volumeScore * 0.25),
      consistency: Math.round(consistencyScore * 0.15)
    },
    trend,
    message
  };
}

function calculateLoadProgression(prev: WorkoutSession[], curr: WorkoutSession[]): number {
  if (prev.length === 0 || curr.length === 0) return 50;
  
  const prevMaxLoads: Record<string, number> = {};
  const currMaxLoads: Record<string, number> = {};

  prev.forEach(s => s.exercises.forEach(ex => {
    const max = Math.max(...ex.sets.map(set => set.weight));
    prevMaxLoads[ex.exerciseId] = Math.max(prevMaxLoads[ex.exerciseId] || 0, max);
  }));

  curr.forEach(s => s.exercises.forEach(ex => {
    const max = Math.max(...ex.sets.map(set => set.weight));
    currMaxLoads[ex.exerciseId] = Math.max(currMaxLoads[ex.exerciseId] || 0, max);
  }));

  let improvements = 0;
  let totalExercises = 0;

  Object.keys(currMaxLoads).forEach(id => {
    if (prevMaxLoads[id]) {
      totalExercises++;
      const diff = (currMaxLoads[id] - prevMaxLoads[id]) / prevMaxLoads[id];
      if (diff > 0.02) improvements++; // Ignore < 2%
      else if (diff < -0.02) improvements--;
    }
  });

  if (totalExercises === 0) return 50;
  const ratio = improvements / totalExercises;
  return Math.min(100, Math.max(0, 50 + (ratio * 50)));
}

function calculateRepsProgression(prev: WorkoutSession[], curr: WorkoutSession[]): number {
  if (prev.length === 0 || curr.length === 0) return 50;

  const prevBestReps: Record<string, { weight: number, reps: number }> = {};
  const currBestReps: Record<string, { weight: number, reps: number }> = {};

  prev.forEach(s => s.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (!prevBestReps[ex.exerciseId] || set.reps > prevBestReps[ex.exerciseId].reps) {
        prevBestReps[ex.exerciseId] = { weight: set.weight, reps: set.reps };
      }
    });
  }));

  curr.forEach(s => s.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (!currBestReps[ex.exerciseId] || set.reps > currBestReps[ex.exerciseId].reps) {
        currBestReps[ex.exerciseId] = { weight: set.weight, reps: set.reps };
      }
    });
  }));

  let improvements = 0;
  let total = 0;

  Object.keys(currBestReps).forEach(id => {
    if (prevBestReps[id] && currBestReps[id].weight === prevBestReps[id].weight) {
      total++;
      if (currBestReps[id].reps > prevBestReps[id].reps) improvements++;
      else if (currBestReps[id].reps < prevBestReps[id].reps) improvements--;
    }
  });

  if (total === 0) return 50;
  return Math.min(100, Math.max(0, 50 + (improvements / total * 50)));
}

function calculateVolumeProgression(prev: WorkoutSession[], curr: WorkoutSession[]): number {
  if (prev.length === 0 || curr.length === 0) return 50;

  const avgPrevVolume = prev.reduce((acc, s) => acc + s.totalVolume, 0) / prev.length;
  const avgCurrVolume = curr.reduce((acc, s) => acc + s.totalVolume, 0) / curr.length;

  if (avgPrevVolume === 0) return 50;
  const diff = (avgCurrVolume - avgPrevVolume) / avgPrevVolume;
  return Math.min(100, Math.max(0, 50 + (diff * 100)));
}

function calculateConsistency(sessions: WorkoutSession[], goal: number, days: number): number {
  const weeks = days / 7;
  const expectedTotal = goal * weeks;
  const actualTotal = sessions.length;

  const ratio = actualTotal / expectedTotal;
  return Math.min(100, ratio * 100);
}
