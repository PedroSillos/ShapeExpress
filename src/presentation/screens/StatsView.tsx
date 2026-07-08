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
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconTrophy from '@/src/assets/icons/icon-trophy.svg';
import iconAlarm from '@/src/assets/icons/icon-alarm.svg';

// ─── Header ───────────────────────────────────────────────────────────────────

function StatsHeader({ sport }: { sport: string }) {
  return (
    <div
      className="relative overflow-hidden -mx-6 mb-6"
      style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 60%, #A78BFA 100%)' }}
    >
      <div className="px-6 pt-10 pb-8 flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white leading-tight">Estatísticas</h1>
          <p className="text-white/70 text-sm font-semibold">{sport}</p>
        </div>
        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
          <BarChart3 size={36} className="text-white" />
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
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function StatsView({
  sessions,
  templates,
  mainUserProfile,
  onGoToWorkouts,
  hideHeader,
  readOnly,
}: StatsViewProps) {
  const sport = useMemo(() => {
    if ((mainUserProfile as any)?.sports?.length) return (mainUserProfile as any).sports[0] as string;
    try {
      const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null');
      if (wa?.sports?.length) return wa.sports[0] as string;
    } catch {}
    return 'Musculação';
  }, [mainUserProfile]);

  const chartData = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)
        .reverse()
        .map(s => ({ date: format(parseISO(s.date), 'dd/MM'), volume: s.totalVolume })),
    [sessions],
  );

  const avgWeightData = useMemo(
    () =>
      [...sessions]
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
    [sessions],
  );

  const muscleData = useMemo(() => {
    const counts: Record<string, number> = {
      Peito: 0, Costas: 0, Pernas: 0, Ombros: 0, Braços: 0, Core: 0, 'Full Body': 0,
    };
    let total = 0;
    sessions.forEach(s => {
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
  }, [sessions]);

  const totalVolume = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.totalVolume ?? 0), 0),
    [sessions],
  );

  const avgDuration = useMemo(() => {
    const withDuration = sessions.filter(s => s.duration && s.duration > 0);
    if (withDuration.length === 0) return 0;
    return Math.round(withDuration.reduce((acc, s) => acc + (s.duration ?? 0), 0) / withDuration.length);
  }, [sessions]);

  // ── Empty state ────────────────────────────────────────────────────────────

  if (sessions.length === 0) {
    return (
      <div className="pb-24">
        {!hideHeader && <StatsHeader sport={sport} />}

        <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #E53E3E, #E05C2A)' }} />
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
            {!readOnly && onGoToWorkouts && (
              <button
                onClick={onGoToWorkouts}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white border border-brand-red/50 bg-brand-red/15 active:scale-95 transition-transform hover:bg-brand-red/25 hover:border-brand-red"
              >
                Ir para treinos
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── With data ──────────────────────────────────────────────────────────────

  return (
    <div className="pb-24">
      {!hideHeader && <StatsHeader sport={sport} />}

      <div className="space-y-6">
        {/* Avg weight chart */}
        <div>
          <SectionLabel>Média de Peso por Sessão (kg)</SectionLabel>
          <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #E53E3E, #E05C2A)' }} />
            <div className="p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={avgWeightData}>
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
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #E53E3E, #E05C2A)' }} />
            <div className="p-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #E53E3E, #E05C2A)' }} />
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
                        background: 'linear-gradient(90deg, #E53E3E, #E05C2A)',
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
