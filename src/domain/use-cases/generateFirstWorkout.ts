import { WorkoutTemplate, WorkoutTemplateExercise } from '../../domain/entities';
import { EXERCISES } from '../../constants';

// Exercise IDs per sport — mapped to existing EXERCISES in constants.ts
const SPORT_EXERCISE_IDS: Record<string, string[]> = {
  'Musculação':     ['1', '2', '3', '4', '5', '7', '8', '30'],   // Supino, Agachamento, Remada, Dev.Militar, Rosca, LegPress, Puxada, Tríceps
  'Halterofilismo': ['6', '2', '21', '4', '3', '1'],              // Terra, Agachamento, Stiff, Dev.Militar, Remada, Supino
  'Corrida':        ['36', '10', '25', '11'],                     // Corrida, Afundo, Gêmeos, Prancha
  'Ciclismo':       ['37', '7', '19', '25'],                      // Ciclismo, LegPress, Extensora, Gêmeos
  'Natação':        ['8', '3', '28', '11', '9'],                  // Puxada, Remada, Elev.Lateral, Prancha, Flexão
  'Crossfit':       ['14', '2', '1', '11', '38', '9'],            // KBSwing, Agachamento, Supino, Prancha, PularCorda, Flexão
  'Artes Marciais': ['9', '11', '35', '10', '38'],                // Flexão, Prancha, GiroRusso, Afundo, PularCorda
  'Futebol':        ['36', '10', '7', '25', '11'],                // Corrida, Afundo, LegPress, Gêmeos, Prancha
  'Basquete':       ['36', '10', '7', '28', '11'],                // Corrida, Afundo, LegPress, Elev.Lateral, Prancha
  'Yoga':           ['11', '12', '35', '33'],                     // Prancha, Alongamento, GiroRusso, AbdSupra
};

const DEFAULT_IDS = ['1', '2', '3', '4', '5'];

export function generateFirstWorkout(sports: string[], userEmail: string): WorkoutTemplate {
  // Collect exercise IDs from all selected sports, deduplicated, max 8
  const seen = new Set<string>();
  const exerciseIds: string[] = [];

  for (const sport of sports) {
    const ids = SPORT_EXERCISE_IDS[sport] ?? DEFAULT_IDS;
    for (const id of ids) {
      if (!seen.has(id) && exerciseIds.length < 8) {
        seen.add(id);
        exerciseIds.push(id);
      }
    }
  }

  const exercises: WorkoutTemplateExercise[] = exerciseIds.map(id => {
    const ex = EXERCISES.find(e => e.id === id);
    return {
      exerciseId: id,
      sets: String(ex?.defaultReps ?? 10),
      numSets: ex?.defaultSets ?? 3,
      rest: '1 min',
    };
  });

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
