import { useMemo, useState } from 'react';
import { startOfWeek, parseISO, format, subWeeks, addDays, endOfWeek } from 'date-fns';
import { Play, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { STORAGE_KEYS } from '../../shared/lib/storageKeys';
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

/**
 * Streak = sum of distinct training days across consecutive weeks that met the
 * weekly goal, counted backwards from the current week.
 *
 * Rules:
 * - Multiple workouts on the same calendar day count as ONE training day.
 * - The current (in-progress) week always contributes its distinct days so far,
 *   regardless of whether the goal has been met yet — it never breaks the chain.
 * - Every past week must have >= weeklyGoal distinct training days to stay in
 *   the chain. The first past week that falls short ends the streak.
 *
 * Example (goal = 3):
 *   Week 1 (oldest): 4 distinct days  ✓
 *   Week 2:          2 distinct days  ✗ → chain broken here
 *   Week 3:          3 distinct days  ✓
 *   Week 4 (current):4 distinct days  (in progress, always counts)
 *   → streak = 3 + 4 = 7 days  (weeks 3 and 4 only)
 */
function calcGoalStreak(sessions: WorkoutSession[], weeklyGoal: number): number {
  if (sessions.length === 0 || weeklyGoal <= 0) return 0;

  // Build a map: week-start-key → Set of distinct yyyy-MM-dd training days
  const byWeek: Record<string, Set<string>> = {};
  sessions.forEach(s => {
    try {
      const dayKey  = format(parseISO(s.date), 'yyyy-MM-dd');
      const weekKey = format(startOfWeek(parseISO(s.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      if (!byWeek[weekKey]) byWeek[weekKey] = new Set();
      byWeek[weekKey].add(dayKey);
    } catch {}
  });

  let streak = 0;
  let weekCursor = startOfWeek(new Date(), { weekStartsOn: 1 });

  for (let i = 0; i < 104; i++) {
    const key        = format(weekCursor, 'yyyy-MM-dd');
    const distinctDays = byWeek[key]?.size ?? 0;

    if (i === 0) {
      // Current week: always add its distinct days (may be 0 if no workout yet this week)
      streak += distinctDays;
      weekCursor = subWeeks(weekCursor, 1);
      continue;
    }

    // Past weeks: must have met the goal to remain in the chain
    if (distinctDays >= weeklyGoal) {
      streak += distinctDays;
      weekCursor = subWeeks(weekCursor, 1);
    } else {
      break;
    }
  }

  return streak;
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

/** Bar showing each day of the current week (Sun→Sat), lit red if the user trained that day. */
function WeekDayBar({ sessions, weeklyGoal }: { sessions: WorkoutSession[]; weeklyGoal: number }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday
  const weekEnd   = endOfWeek(new Date(), { weekStartsOn: 0 });   // Saturday

  // "12/07 – 18/07" style header
  const weekLabel = `${format(weekStart, 'dd/MM')} – ${format(weekEnd, 'dd/MM')}`;

  // Set of 'yyyy-MM-dd' for days that had at least one session this week
  const trainedDays = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => {
      try {
        const d = parseISO(s.date);
        if (d >= weekStart && d <= weekEnd) set.add(format(d, 'yyyy-MM-dd'));
      } catch {}
    });
    return set;
  // weekStart/weekEnd are derived from `new Date()` — stable within the render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions]);

  return (
    <div className="mx-6 mt-4 mb-8 bg-dark-card border border-white/5 rounded-2xl px-4 py-3">
      {/* Header: week range + trained counter */}
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-black uppercase tracking-widest text-white/40">
          {weekLabel}
        </p>
        <p className="text-xs font-black uppercase tracking-widest text-white/40">
          {trainedDays.size}/{weeklyGoal}
        </p>
      </div>

      {/* Day columns */}
      <div className="flex items-end justify-between gap-1">
        {WEEK_DAYS.map((label, i) => {
          const dayKey  = format(addDays(weekStart, i), 'yyyy-MM-dd');
          const trained = trainedDays.has(dayKey);
          const isToday = dayKey === format(new Date(), 'yyyy-MM-dd');

          return (
            <div key={label} className={cn('flex flex-col items-center gap-2', isToday ? 'flex-[1.25]' : 'flex-1')}>
              {/* Bar — today is 1.25x taller and wider */}
              <div className={cn(
                'w-full rounded-lg transition-colors duration-300 flex items-center justify-center',
                isToday ? 'h-10' : 'h-8',
                trained ? 'bg-brand-red shadow-[0_2px_0_0_rgba(150,10,10,0.6)]' : isToday ? 'bg-brand-red shadow-[0_2px_0_0_rgba(150,10,10,0.6)]' : 'bg-brand-red/10',
              )}>
                {isToday && (
                  trained
                    ? <Check size={16} color="white" strokeWidth={3} />
                    : <Play size={14} fill="white" color="white" />
                )}
              </div>
              {/* Label */}
              <span className={cn(
                'text-[10px] font-black uppercase tracking-wide',
                trained ? 'text-white' : isToday ? 'text-white' : 'text-white/30',
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardView({
  userStats,
  sessions,
  templates,
  onStartWorkout,
  switchTab,
  mainUserProfile,
  isLoggedIn,
}: DashboardViewProps) {
  // Sports: from profile or welcome-answers fallback
  const sports = useMemo(() => {
    // 1. Logged-in user — use cloud profile specialties
    if (mainUserProfile?.specialties?.length) return mainUserProfile.specialties;
    // 2. Guest/onboarding — fallback to local answers
    if (!isLoggedIn) {
      try {
        const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null');
        if (wa?.sports?.length) return wa.sports as string[];
      } catch {}
    }
    return ['Musculação'];
  }, [mainUserProfile, isLoggedIn]);

  const [sportIdx, setSportIdx] = useState(0);
  const currentSport = sports[sportIdx] ?? sports[0];

  const goalStreak = useMemo(() => calcGoalStreak(sessions, mainUserProfile.weeklyGoal ?? 3), [sessions, mainUserProfile.weeklyGoal]);

  // Completed weeks = total streak workouts divided by weekly goal (floor)
  const completedWeeks = Math.floor(goalStreak / Math.max(1, mainUserProfile.weeklyGoal ?? 3));

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
  const weeklyGoal = Math.max(1, mainUserProfile.weeklyGoal ?? 3);

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
          <span className="font-bold text-sm ml-1" style={{ color: SPORT_COLORS[currentSport] ?? '#dc2626' }}>{completedWeeks + 1}</span>
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
          <span className="font-black text-sm text-blue-400">{completedThisWeek}/{mainUserProfile.weeklyGoal ?? 3}</span>
        </div>
      </div>

      {/* Mission banner */}
      {currentTemplate ? (
        <button
          onClick={() => onStartWorkout(currentTemplate)}
          className="mx-6 mt-3 w-[calc(100%-3rem)] bg-brand-red rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-transform shadow-[0_4px_0_0_rgba(150,10,10,0.6)]"
        >
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
              {completedThisWeek} de {mainUserProfile.weeklyGoal ?? 3} essa semana
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
          className="mx-6 mt-3 w-[calc(100%-3rem)] bg-brand-red rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-transform shadow-[0_4px_0_0_rgba(150,10,10,0.6)]"
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

      {/* Weekly day bar */}
      <WeekDayBar sessions={sessions} weeklyGoal={weeklyGoal} />

    </div>
  );
}
