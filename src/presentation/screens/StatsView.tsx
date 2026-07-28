import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { STORAGE_KEYS } from '../../shared/lib/storageKeys';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { WorkoutSession, WorkoutTemplate, UserProfile } from '../../domain/entities';
import { EXERCISES } from '../../constants';
import { BarChart3 } from 'lucide-react';
import iconMusculacao    from '@/src/assets/icons/icon-musculacao.svg';
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconCorrida       from '@/src/assets/icons/icon-corrida.svg';
import iconCiclismo      from '@/src/assets/icons/icon-ciclismo.svg';
import iconNatacao       from '@/src/assets/icons/icon-natacao.svg';
import iconCrossfit      from '@/src/assets/icons/icon-crossfit.svg';
import iconTriatlo       from '@/src/assets/icons/icon-triatlo.svg';
import iconYoga          from '@/src/assets/icons/icon-yoga.svg';

const SPORT_ICONS: Record<string, string> = {
  'Musculação':     iconMusculacao,
  'Halterofilismo': iconHalterofilismo,
  'Corrida':        iconCorrida,
  'Ciclismo':       iconCiclismo,
  'Natação':        iconNatacao,
  'Crossfit':       iconCrossfit,
  'Triatlo':        iconTriatlo,
  'Yoga':           iconYoga,
};

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

// ─── Header ───────────────────────────────────────────────────────────────────

function StatsHeader({ sport }: { sport: string }) {
  const color = SPORT_COLORS[sport] ?? '#7c3aed';
  const icon  = SPORT_ICONS[sport];

  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 60);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 60);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 60);
  const darker = `rgb(${r},${g},${b})`;

  return (
    <div
      className="relative overflow-hidden -mx-6 mb-6"
      style={{ background: `linear-gradient(135deg, ${darker} 0%, ${color} 60%, ${color}cc 100%)` }}
    >
      <div className="px-6 pt-10 pb-8 flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white leading-tight">Estatísticas</h1>
          <p className="text-white/70 text-sm font-semibold">{sport}</p>
        </div>
        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
          {icon
            ? <img src={icon} alt={sport} className="w-9 h-9 brightness-0 invert" />
            : <BarChart3 size={36} className="text-white" />}
        </div>
      </div>
      {/* decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-3">
      {children}
    </p>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatsViewProps {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  mainUserProfile?: UserProfile;
  onGoToWorkouts?: () => void;
  hideHeader?: boolean;
  readOnly?: boolean;
  /** Currently active sport (from global nav state). Used to filter sessions for stats. */
  activeSport?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the sport name for a session by looking up the template. */
function getSportForSession(session: WorkoutSession, templates: WorkoutTemplate[]): string {
  const t = templates.find(t => t.id === session.workoutId);
  if (!t) return session.workoutName?.toLowerCase().includes('corrida') ? 'Corrida' : 'Musculação';
  if (t.sport) return t.sport;
  const known = ['Musculação', 'Crossfit', 'Corrida', 'Yoga', 'Natação', 'Ciclismo', 'Halterofilismo', 'Triatlo'];
  return known.find(s => t.name.toLowerCase().includes(s.toLowerCase())) ?? 'Musculação';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function StatsView({
  sessions,
  templates,
  mainUserProfile,
  onGoToWorkouts,
  hideHeader,
  readOnly,
  activeSport: activeSportProp,
}: StatsViewProps) {
  // Resolve sport: prefer global activeSport, then profile specialties, then guest answers.
  const sport = useMemo(() => {
    if (activeSportProp) return activeSportProp;
    if (mainUserProfile?.specialties?.length) return mainUserProfile.specialties[0];
    try {
      const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null');
      if (wa?.sports?.length) return wa.sports[0] as string;
    } catch {}
    return 'Musculação';
  }, [activeSportProp, mainUserProfile]);

  // Filter sessions to only the active sport for all stat calculations.
  const filteredSessions = useMemo(
    () => sessions.filter(s => getSportForSession(s, templates) === sport),
    [sessions, templates, sport],
  );

  const chartData = useMemo(
    () =>
      [...filteredSessions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)
        .reverse()
        .map(s => ({ date: format(parseISO(s.date), 'dd/MM'), volume: s.totalVolume })),
    [filteredSessions],
  );

  const avgWeightData = useMemo(
    () =>
      [...filteredSessions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)
        .reverse()
        .map(s => {
          const sets = s.exercises.flatMap(ex => ex.sets.filter(set => set.completed && set.weight > 0));
          const avg = sets.length > 0
            ? Math.round(sets.reduce((acc, set) => acc + set.weight, 0) / sets.length)
            : 0;
          return { date: format(parseISO(s.date), 'dd/MM'), avgWeight: avg };
        }),
    [filteredSessions],
  );

  const muscleData = useMemo(() => {
    const counts: Record<string, number> = {
      Peito: 0, Costas: 0, Pernas: 0, Ombros: 0, Braços: 0, Core: 0, 'Full Body': 0,
    };
    let total = 0;
    filteredSessions.forEach(s => {
      s.exercises.forEach(ex => {
        const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
        if (exercise) { counts[exercise.muscleGroup]++; total++; }
      });
    });
    if (total === 0) return Object.entries(counts).map(([name]) => ({ name, value: 0 }));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, value: Math.round((count / total) * 100) }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredSessions]);

  const totalVolume = useMemo(
    () => filteredSessions.reduce((acc, s) => acc + (s.totalVolume ?? 0), 0),
    [filteredSessions],
  );

  const avgDuration = useMemo(() => {
    const withDuration = filteredSessions.filter(s => s.duration && s.duration > 0);
    if (withDuration.length === 0) return 0;
    return Math.round(withDuration.reduce((acc, s) => acc + (s.duration ?? 0), 0) / withDuration.length);
  }, [filteredSessions]);

  // ── Empty state ────────────────────────────────────────────────────────────

  if (filteredSessions.length === 0) {
    return (
      <div className="pb-24">
        {!hideHeader && <StatsHeader sport={sport} />}

        <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${SPORT_COLORS[sport] ?? '#E53E3E'}cc, ${SPORT_COLORS[sport] ?? '#E05C2A'})` }} />
          <div className="px-6 py-12 flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <img src={iconHalterofilismo} alt="" className="w-10 h-10 brightness-0 invert opacity-20" />
            </div>
            <div className="space-y-2">
              <p className="text-white/50 font-black text-base">Sem dados para exibir</p>
              <p className="text-sm text-white/30 font-semibold">
                Complete seu primeiro treino para ver as suas estatísticas
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  }

  const accentGradient = `linear-gradient(90deg, ${SPORT_COLORS[sport] ?? '#E53E3E'}cc, ${SPORT_COLORS[sport] ?? '#E05C2A'})`;

  // ── With data ──────────────────────────────────────────────────────────────

  return (
    <div className="pb-24">
      {!hideHeader && <StatsHeader sport={sport} />}

      <div className="space-y-6">
        {/* Avg weight chart */}
        <div>
          <SectionLabel>Média de Peso por Sessão (kg)</SectionLabel>
          <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: accentGradient }} />
            <div className="p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={avgWeightData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--theme-text)"
                    strokeOpacity={0.5}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--theme-text)"
                    strokeOpacity={0.5}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--theme-card)',
                      border: '1px solid var(--theme-border)',
                      borderRadius: '12px',
                    }}
                    itemStyle={{ color: '#60a5fa' }}
                    formatter={(value: number) => [`${value} kg`, 'Média de peso']}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgWeight"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    dot={{ fill: '#60a5fa', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Volume chart */}
        <div>
          <SectionLabel>Volume por Sessão (kg)</SectionLabel>
          <div
            className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden"
          >
            {/* accent stripe */}
            <div className="h-1 w-full" style={{ background: accentGradient }} />
            <div className="p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--theme-text)"
                    strokeOpacity={0.5}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--theme-text)"
                    strokeOpacity={0.5}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--theme-card)',
                      border: '1px solid var(--theme-border)',
                      borderRadius: '12px',
                    }}
                    itemStyle={{ color: 'var(--theme-primary)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="var(--theme-primary)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--theme-primary)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Muscle frequency */}
        <div>
          <SectionLabel>Frequência Muscular</SectionLabel>
          <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: accentGradient }} />
            <div className="p-4 space-y-4">
              {muscleData.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white/70">{item.name}</span>
                    <span className="text-[10px] font-bold text-white/30">{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-dark-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.value}%`,
                        background: accentGradient,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
