import { useMemo } from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutSession } from '../../domain/entities';
import { Card } from './Card';

export function ExerciseHistoryDashboard({ exerciseId, sessions }: { exerciseId: string; sessions: WorkoutSession[] }) {
  const historyData = useMemo(() => {
    const data: { date: string; volume: number; maxWeight: number }[] = [];
    sessions.forEach(s => {
      const exSession = s.exercises.find(ex => ex.exerciseId === exerciseId);
      if (exSession) {
        let volume = 0;
        let maxWeight = 0;
        exSession.sets.forEach(set => {
          if (set.completed) {
            volume += set.weight * set.reps;
            if (set.weight > maxWeight) maxWeight = set.weight;
          }
        });
        if (volume > 0) data.push({ date: format(parseISO(s.date), 'dd/MM'), volume, maxWeight });
      }
    });
    return data.reverse().slice(-5);
  }, [exerciseId, sessions]);

  if (historyData.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-3 space-y-2 h-32">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Volume (kg)</p>
          <TrendingUp size={12} className="text-brand-red" />
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData}>
              <Bar dataKey="volume" fill="#E53E3E" radius={[2, 2, 0, 0]} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="bg-dark-surface border border-white/10 p-2 rounded-lg text-[10px] shadow-xl">
                      <p className="font-bold text-brand-red">{payload[0].value} kg</p>
                      <p className="text-white/40">{payload[0].payload.date}</p>
                    </div>
                  ) : null
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-3 space-y-2 h-32">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Carga Máx (kg)</p>
          <Award size={12} className="text-blue-400" />
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <Line type="monotone" dataKey="maxWeight" stroke="#60A5FA" strokeWidth={2} dot={{ fill: '#60A5FA', r: 2 }} />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="bg-dark-surface border border-white/10 p-2 rounded-lg text-[10px] shadow-xl">
                      <p className="font-bold text-blue-400">{payload[0].value} kg</p>
                      <p className="text-white/40">{payload[0].payload.date}</p>
                    </div>
                  ) : null
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
