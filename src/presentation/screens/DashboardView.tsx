import { useMemo, useRef, useEffect, useState } from 'react';
import { startOfWeek, parseISO, format, subWeeks, addWeeks, addDays, endOfWeek } from 'date-fns';
import { Play, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
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
  setScrollToHistory?: (v: boolean) => void;
  setHighlightSessionId?: (id: string | null) => void;
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

/** Weeks to show: 2 past + current + 3 future = 6 total. Current week is at index 2. */
const WEEKS_PAST         = 2;
const WEEKS_FUTURE       = 3;
const CURRENT_WEEK_INDEX = WEEKS_PAST; // index 2

/** Stacked bar showing 2 past weeks, current week, and 3 future weeks.
 *  On mount the current-week card is scrolled to the vertical center of the viewport. */
function WeekDayBar({
  sessions,
  weeklyGoal,
  onDayClick,
  onTodayClick,
}: {
  sessions: WorkoutSession[];
  weeklyGoal: number;
  onDayClick?: (sessionId: string) => void;
  onTodayClick?: () => void;
}) {
  const currentWeekRef = useRef<HTMLDivElement>(null);
  const today          = format(new Date(), 'yyyy-MM-dd');
  const totalWeeks     = WEEKS_PAST + 1 + WEEKS_FUTURE;

  /** Map date string → most recent session id for that day */
  const sessionByDay = useMemo(() => {
    const map = new Map<string, string>();
    // Sort ascending so last write wins (most recent)
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach(s => {
      try { map.set(format(parseISO(s.date), 'yyyy-MM-dd'), s.id); } catch {}
    });
    return map;
  }, [sessions]);

  const weeks = useMemo(() => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: totalWeeks }, (_, i) => {
      const offset = i - CURRENT_WEEK_INDEX;
      return offset < 0
        ? subWeeks(currentWeekStart, Math.abs(offset))
        : addWeeks(currentWeekStart, offset);
    });
  }, [totalWeeks]);

  const trainedDaySet = useMemo(() => new Set(sessionByDay.keys()), [sessionByDay]);

  // Scroll current week to the vertical center of the viewport on mount
  useEffect(() => {
    currentWeekRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, []);

  return (
    <div className="mx-6 mb-8 flex flex-col gap-3">
      {weeks.map((weekStart, weekIdx) => {
        const weekEnd   = endOfWeek(weekStart, { weekStartsOn: 0 });
        const isCurrent = weekIdx === CURRENT_WEEK_INDEX;
        const weekLabel = `${format(weekStart, 'dd/MM')} – ${format(weekEnd, 'dd/MM')}`;

        let trainedCount = 0;
        for (let d = 0; d < 7; d++) {
          if (trainedDaySet.has(format(addDays(weekStart, d), 'yyyy-MM-dd'))) trainedCount++;
        }

        return (
          <div
            key={format(weekStart, 'yyyy-MM-dd')}
            ref={isCurrent ? currentWeekRef : undefined}
            className={cn(
              'bg-dark-card border rounded-2xl px-4 py-3',
              isCurrent ? 'border-white/15' : 'border-white/5',
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <p className={cn(
                'text-xs font-black uppercase tracking-widest',
                isCurrent ? 'text-white/60' : 'text-white/30',
              )}>
                {weekLabel}
              </p>
              <div className="flex items-center gap-1">
                {trainedCount >= weeklyGoal
                  ? <Check size={11} strokeWidth={3.5} className={cn(isCurrent ? 'text-white/60' : 'text-white/30')} />
                  : weekIdx < CURRENT_WEEK_INDEX && (
                      <X size={11} strokeWidth={3.5} className={cn(isCurrent ? 'text-white/60' : 'text-white/30')} />
                    )
                }
                <p className={cn(
                  'text-xs font-black uppercase tracking-widest',
                  isCurrent ? 'text-white/60' : 'text-white/30',
                )}>
                  {trainedCount}/{weeklyGoal}
                </p>
              </div>
            </div>

            <div className="flex items-end justify-between gap-1">
              {WEEK_DAYS.map((label, dayIdx) => {
                const dayKey    = format(addDays(weekStart, dayIdx), 'yyyy-MM-dd');
                const trained   = trainedDaySet.has(dayKey);
                const isToday   = dayKey === today;
                const isPast    = dayKey < today;
                const clickable = trained && (isPast || isToday) && !!onDayClick;
                const todayClickable = isToday && !trained && !!onTodayClick;

                return (
                  <div
                    key={label}
                    className={cn('flex flex-col items-center gap-2', isToday ? 'flex-[1.25]' : 'flex-1')}
                  >
                    <div
                      onClick={
                        clickable
                          ? () => onDayClick!(sessionByDay.get(dayKey)!)
                          : todayClickable
                            ? () => onTodayClick!()
                            : undefined
                      }
                      className={cn(
                        'w-full rounded-lg transition-colors duration-300 flex items-center justify-center',
                        isToday ? 'h-10' : 'h-8',
                        (clickable || todayClickable) && 'cursor-pointer active:scale-95',
                        trained && isToday
                          ? 'bg-brand-red shadow-[0_2px_0_0_rgba(150,10,10,0.6)]'
                          : trained
                            ? 'bg-brand-red/30'
                            : isToday
                              ? 'bg-brand-red shadow-[0_2px_0_0_rgba(150,10,10,0.6)]'
                              : 'bg-white/5',
                      )}>
                      {trained
                        ? <Check size={isToday ? 16 : 13} color={isToday ? 'white' : 'rgba(255,255,255,0.45)'} strokeWidth={3} />
                        : isToday && <Play size={14} fill="white" color="white" />
                      }
                    </div>
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-wide',
                      isToday ? 'text-white' : 'text-white/30',
                    )}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
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
  setScrollToHistory,
  setHighlightSessionId,
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
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
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
    <div className="-mx-6 flex flex-col relative" style={{ height: 'calc(100dvh - 6rem)' }}>
      {/* ── Fixed top: stats bar + workout card ── */}
      <div className="shrink-0 border-b border-white/5 pb-3">
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
      </div>

      {/* ── Scrollable weeks ── */}
      <div className="flex-1 overflow-y-auto pt-3">
        <WeekDayBar
          sessions={sessions}
          weeklyGoal={weeklyGoal}
          onDayClick={(sessionId) => {
            setHighlightSessionId?.(sessionId);
            setScrollToHistory?.(true);
            switchTab('workouts');
          }}
          onTodayClick={() => setShowWorkoutPicker(true)}
        />
      </div>

      {/* ── Workout picker bottom sheet ── */}
      {showWorkoutPicker && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowWorkoutPicker(false)}
        >
          <div
            className="bg-dark-card rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto -mt-1 mb-1" />

            <p className="text-xs font-black uppercase tracking-widest text-white/40">Escolha um treino</p>

            {templates.length === 0 ? (
              <div className="py-8 text-center space-y-2 opacity-40">
                <p className="text-sm">Nenhum treino criado ainda.</p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setShowWorkoutPicker(false);
                      onStartWorkout(template);
                    }}
                    className="shrink-0 w-44 bg-white/5 border border-white/10 rounded-2xl p-4 text-left flex flex-col gap-3 active:scale-[0.97] transition-transform"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center p-2"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      <img
                        src={iconMusculacao}
                        className="w-full h-full object-contain brightness-0 invert"
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="text-sm font-black leading-tight line-clamp-2">{template.name}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                        {template.sheets?.length ?? 0} {(template.sheets?.length ?? 0) === 1 ? 'sessão' : 'sessões'}
                      </p>
                    </div>
                    <div className="mt-auto w-full bg-brand-red rounded-xl flex items-center justify-center gap-1.5 py-2">
                      <Play size={12} fill="white" color="white" />
                      <span className="text-xs font-black text-white">Iniciar</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
