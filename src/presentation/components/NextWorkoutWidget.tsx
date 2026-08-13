import { Play, Clock, Flame } from 'lucide-react';
import {
  WorkoutTemplate,
  WorkoutSession,
  UserTrainingProfile,
  ExerciseUserStats,
  UserCalorieProfile,
  BodyAssessment,
  UserProfile,
  fullName,
} from '../../domain/entities';
import {
  estimateWorkoutDuration,
  estimateWorkoutCalories,
} from '../../domain/use-cases/workoutEstimation';

interface NextWorkoutWidgetProps {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  onStartWorkout: () => void;
  userProfile: UserTrainingProfile;
  exerciseStats: ExerciseUserStats[];
  calorieProfile: UserCalorieProfile;
  assessments: BodyAssessment[];
  mainUserProfile: UserProfile;
  trainers: UserProfile[];
}

export function NextWorkoutWidget({
  templates,
  sessions,
  onStartWorkout,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile,
  trainers,
}: NextWorkoutWidgetProps) {
  const lastSession = sessions.length > 0 ? sessions[0] : null;
  let nextWorkout: WorkoutTemplate | null = null;
  if (templates.length > 0) {
    if (!lastSession) {
      nextWorkout = templates[0];
    } else {
      const idx = templates.findIndex(t => t.id === lastSession.workoutId);
      nextWorkout = idx === -1 || idx === templates.length - 1 ? templates[0] : templates[idx + 1];
    }
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 red-gradient rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
      <button
        onClick={onStartWorkout}
        className="relative w-full bg-dark-card border border-dark-border rounded-3xl p-6 flex items-center justify-between overflow-hidden"
      >
        {nextWorkout ? (
          <>
            <div className="space-y-1 text-left">
              <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Próximo Treino</p>
              <h3 className="text-xl font-bold">{nextWorkout.name}</h3>
              {nextWorkout.creatorEmail && nextWorkout.creatorEmail !== mainUserProfile.email && (
                <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider mb-1">
                  Por {(() => {
                    if (nextWorkout.creatorEmail === 'AICoach') return 'AICoach';
                    const t = trainers.find(t => t.email === nextWorkout!.creatorEmail);
                    return t ? fullName(t) : 'Treinador';
                  })()}
                </p>
              )}
              <p className="text-xs text-white/40 flex items-center gap-2">
                <span>
                  {nextWorkout.sheets && nextWorkout.sheets.length > 0
                    ? `${nextWorkout.sheets.length} Fichas`
                    : `${nextWorkout.exerciseIds?.length || 0} Exercícios`}
                </span>
                {nextWorkout.sheets && nextWorkout.sheets.length > 0 && (
                  <>
                    <span className="text-white/10">•</span>
                    <span className="flex items-center gap-1 text-brand-red font-bold uppercase text-[10px]">
                      <Clock size={10} />
                      {estimateWorkoutDuration(nextWorkout.sheets[0].exercises, userProfile, exerciseStats)} min
                    </span>
                    <span className="text-white/10">•</span>
                    <span className="flex items-center gap-1 text-orange-400 font-bold uppercase text-[10px]">
                      <Flame size={10} />
                      {Math.round(
                        estimateWorkoutCalories(
                          nextWorkout.sheets[0].exercises,
                          assessments.length > 0 ? assessments[0].weight : mainUserProfile.initialWeight,
                          userProfile,
                          exerciseStats,
                          calorieProfile,
                        ),
                      )}{' '}
                      kcal
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full red-gradient flex items-center justify-center">
              <Play size={24} color="currentColor" fill="currentColor" />
            </div>
          </>
        ) : (
          <div className="w-full text-center py-2">
            <p className="text-sm text-white/40 font-bold">Ainda não foram criados treinos</p>
            <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mt-1">Toque para começar</p>
          </div>
        )}
      </button>
    </div>
  );
}
