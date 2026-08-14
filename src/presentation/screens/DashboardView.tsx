import { useMemo, useRef, useEffect, useState } from 'react';
import { startOfWeek, parseISO, format, subWeeks, addWeeks, addDays, endOfWeek } from 'date-fns';
import { Play, Check, X, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { STORAGE_KEYS } from '../../shared/lib/storageKeys';
import { AddSportView } from '../../features/sports/ui/AddSportView';
import { getSportLevel } from '../../domain/use-cases/sportLevel';
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
  /** Called when the user picks a new sport from the "Novo" button in the sport dropdown. */
  onAddSport?: (sport: string) => void;
  /** Currently active sport (from global nav state, persisted). */
  activeSport: string;
  /** Called when the user selects a different sport in the header dropdown. */
  onSportChange: (sport: string) => void;
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
      const weekKey = format(startOfWeek(parseISO(s.date), { weekStartsOn: 0 }), 'yyyy-MM-dd');
      if (!byWeek[weekKey]) byWeek[weekKey] = new Set();
      byWeek[weekKey].add(dayKey);
    } catch {}
  });

  let streak = 0;
  let weekCursor = startOfWeek(new Date(), { weekStartsOn: 0 });

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
const WEEKS_PAST         = 4;
const WEEKS_FUTURE       = 2;
const CURRENT_WEEK_INDEX = WEEKS_PAST; // index 4

/** Stacked bar showing 2 past weeks, current week, and 3 future weeks.
 *  On mount the current-week card is scrolled to the vertical center of the viewport. */
/** Resolve the sport name for a given session via the template list.
 *  Uses template.sport when available; falls back to name-matching for
 *  legacy templates created before the sport field existed, or session.workoutName if template is deleted. */
function getSportForWorkout(session: WorkoutSession, templates: WorkoutTemplate[]): string {
  const t = templates.find(t => t.id === session.workoutId);
  if (!t) {
    // Template deleted - use workoutName fallback
    const workoutName = session.workoutName?.toLowerCase() ?? '';
    const known = Object.keys(SPORT_COLORS);
    return known.find(s => workoutName.includes(s.toLowerCase())) ?? 'Musculação';
  }
  // Prefer explicit sport field (set since the sport-field commit)
  if (t.sport) return t.sport;
  // Legacy fallback: derive from template name
  const known = Object.keys(SPORT_COLORS);
  return known.find(s => t.name.toLowerCase().includes(s.toLowerCase())) ?? 'Musculação';
}

/** Get sport from template directly */
function getSportFromTemplate(template: WorkoutTemplate): string {
  if (template.sport) return template.sport;
  const known = Object.keys(SPORT_COLORS);
  return known.find(s => template.name.toLowerCase().includes(s.toLowerCase())) ?? 'Musculação';
}

/** Renders the inner content of a trained day cell:
 *  - 1 sport  → sport icon centered on solid color bg
 *  - 2 sports → split-diagonal halves, each with its sport icon
 *  - 3+ sports → rainbow gradient + star burst icon */
function DayTrainedContent({
  sports,
  size,
}: {
  sports: string[];   // deduplicated sport names for this day
  size: number;       // icon size in px
}) {
  if (sports.length === 0) return null;

  if (sports.length === 1) {
    const sport = sports[0];
    const icon  = SPORT_ICONS[sport] ?? iconMusculacao;
    return (
      <img
        src={icon}
        alt={sport}
        style={{ width: size, height: size }}
        className="brightness-0 invert opacity-90 object-contain"
      />
    );
  }

  if (sports.length === 2) {
    const [s1, s2] = sports;
    const icon1 = SPORT_ICONS[s1] ?? iconMusculacao;
    const icon2 = SPORT_ICONS[s2] ?? iconMusculacao;
    // Two small icons side by side
    const half = Math.round(size * 0.72);
    return (
      <div className="flex items-center justify-center gap-0.5">
        <img src={icon1} alt={s1} style={{ width: half, height: half }} className="brightness-0 invert opacity-90 object-contain" />
        <img src={icon2} alt={s2} style={{ width: half, height: half }} className="brightness-0 invert opacity-90 object-contain" />
      </div>
    );
  }

  // 3+ sports: prismatic shimmer
  return (
    <span
      style={{ fontSize: size + 2, lineHeight: 1, color: 'rgba(30,30,40,0.7)', textShadow: '0 1px 2px rgba(255,255,255,0.4)' }}
      role="img"
      aria-label="multi-sport"
    >
      ✦
    </span>
  );
}

/** Background style for a trained day cell based on the sports trained. */

const PRISMATIC_BG        = 'rgba(255,255,255,0.35)';
const PRISMATIC_BG_FADED  = 'rgba(255,255,255,0.20)';
const PRISMATIC_SHADOW    = '0 2px 0 0 rgba(255,255,255,0.18)';
const PRISMATIC_SHADOW_LG = '0 3px 0 0 rgba(255,255,255,0.18)';

function dayBgStyle(sports: string[], isToday: boolean): { className: string; style?: React.CSSProperties } {
  if (sports.length === 0) {
    return isToday
      ? { className: 'bg-brand-red shadow-[0_2px_0_0_rgba(150,10,10,0.6)]' }
      : { className: 'bg-white/5' };
  }

  if (sports.length === 1) {
    const color = SPORT_COLORS[sports[0]] ?? '#dc2626';
    const shadow = isToday ? `0 2px 0 0 ${color}99` : undefined;
    return {
      className: '',
      style: {
        backgroundColor: isToday ? color : `${color}55`,
        boxShadow: shadow,
      },
    };
  }

  if (sports.length === 2) {
    const c1 = SPORT_COLORS[sports[0]] ?? '#dc2626';
    const c2 = SPORT_COLORS[sports[1]] ?? '#2563eb';
    const opacity = isToday ? 'ff' : '66';
    return {
      className: '',
      style: {
        background: `linear-gradient(135deg, ${c1}${opacity} 50%, ${c2}${opacity} 50%)`,
      },
    };
  }

  // 3+ sports: prismatic silver/white
  return {
    className: '',
    style: {
      background: isToday ? PRISMATIC_BG : PRISMATIC_BG_FADED,
      boxShadow: isToday ? PRISMATIC_SHADOW : undefined,
    },
  };
}

function WeekDayBar({
  sessions,
  templates,
  weeklyGoal,
  currentSport,
  onDayClick,
  onTodayClick,
}: {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  weeklyGoal: number;
  currentSport: string;
  onDayClick?: (sessionId: string) => void;
  onTodayClick?: () => void;
}) {
  const currentWeekRef = useRef<HTMLDivElement>(null);
  const today          = format(new Date(), 'yyyy-MM-dd');
  const totalWeeks     = WEEKS_PAST + 1 + WEEKS_FUTURE;

  /** Map date string → most recent session id for that day */
  const sessionByDay = useMemo(() => {
    const map = new Map<string, string>();
    const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach(s => {
      try { map.set(format(parseISO(s.date), 'yyyy-MM-dd'), s.id); } catch {}
    });
    return map;
  }, [sessions]);

  /** Map date string → all sessions for that day */
  const sessionsByDay = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    sessions.forEach(s => {
      try {
        const key = format(parseISO(s.date), 'yyyy-MM-dd');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(s);
      } catch {}
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
                // Today always opens the workout picker — never navigates to history.
                const clickable = !isToday && trained && isPast && !!onDayClick;

                // Deduplicated sports trained on this day
                const daySports = trained
                  ? [...new Set(
                      (sessionsByDay.get(dayKey) ?? []).map(s => getSportForWorkout(s, templates))
                    )]
                  : [];

                const todaySportColor = SPORT_COLORS[currentSport] ?? '#dc2626';
                // Today always shows the active-sport color + play icon, regardless of trained state.
                const bg = isToday
                  ? { className: '', style: { backgroundColor: todaySportColor, boxShadow: `0 2px 0 0 ${todaySportColor}99` } }
                  : trained
                    ? dayBgStyle(daySports, false)
                    : { className: 'bg-white/5' };

                return (
                  <div
                    key={label}
                    className={cn('flex flex-col items-center gap-2', isToday ? 'flex-[1.25]' : 'flex-1')}
                  >
                    <div
                      onClick={
                        isToday && !!onTodayClick
                          ? () => onTodayClick!()
                          : clickable
                            ? () => onDayClick!(sessionByDay.get(dayKey)!)
                            : undefined
                      }
                      className={cn(
                        'w-full rounded-lg transition-colors duration-300 flex items-center justify-center overflow-hidden',
                        isToday ? 'h-10' : 'h-8',
                        (isToday || clickable) && !!onTodayClick && 'cursor-pointer active:scale-95',
                        bg.className,
                      )}
                      style={bg.style}
                    >
                      {isToday ? (
                        <Play size={14} fill="white" color="white" />
                      ) : trained ? (
                        <DayTrainedContent sports={daySports} size={13} />
                      ) : null}
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
  onAddSport,
  activeSport: activeSportProp,
  onSportChange,
}: DashboardViewProps) {
  // The sport menu always reflects the user's profile specialties — the source of truth.
  // Templates are used only to pick the currentTemplate, not to define which sports exist.
  const templateSports = useMemo(() => {
    if (mainUserProfile?.specialties?.length) return mainUserProfile.specialties;
    if (!isLoggedIn) {
      try {
        const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null');
        if (wa?.sports?.length) return wa.sports as string[];
      } catch {}
    }
    return ['Musculação'];
  }, [mainUserProfile, isLoggedIn]);

  // Resolve the active sport: use the global prop if valid, otherwise fall back to first sport.
  // Also sync the global state when it's empty or out of bounds (e.g. on first load or after
  // the user removes the previously-active sport from their profile).
  const currentSport = useMemo(() => {
    if (activeSportProp && templateSports.includes(activeSportProp)) return activeSportProp;
    return templateSports[0] ?? 'Musculação';
  }, [activeSportProp, templateSports]);

  // Write the resolved value back to global state whenever it differs from the stored prop
  // (handles first-load '' and out-of-bounds cases without triggering a loop).
  useEffect(() => {
    if (currentSport !== activeSportProp) {
      onSportChange(currentSport);
    }
  }, [currentSport, activeSportProp, onSportChange]);

  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
  const [showAddSport, setShowAddSport] = useState(false);

  const goalStreak = useMemo(() => calcGoalStreak(sessions, mainUserProfile.weeklyGoal ?? 3), [sessions, mainUserProfile.weeklyGoal]);

  const completedThisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return sessions.filter(s => { try { return parseISO(s.date) >= weekStart; } catch { return false; } }).length;
  }, [sessions]);

  // currentTemplate: most recently used template of the active sport.
  // Returns null (→ "Criar primeiro treino" banner) when no template belongs to the
  // current sport. Never falls back to a template from a different sport.
  const currentTemplate = useMemo(() => {
    const sportTemplates = templates.filter(t => getSportFromTemplate(t) === currentSport);
    if (sportTemplates.length === 0) return null;
    // Sort by most recent session; templates never used come last.
    const lastSessionDate = (t: typeof templates[0]) =>
      sessions.filter(s => s.workoutId === t.id).map(s => s.date).sort().at(-1) ?? '';
    return [...sportTemplates].sort((a, b) => lastSessionDate(b).localeCompare(lastSessionDate(a)))[0];
  }, [templates, sessions, currentSport]);

  // Trail: one node per weekly goal slot. Nodes up to completedThisWeek are "done",
  const weeklyGoal = Math.max(1, mainUserProfile.weeklyGoal ?? 3);

  const [showSportMenu, setShowSportMenu] = useState(false);

  return (
    <div className="-mx-6 flex flex-col relative" style={{ height: 'calc(100dvh - 6rem)' }}>
      {/* ── Fixed top: stats bar + workout card ── */}
      <div className="shrink-0 border-b border-white/5 pb-3">
        {/* Top stats bar — Duolingo style */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 mt-2">

          {/* Sport selector — tap to open dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSportMenu(v => !v)}
              className="flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center p-1 shrink-0"
                style={{ backgroundColor: SPORT_COLORS[currentSport] ?? '#dc2626' }}
              >
                <img
                  src={SPORT_ICONS[currentSport] ?? iconMusculacao}
                  className="w-full h-full object-contain brightness-0 invert"
                  alt={currentSport}
                />
              </div>
              <span
                className="font-black text-sm"
                style={{ color: SPORT_COLORS[currentSport] ?? '#dc2626' }}
              >
                {getSportLevel(userStats.sportXp, currentSport)}
              </span>
            </button>

            {/* Dropdown anchored below the icon */}
            {showSportMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[199]"
                  onClick={() => setShowSportMenu(false)}
                />
                {/* Triangle pointer */}
                <div
                  className="absolute left-3 top-full mt-1 w-0 h-0 z-[201]"
                  style={{
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderBottom: '7px solid #1e2130',
                  }}
                />
                <div className="absolute left-0 top-full mt-2 z-[200] bg-[#1e2130] border border-white/10 rounded-2xl p-3 shadow-2xl">
                  <div className="flex gap-2.5">
                    {templateSports.map((s) => (
                      <button
                        key={s}
                        onClick={() => { onSportChange(s); setShowSportMenu(false); }}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all active:scale-95 w-16',
                          s === currentSport
                            ? 'border-transparent'
                            : 'bg-white/5 border-white/10 opacity-60'
                        )}
                        style={s === currentSport ? { backgroundColor: SPORT_COLORS[s] ?? '#dc2626', borderColor: SPORT_COLORS[s] ?? '#dc2626' } : {}}
                      >
                        <img
                          src={SPORT_ICONS[s] ?? iconMusculacao}
                          alt={s}
                          className="w-6 h-6 brightness-0 invert"
                        />
                        <span className="text-[9px] font-black text-white text-center leading-tight min-h-[2.2em] flex items-center justify-center">{s}</span>
                      </button>
                    ))}
                    {onAddSport && (
                      <button
                        onClick={() => { setShowSportMenu(false); setShowAddSport(true); }}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-white/15 bg-white/5 active:scale-95 transition-all w-16 opacity-70 hover:opacity-100"
                      >
                        <Plus size={24} className="text-white w-6 h-6" />
                        <span className="text-[9px] font-black text-white text-center leading-tight min-h-[2.2em] flex items-center justify-center">Novo</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Streak — center */}
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
            <div className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center p-1 shrink-0',
              completedThisWeek > 0 ? 'bg-blue-600' : 'bg-white/10',
            )}>
              <img
                src={iconCalendar}
                className={cn('w-full h-full object-contain brightness-0 invert', completedThisWeek === 0 && 'opacity-40')}
                alt="meta semanal"
              />
            </div>
            <span className={cn('font-black text-sm', completedThisWeek > 0 ? 'text-blue-400' : 'text-white/30')}>{completedThisWeek}/{mainUserProfile.weeklyGoal ?? 3}</span>
          </div>
        </div>

        {/* Mission banner */}
        {currentTemplate ? (
          <button
            onClick={() => onStartWorkout(currentTemplate)}
            className="mx-6 mt-3 w-[calc(100%-3rem)] rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-all border border-white/10"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${SPORT_COLORS[currentSport] ?? '#dc2626'} 80%, #000) 0%, ${SPORT_COLORS[currentSport] ?? '#dc2626'} 100%)`,
              boxShadow: `0 4px 0 0 color-mix(in srgb, ${SPORT_COLORS[currentSport] ?? '#dc2626'} 60%, #000)`,
            }}
          >
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                {completedThisWeek} de {mainUserProfile.weeklyGoal ?? 3} essa semana
              </p>
              <p className="font-black text-white text-base leading-tight">{currentTemplate.name}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <img src={SPORT_ICONS[currentSport] ?? iconMusculacao} alt="" className="w-5 h-5 brightness-0 invert" />
            </div>
          </button>
        ) : (
          <button
            onClick={() => switchTab('workouts')}
            className="mx-6 mt-3 w-[calc(100%-3rem)] rounded-2xl flex items-center justify-between px-4 py-3 active:scale-[0.98] transition-all border border-white/10"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${SPORT_COLORS[currentSport] ?? '#dc2626'} 80%, #000) 0%, ${SPORT_COLORS[currentSport] ?? '#dc2626'} 100%)`,
              boxShadow: `0 4px 0 0 color-mix(in srgb, ${SPORT_COLORS[currentSport] ?? '#dc2626'} 60%, #000)`,
            }}
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
          templates={templates}
          weeklyGoal={weeklyGoal}
          currentSport={currentSport}
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

            {templates.filter(t => getSportFromTemplate(t) === currentSport).length === 0 ? (
              <div className="py-8 text-center space-y-2 opacity-40">
                <p className="text-sm">Nenhum treino de {currentSport} criado ainda.</p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                {[...templates]
                  // Only show templates matching the currently active sport
                  .filter(t => getSportFromTemplate(t) === currentSport)
                  .sort((a, b) => {
                    // Sort by last session date ascending (never used → first, most recent → last)
                    const lastA = sessions
                      .filter(s => s.workoutId === a.id)
                      .map(s => s.date)
                      .sort()
                      .at(-1) ?? '';
                    const lastB = sessions
                      .filter(s => s.workoutId === b.id)
                      .map(s => s.date)
                      .sort()
                      .at(-1) ?? '';
                    return lastA.localeCompare(lastB);
                  }).map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setShowWorkoutPicker(false);
                      onStartWorkout(template);
                    }}
                    className="shrink-0 w-44 bg-white/5 border border-white/10 rounded-2xl p-4 text-left flex flex-col gap-3 active:scale-[0.97] transition-transform"
                  >
                    {(() => {
                      const tSport = template.sport ?? getSportFromTemplate(template);
                      const sportColor = SPORT_COLORS[tSport] ?? '#dc2626';
                      const sportIcon  = SPORT_ICONS[tSport]  ?? iconMusculacao;
                      return (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center p-2"
                          style={{ backgroundColor: sportColor }}
                        >
                          <img
                            src={sportIcon}
                            className="w-full h-full object-contain brightness-0 invert"
                            alt={tSport}
                          />
                        </div>
                      );
                    })()}
                    <div>
                      <p className="text-sm font-black leading-tight line-clamp-2">{template.name}</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                        {(() => { const n = sessions.filter(s => s.workoutId === template.id).length; return n === 0 ? 'Novo' : `${n} ${n === 1 ? 'sessão' : 'sessões'}`; })()}
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

      {/* ── Add sport overlay ── */}
      {showAddSport && (
        <div className="absolute inset-0 z-50">
          <AddSportView
            currentSports={templateSports}
            onAdd={(sport) => {
              setShowAddSport(false);
              onAddSport?.(sport);
            }}
            onBack={() => setShowAddSport(false)}
          />
        </div>
      )}
    </div>
  );
}
