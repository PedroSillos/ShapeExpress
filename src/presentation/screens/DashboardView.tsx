import { useMemo, useState } from 'react';
import { startOfWeek, parseISO, format, subWeeks } from 'date-fns';
import { Play, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
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
import iconFlame from '@/src/assets/icons/icon-flame.svg';
import iconCalendar from '@/src/assets/icons/icon-calendar.svg';
import iconMusculacao from '@/src/assets/icons/icon-musculacao.svg';
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconCorrida from '@/src/assets/icons/icon-corrida.svg';
import iconCiclismo from '@/src/assets/icons/icon-ciclismo.svg';
import iconNatacao from '@/src/assets/icons/icon-natacao.svg';
import iconCrossfit from '@/src/assets/icons/icon-crossfit.svg';
import iconTriatlo from '@/src/assets/icons/icon-triatlo.svg';
import iconRoman1 from '@/src/assets/icons/icon-roman-1.svg';
import iconRoman2 from '@/src/assets/icons/icon-roman-2.svg';
import iconRoman3 from '@/src/assets/icons/icon-roman-3.svg';
import iconRoman4 from '@/src/assets/icons/icon-roman-4.svg';
import iconRoman5 from '@/src/assets/icons/icon-roman-5.svg';
import iconRoman6 from '@/src/assets/icons/icon-roman-6.svg';
import iconRoman7 from '@/src/assets/icons/icon-roman-7.svg';

interface DashboardViewProps {
  userStats: UserStats;
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  onStartWorkout: (template?: WorkoutTemplate) => void;
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
  isLoggedIn?: boolean;
}

/** Map sport name -> brand color (matches WelcomeView SPORTS) */
const SPORT_COLORS: Record<string, string> = {
  'Musculação':     '#dc2626',
  'Crossfit':       '#ea580c',
  'Corrida':        '#ca8a04',
  'Yoga':           '#16a34a',
  'Natação':        '#2563eb',
  'Ciclismo':       '#0891b2',
  'Halterofilismo': '#7c3aed',
  'Triatlo':        '#db2777',
};

/** Map sport name -> SVG icon path */
const SPORT_ICONS: Record<string, string> = {
  'Musculação':     iconMusculacao,
  'Halterofilismo': iconHalterofilismo,
  'Corrida':        iconCorrida,
  'Ciclismo':       iconCiclismo,
  'Natação':        iconNatacao,
  'Crossfit':       iconCrossfit,
  'Triatlo':        iconTriatlo,
};

const XP_PER_LEVEL = 500;

// Node positions alternating left/center/right for trail effect
const NODE_POSITIONS = ['left', 'center', 'right', 'center', 'left', 'center', 'right', 'center'] as const;

// Roman numeral icons indexed by workout number (1-based)
const ROMAN_ICONS = [iconRoman1, iconRoman2, iconRoman3, iconRoman4, iconRoman5, iconRoman6, iconRoman7];

/**
 * Streak = total workouts in the unbroken chain of weeks leading up to now.
 *
 * Rules:
 * - The current week always counts its workouts so far (even if goal not yet met),
 *   because it's still in progress — it never breaks the streak.
 * - Every past week must have met the weekly goal to remain in the chain.
 *   The first past week that falls short ends the streak.
 * - Example: goal=3, weeks=[3, 3, 2(current)] → streak = 3+3+2 = 8
 * - Example: goal=3, weeks=[1(current)] → streak = 1
 */
function calcGoalStreak(sessions: WorkoutSession[], weeklyGoal: number): number {
  if (sessions.length === 0 || weeklyGoal <= 0) return 0;

  // Group sessions by ISO week key (Mon start)
  const byWeek: Record<string, number> = {};
  sessions.forEach(s => {
    try {
      const weekKey = format(startOfWeek(parseISO(s.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      byWeek[weekKey] = (byWeek[weekKey] ?? 0) + 1;
    } catch {}
  });

  let streak = 0;
  let weekCursor = startOfWeek(new Date(), { weekStartsOn: 1 });

  for (let i = 0; i < 104; i++) {
    const key = format(weekCursor, 'yyyy-MM-dd');
    const count = byWeek[key] ?? 0;

    if (i === 0) {
      // Current week: always add whatever was done so far (may be 0)
      streak += count;
      weekCursor = subWeeks(weekCursor, 1);
      continue;
    }

    // Past weeks: must have met the goal to continue the chain
    if (count >= weeklyGoal) {
      streak += count;
      weekCursor = subWeeks(weekCursor, 1);
    } else {
      break;
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
  isLoggedIn,
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

  const goalStreak = useMemo(() => calcGoalStreak(sessions, userStats.weeklyGoal), [sessions, userStats.weeklyGoal]);

  // Completed weeks = total streak workouts divided by weekly goal (floor)
  const completedWeeks = Math.floor(goalStreak / Math.max(1, userStats.weeklyGoal));

  const completedThisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return sessions.filter(s => { try { return parseISO(s.date) >= weekStart; } catch { return false; } }).length;
  }, [sessions]);

  const lastSession = sessions[0] ?? null;
  const currentTemplateIdx = lastSession
    ? Math.max(0, templates.findIndex(t => t.id === lastSession.workoutId))
    : 0;
  const currentTemplate = templates[currentTemplateIdx] ?? null;

  // Trail: one node per weekly goal slot. Nodes up to completedThisWeek are "done",
  // the next one is "active" (if goal not yet met), and the rest are "locked".
  const weeklyGoal = Math.max(1, userStats.weeklyGoal);
  const trailNodes = Array.from({ length: weeklyGoal }, (_, i) => {
    const state =
      i < completedThisWeek ? 'done'
      : i === completedThisWeek ? 'active'
      : 'locked';
    // Pick a template to show for the active node (next workout)
    const templateForNode = templates[i % Math.max(1, templates.length)] ?? null;
    return { template: templateForNode, state, index: i };
  });

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
          <div className="w-7 h-7 rounded-lg flex items-center justify-center p-1 shrink-0" style={{ backgroundColor: SPORT_COLORS[currentSport] ?? '#dc2626' }}>
            <img
              src={SPORT_ICONS[currentSport] ?? iconMusculacao}
              className="w-full h-full object-contain brightness-0 invert"
              alt={currentSport}
            />
          </div>
          <span className="font-bold text-sm ml-1" style={{ color: SPORT_COLORS[currentSport] ?? '#dc2626' }}>{completedWeeks}</span>
          {sports.length > 1 && (
            <button onClick={() => setSportIdx(i => (i + 1) % sports.length)} className="text-white/30 active:text-white">
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center p-1 shrink-0',
            goalStreak > 0 ? 'bg-orange-500' : 'bg-white/10',
          )}>
            <img
              src={iconFlame}
              className={cn('w-full h-full object-contain brightness-0 invert', goalStreak === 0 && 'opacity-40')}
              alt="streak"
            />
          </div>
          <span className={cn('font-black text-sm', goalStreak > 0 ? 'text-orange-400' : 'text-white/30')}>{goalStreak}</span>
        </div>

        {/* Weekly progress */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center p-1 shrink-0 bg-blue-600">
            <img src={iconCalendar} className="w-full h-full object-contain brightness-0 invert" alt="meta semanal" />
          </div>
          <span className="font-black text-sm text-blue-400">{completedThisWeek}/{userStats.weeklyGoal}</span>
        </div>
      </div>

      {/* Mission banner */}
      {currentTemplate ? (
        <button
          onClick={() => onStartWorkout(currentTemplate)}
          className="mx-6 mt-4 w-[calc(100%-3rem)] bg-brand-red rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-transform shadow-[0_4px_0_0_rgba(150,10,10,0.6)]"
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
          className="mx-6 mt-4 w-[calc(100%-3rem)] bg-brand-red rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-transform shadow-[0_4px_0_0_rgba(150,10,10,0.6)]"
        >
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Comece agora</p>
            <p className="font-black text-white text-base leading-tight">Criar primeiro treino</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Play size={20} fill="white" color="white" />
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
              key={node.index}
              className={cn(
                'w-full flex',
                pos === 'left' && 'justify-start pl-4',
                pos === 'center' && 'justify-center',
                pos === 'right' && 'justify-end pr-4',
              )}
            >
              <button
                onClick={isActive ? () => onStartWorkout(node.template ?? currentTemplate ?? undefined) : undefined}
                disabled={isLocked || isDone}
                className="relative flex flex-col items-center gap-2 active:scale-95 transition-transform disabled:cursor-default"
              >
                {/* Glow ring for active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-brand-red/20 animate-ping scale-150" />
                )}
                <div className={cn(
                  'w-18 h-18 rounded-full flex items-center justify-center shadow-lg relative',
                  'w-[72px] h-[72px]',
                  isActive && 'bg-brand-red shadow-[0_6px_0_0_rgba(150,10,10,0.7)]',
                  isDone && 'bg-brand-red/60 shadow-[0_4px_0_0_rgba(150,10,10,0.4)]',
                  isLocked && 'bg-[#2a3540]',
                )}>
                  {/* Progress ring on active node */}
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
                    : (
                      <img
                        src={ROMAN_ICONS[Math.min(node.index, ROMAN_ICONS.length - 1)]}
                        className={cn(
                          'w-8 h-8 object-contain brightness-0 invert relative z-10',
                          (isDone) && 'opacity-70',
                        )}
                        alt={`Treino ${node.index + 1}`}
                      />
                    )}
                </div>
              </button>
            </div>
          );
        })}

      </div>


    </div>
  );
}
