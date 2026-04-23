import React from 'react';
import { CalendarIcon, TrendingUp, Clock, Flame, ChevronLeft, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { WorkoutSession } from '../../domain/entities';

interface WorkoutSessionViewProps {
  sessions: WorkoutSession[];
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function WorkoutSessionView({ sessions, onDelete, onBack }: WorkoutSessionViewProps) {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Histórico de Treinos</h2>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
              <CalendarIcon size={32} />
            </div>
            <p className="text-sm text-white/40">Nenhum treino realizado ainda.</p>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="p-6 space-y-4 relative group">
              <button 
                onClick={() => onDelete(session.id)}
                className="absolute top-4 right-4 p-2 text-white/20 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{session.workoutName}</h3>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{new Date(session.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-brand-red/20 text-brand-red">Concluído</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Duração</p>
                  <div className="flex items-center justify-center gap-1">
                    <Clock size={12} className="text-brand-red" />
                    <p className="text-sm font-bold">{Math.floor(session.duration / 60)}m</p>
                  </div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Volume</p>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp size={12} className="text-brand-red" />
                    <p className="text-sm font-bold">{session.totalVolume}kg</p>
                  </div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Calorias</p>
                  <div className="flex items-center justify-center gap-1">
                    <Flame size={12} className="text-brand-red" />
                    <p className="text-sm font-bold">{session.caloriesBurned || 0}kcal</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
