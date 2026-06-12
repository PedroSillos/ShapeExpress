import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { WorkoutSession, WorkoutTemplate } from '../../domain/entities';
import { Card } from '../components/Card';
import { EXERCISES } from '../../constants';

interface StatsViewProps {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  onCreateWorkout: () => void;
  onGoToStore: () => void;
  hideHeader?: boolean;
  readOnly?: boolean;
}

export function StatsView({
  sessions,
  templates,
  onCreateWorkout,
  onGoToStore,
  hideHeader,
  readOnly,
}: StatsViewProps) {
  const chartData = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)
        .reverse()
        .map(s => ({ date: format(parseISO(s.date), 'dd/MM'), volume: s.totalVolume })),
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

  if (sessions.length === 0) {
    return (
      <div className="space-y-6 pt-6">
        {!hideHeader && <h2 className="text-xl font-bold">Estatísticas</h2>}
        <Card className="py-12 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
            <BarChart3 size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-white/40 font-bold">Sem dados para exibir</p>
            <p className="text-xs text-white/20">Complete seu primeiro treino para ver suas estatísticas.</p>
          </div>
          {!readOnly && (
            <div className="flex flex-col gap-3 w-full px-6">
              <button
                onClick={onCreateWorkout}
                className="w-full py-3 bg-brand-red/10 text-brand-red rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Criar Meu Primeiro Treino
              </button>
              <button
                onClick={onGoToStore}
                className="w-full py-3 bg-white/5 text-white/60 rounded-xl font-bold text-sm active:scale-95 transition-transform border border-white/5"
              >
                Adquirir Novo Treino
              </button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      {!hideHeader && <h2 className="text-xl font-bold">Estatísticas</h2>}

      <Card className="h-64">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
          Volume por Sessão (kg)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--theme-text)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--theme-text)" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--theme-card)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}
              itemStyle={{ color: 'var(--theme-primary)' }}
            />
            <Line type="monotone" dataKey="volume" stroke="var(--theme-primary)" strokeWidth={3} dot={{ fill: 'var(--theme-primary)', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
          Frequência Muscular
        </h3>
        <div className="space-y-4">
          {muscleData.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span>{item.name}</span>
                <span className="text-white/40">{item.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-dark-border rounded-full overflow-hidden">
                <div className="h-full bg-brand-red" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
