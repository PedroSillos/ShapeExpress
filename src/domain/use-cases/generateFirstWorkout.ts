import { WorkoutTemplate, WorkoutTemplateExercise } from '../../domain/entities';
import { EXERCISES } from '../../constants';

// Exercise IDs per sport — mapped to existing EXERCISES in constants.ts
const SPORT_EXERCISE_IDS: Record<string, string[]> = {
  'Musculação':     ['1', '2', '3', '4', '5', '7', '8', '30'],
  'Halterofilismo': ['6', '2', '21', '4', '3', '1'],
  'Corrida':        ['36', '41', '40', '10', '25'],
  'Ciclismo':       ['37', '7', '19', '25'],
  'Natação':        ['42', '43', '44', '45', '39'],
  'Crossfit':       ['14', '2', '1', '11', '38', '9'],
  'Yoga':           ['142', '143', '144', '145', '146', '12'],
  'Triatlo':        ['36', '37', '42', '11', '10'],
};

const DEFAULT_IDS = ['1', '2', '3', '4', '5'];

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
    let ids = SPORT_EXERCISE_IDS[sport] ?? DEFAULT_IDS;
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
    name: `Primeiro Treino — ${sportLabel}`,
    category: 'basic',
    startDate: now.toISOString(),
    endDate: end.toISOString(),
    exercises,
    exerciseIds,
  };

  // Persist offline for later cloud sync
  try {
    const pending = JSON.parse(localStorage.getItem('pending-templates') ?? '[]');
    pending.push(template);
    localStorage.setItem('pending-templates', JSON.stringify(pending));
  } catch { /* ignore */ }

  return template;
}
