import { useMemo, useState } from 'react';
import { startOfWeek, parseISO, format, subWeeks } from 'date-fns';
import { Play, Lock, Star, Flame, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  UserStats,
  WorkoutSession,
  WorkoutTemplate,
  UserTrainingProfile,
  ExerciseUserStats,
  UserCalorieProfile,
  BodyAssessment,
  UserProfile,
  ProgressScore,
} from '../../domain/entities';
import { AiCoachWidget } from '../components/DashboardWidgets';

interface DashboardViewProps {
  userStats: UserStats;
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  onStartWorkout: () => void;
  onViewAchievements: () => void;
  userProfile: UserTrainingProfile;
  exerciseStats: ExerciseUserStats[];
  calorieProfile: UserCalorieProfile;
  assessments: BodyAssessment[];
  mainUserProfile: UserProfile;
  progressScore: ProgressScore | null;
  aiAdvice: string | null;
  isAiLoading: boolean;
  switchTab: (tab: string) => void;
  personalRecords: { weight: number; date: string; name: string }[];
  studentConnections?: any[];
  trainers?: UserProfile[];
}

const SPORT_EMOJIS: Record<string, string> = {
  'Musculação': '🏋️', 'Halterofilismo': '🏅', 'Corrida': '🏃',
  'Ciclismo': '🚴', 'Natação': '🏊', 'Crossfit': '⚡',
  'Artes Marciais': '🥋', 'Futebol': '⚽', 'Basquete': '🏀', 'Yoga': '🧘',
};

const XP_PER_LEVEL = 500;

// Node positions alternating left/center/right for trail effect
const NODE_POSITIONS = ['left', 'center', 'right', 'center', 'left', 'center', 'right', 'center'] as const;

/** Streak = total workouts in weeks where user met their weekly goal.
 *  Resets to 0 if 7 days pass without meeting the goal. */
function calcGoalStreak(sessions: WorkoutSession[], weeklyGoal: number): number {
  if (sessions.length === 0 || weeklyGoal <= 0) return 0;

  // Group sessions by ISO week (Mon start)
  const byWeek: Record<string, number> = {};
  sessions.forEach(s => {
    try {
      const weekKey = format(startOfWeek(parseISO(s.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      byWeek[weekKey] = (byWeek[weekKey] ?? 0) + 1;
    } catch {}
  });

  // Walk backwards week by week from current week
  let streak = 0;
  let weekCursor = startOfWeek(new Date(), { weekStartsOn: 1 });

  for (let i = 0; i < 104; i++) { // max 2 years back
    const key = format(weekCursor, 'yyyy-MM-dd');
    const count = byWeek[key] ?? 0;
    if (count >= weeklyGoal) {
      streak += count;
      weekCursor = subWeeks(weekCursor, 1);
    } else if (i === 0) {
      // current week hasn't met goal yet — skip and keep going
      weekCursor = subWeeks(weekCursor, 1);
    } else {
      break; // missed a past week — streak ends
    }
  }
  return streak;
}

export function DashboardView({
  userStats,
  sessions,
  templates,
  onStartWorkout,
  aiAdvice,
  isAiLoading,
  switchTab,
  mainUserProfile,
}: DashboardViewProps) {
  // Sports: from profile or welcome-answers fallback
  const sports = useMemo(() => {
    if ((mainUserProfile as any)?.sports?.length) return (mainUserProfile as any).sports as string[];
    try {
      const wa = JSON.parse(localStorage.getItem('welcome-answers') ?? 'null');
      if (wa?.sports?.length) return wa.sports as string[];
    } catch {}
    return ['Musculação'];
  }, [mainUserProfile]);

  const [sportIdx, setSportIdx] = useState(0);
  const currentSport = sports[sportIdx] ?? sports[0];

  // XP per sport = total XP divided equally; level per sport from that share
  const xpPerSport = Math.floor(userStats.xp / sports.length);
  const sportLevel = Math.max(1, Math.floor(xpPerSport / XP_PER_LEVEL) + 1);

  const goalStreak = useMemo(() => calcGoalStreak(sessions, userStats.weeklyGoal), [sessions, userStats.weeklyGoal]);

  const completedThisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return sessions.filter(s => { try { return parseISO(s.date) >= weekStart; } catch { return false; } }).length;
  }, [sessions]);

  const lastSession = sessions[0] ?? null;
  const currentTemplateIdx = lastSession
    ? Math.max(0, templates.findIndex(t => t.id === lastSession.workoutId))
    : 0;
  const currentTemplate = templates[currentTemplateIdx] ?? null;

  const trailNodes = templates.slice(0, 8).map((t, i) => ({
    template: t,
    state: i < currentTemplateIdx ? 'done' : i === currentTemplateIdx ? 'active' : 'locked',
  }));

  const xpProgress = userStats.xp % XP_PER_LEVEL;
  const xpProgressPct = Math.round((xpProgress / XP_PER_LEVEL) * 100);

  return (
    <div className="-mx-6">
      {/* Top stats bar */}
      <div className="flex items-center justify-between px-10 py-3 border-b border-white/5 mt-4 mb-2">

        {/* Sport selector */}
        <div className="flex items-center gap-1">
          {sports.length > 1 && (
            <button onClick={() => setSportIdx(i => (i - 1 + sports.length) % sports.length)} className="text-white/30 active:text-white transition-colors">
              <ChevronLeft size={14} />
            </button>
          )}
          <span className="text-xl leading-none">{SPORT_EMOJIS[currentSport] ?? '🏋️'}</span>
          {sports.length > 1 && (
            <button onClick={() => setSportIdx(i => (i + 1) % sports.length)} className="text-white/30 active:text-white transition-colors">
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Sport level */}
        <div className="flex items-center gap-1">
          <span className="text-lg leading-none">⭐</span>
          <span className="font-bold text-white text-sm">{sportLevel}</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <Flame size={18} className="text-orange-400" />
          <span className="font-bold text-orange-400 text-sm">{goalStreak}</span>
        </div>

      </div>

      {/* Mission banner */}
      {currentTemplate ? (
        <button
          onClick={onStartWorkout}
          className="mx-6 mt-4 w-[calc(100%-3rem)] bg-brand-red rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-transform"
        >
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
              {completedThisWeek} de {userStats.weeklyGoal} essa semana
            </p>
            <p className="font-bold text-white text-base leading-tight">{currentTemplate.name}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Play size={20} fill="white" color="white" />
          </div>
        </button>
      ) : (
        <button
          onClick={() => switchTab('workouts')}
          className="mx-6 mt-4 w-[calc(100%-3rem)] bg-brand-red rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-transform"
        >
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Comece agora</p>
            <p className="font-bold text-white text-base leading-tight">Criar primeiro treino</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Star size={20} fill="white" color="white" />
          </div>
        </button>
      )}

      {/* XP progress bar */}
      <div className="px-6 mt-3 mb-1">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-red rounded-full transition-all duration-500"
            style={{ width: `${xpProgressPct}%` }}
          />
        </div>
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1 text-right">
          {xpProgress} / {XP_PER_LEVEL} XP
        </p>
      </div>

      {/* Trail map */}
      <div className="px-6 pb-8 pt-4 flex flex-col items-center gap-2">
        {trailNodes.map((node, i) => {
          const pos = NODE_POSITIONS[i % NODE_POSITIONS.length];
          const isActive = node.state === 'active';
          const isDone = node.state === 'done';
          const isLocked = node.state === 'locked';

          return (
            <div
              key={node.template.id}
              className={cn(
                'w-full flex',
                pos === 'left' && 'justify-start pl-6',
                pos === 'center' && 'justify-center',
                pos === 'right' && 'justify-end pr-6',
              )}
            >
              <button
                onClick={isLocked ? undefined : onStartWorkout}
                disabled={isLocked}
                className="relative flex flex-col items-center gap-1 active:scale-95 transition-transform disabled:cursor-default"
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-brand-red/30 animate-ping scale-125" />
                )}
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center shadow-lg relative',
                  isActive && 'bg-brand-red shadow-brand-red/40',
                  isDone && 'bg-emerald-600 shadow-emerald-600/30',
                  isLocked && 'bg-white/10',
                )}>
                  {isActive && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 28 * (xpProgressPct / 100)} ${2 * Math.PI * 28}`}
                        strokeLinecap="round" />
                    </svg>
                  )}
                  {isLocked ? <Lock size={24} className="text-white/30" />
                    : isDone ? <Star size={24} fill="white" color="white" />
                    : <Star size={28} fill="white" color="white" />}
                </div>
                <span className={cn(
                  'text-[10px] font-bold uppercase tracking-wider max-w-[80px] text-center leading-tight',
                  isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-white/20',
                )}>
                  {node.template.name}
                </span>
              </button>
            </div>
          );
        })}

        {trailNodes.length > 0 && (
          <div className="flex justify-center mt-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Trophy size={28} className="text-white/20" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/20">Conclusão</span>
            </div>
          </div>
        )}
      </div>

      {(aiAdvice || isAiLoading) && (
        <div className="px-6 pb-6">
          <AiCoachWidget aiAdvice={aiAdvice} isAiLoading={isAiLoading} />
        </div>
      )}
    </div>
  );
}
