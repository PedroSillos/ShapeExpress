import { WorkoutTemplate, WorkoutTemplateExercise } from '../../domain/entities';

/** Canonical fallback exercises per sport (exactly 3, shown when AI is unavailable). */
const FALLBACK_EXERCISE_IDS: Record<string, [string, string, string]> = {
  'Musculação':     ['7', '1', '28'],   // Leg press, Supino reto, Elevação lateral
  'Crossfit':       ['36', '9', '2'],   // Corrida, Flexão de braços, Agachamento livre
  'Corrida':        ['154', '155', '36'], // Caminhada, Trote, Corrida
  'Yoga':           ['161', '160', '142'], // Tadasana, Cobra, Balasana
  'Natação':        ['147', '148', '150'], // Flutuação, Deslizamento, Nado Crawl
  'Ciclismo':       ['12', '163', '37'], // Along. isquiotibiais, Along. panturrilha, Ciclismo
  'Halterofilismo': ['2', '6', '157'],  // Agachamento livre, Terra, Power Clean
  'Triatlo':        ['36', '37', '150'], // Corrida, Ciclismo, Nado Crawl
};

export function generateFirstWorkout(sports: string[], userEmail: string, experience?: string): WorkoutTemplate {
  const exp = (experience || '').toLowerCase();
  const isAbsolute = exp.includes('nunca') || exp.includes('never');
  const isAdvanced = exp.includes('avan');

  const primarySport = sports[0] ?? 'Musculação';
  const fallback = FALLBACK_EXERCISE_IDS[primarySport] ?? FALLBACK_EXERCISE_IDS['Musculação'];
  const exerciseIds: string[] = [...fallback];

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
