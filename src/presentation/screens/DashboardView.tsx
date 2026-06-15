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
      {/* Top stats bar — Duolingo style */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 mt-2">
        {/* Sport selector */}
        <div className="flex items-center gap-1">
          {sports.length > 1 && (
            <button onClick={() => setSportIdx(i => (i - 1 + sports.length) % sports.length)} className="text-white/30 active:text-white">
              <ChevronLeft size={14} />
            </button>
          )}
          <span className="text-2xl leading-none">{SPORT_EMOJIS[currentSport] ?? '🏋️'}</span>
          <span className="font-bold text-white text-sm ml-1">{sportLevel}</span>
          {sports.length > 1 && (
            <button onClick={() => setSportIdx(i => (i + 1) % sports.length)} className="text-white/30 active:text-white">
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1">
          <Flame size={20} className={goalStreak > 0 ? 'text-orange-400' : 'text-white/20'} />
          <span className={cn('font-black text-sm', goalStreak > 0 ? 'text-orange-400' : 'text-white/30')}>{goalStreak}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1">
          <span className="text-lg leading-none">💪</span>
          <span className="font-black text-sm text-brand-red">{userStats.xp}</span>
        </div>

        {/* Weekly progress */}
        <div className="flex items-center gap-1">
          <span className="text-lg leading-none">⚡</span>
          <span className="font-black text-sm text-yellow-400">{completedThisWeek}/{userStats.weeklyGoal}</span>
        </div>
      </div>

      {/* Mission banner — Duolingo green style */}
      {currentTemplate ? (
        <button
          onClick={onStartWorkout}
          className="mx-6 mt-4 w-[calc(100%-3rem)] bg-emerald-600 rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-transform shadow-[0_4px_0_0_rgba(5,120,60,0.8)]"
        >
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
              {completedThisWeek} de {userStats.weeklyGoal} essa semana
            </p>
            <p className="font-black text-white text-base leading-tight">{currentTemplate.name}</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Play size={20} fill="white" color="white" />
          </div>
        </button>
      ) : (
        <button
          onClick={() => switchTab('workouts')}
          className="mx-6 mt-4 w-[calc(100%-3rem)] bg-emerald-600 rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-transform shadow-[0_4px_0_0_rgba(5,120,60,0.8)]"
        >
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Comece agora</p>
            <p className="font-black text-white text-base leading-tight">Criar primeiro treino</p>
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
      <div className="px-6 pb-8 pt-6 flex flex-col items-center gap-6">
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
                pos === 'left' && 'justify-start pl-4',
                pos === 'center' && 'justify-center',
                pos === 'right' && 'justify-end pr-4',
              )}
            >
              <button
                onClick={isLocked ? undefined : onStartWorkout}
                disabled={isLocked}
                className="relative flex flex-col items-center gap-2 active:scale-95 transition-transform disabled:cursor-default"
              >
                {/* Glow ring for active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping scale-150" />
                )}
                <div className={cn(
                  'w-18 h-18 rounded-full flex items-center justify-center shadow-lg relative',
                  'w-[72px] h-[72px]',
                  isActive && 'bg-emerald-500 shadow-[0_6px_0_0_rgba(5,100,50,0.9)]',
                  isDone && 'bg-emerald-700 shadow-[0_4px_0_0_rgba(5,80,40,0.8)]',
                  isLocked && 'bg-[#2a3540]',
                )}>
                  {/* Progress ring */}
                  {isActive && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="5" />
                      <circle cx="36" cy="36" r="32" fill="none" stroke="white" strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 32 * (xpProgressPct / 100)} ${2 * Math.PI * 32}`}
                        strokeLinecap="round" />
                    </svg>
                  )}
                  {isLocked
                    ? <Lock size={26} className="text-white/20" />
                    : isDone
                      ? <Star size={26} fill="white" color="white" />
                      : <Star size={30} fill="white" color="white" />}
                </div>
              </button>
            </div>
          );
        })}

        {trailNodes.length > 0 && (
          <div className="flex justify-center">
            <div className="w-[72px] h-[72px] rounded-full bg-[#2a3540] flex items-center justify-center">
              <Trophy size={28} className="text-white/20" />
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
