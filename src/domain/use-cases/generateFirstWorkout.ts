import { WorkoutTemplate, WorkoutTemplateExercise } from '../../domain/entities';
import { EXERCISES } from '../../constants';
import { getExerciseIdsForSport, DEFAULT_EXERCISE_IDS } from './sportExercises';

// Exercise IDs preferred for each experience level (within a sport's pool)
const BEGINNER_SAFE_IDS = new Set(['7', '8', '9', '10', '11', '14', '33', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']);
const ADVANCED_IDS = new Set(['6', '2', '1', '4', '21', '3']);

export function generateFirstWorkout(sports: string[], userEmail: string, experience?: string): WorkoutTemplate {
  const exp = (experience || '').toLowerCase();
  const isAbsolute = exp.includes('nunca') || exp.includes('never');
  const isAdvanced = exp.includes('avan');

  const seen = new Set<string>();
  const exerciseIds: string[] = [];

  for (const sport of sports) {
    let ids = getExerciseIdsForSport(sport);
    // Prefer safe exercises for beginners, heavy compounds for advanced
    if (isAbsolute) ids = ids.filter(id => BEGINNER_SAFE_IDS.has(id)).concat(ids.filter(id => !BEGINNER_SAFE_IDS.has(id)));
    else if (isAdvanced) ids = ids.filter(id => ADVANCED_IDS.has(id)).concat(ids.filter(id => !ADVANCED_IDS.has(id)));
    for (const id of ids) {
      if (!seen.has(id) && exerciseIds.length < 3) {
        seen.add(id);
        exerciseIds.push(id);
      }
    }
  }

  // If no IDs were resolved (empty sport pool after filtering), fall back to defaults
  if (exerciseIds.length === 0) {
    DEFAULT_EXERCISE_IDS.slice(0, 3).forEach(id => exerciseIds.push(id));
  }

  const reps = isAbsolute ? '8' : isAdvanced ? '13' : exp.includes('intermedi') ? '12' : '10';
  const rest = '60s';

  const exercises: WorkoutTemplateExercise[] = exerciseIds.map(id => ({
    exerciseId: id,
    sets: reps,
    numSets: 3,
    rest,
  }));

  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 3);

  const sportLabel = sports.length === 1 ? sports[0] : `${sports[0]} +${sports.length - 1}`;

  const template: WorkoutTemplate = {
    id: `first-workout-${Date.now()}`,
    userId: userEmail,
    creatorEmail: userEmail,
    name: `Treino de IA: ${sportLabel}`,
    sport: sports[0] ?? 'Musculação',
    category: 'basic',
    startDate: now.toISOString(),
    endDate: end.toISOString(),
    exercises,
    exerciseIds,
  };

  return template;
}
