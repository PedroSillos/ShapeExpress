import React from 'react';
import { TrendingUp, Flame, Clock, Award } from 'lucide-react';
import { Card } from '../components/Card';
import { WorkoutSession, UserCalorieProfile } from '../../domain/entities';

interface StatsCardsProps {
  sessions: WorkoutSession[];
  calorieProfile: UserCalorieProfile;
}

export function StatsCards({ sessions, calorieProfile }: StatsCardsProps) {
  const totalVolume = sessions.reduce((acc, s) => acc + (s.totalVolume || 0), 0);
  const totalCalories = sessions.reduce((acc, s) => acc + (s.caloriesBurned || 0), 0);
  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-6 space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
        <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
          <TrendingUp size={20} />
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Volume Total</p>
          <p className="text-2xl font-bold">{totalVolume.toLocaleString()}kg</p>
        </div>
      </Card>
      <Card className="p-6 space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
        <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
          <Flame size={20} />
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Calorias Totais</p>
          <p className="text-2xl font-bold">{totalCalories.toLocaleString()}kcal</p>
        </div>
      </Card>
      <Card className="p-6 space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
        <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
          <Clock size={20} />
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Tempo Total</p>
          <p className="text-2xl font-bold">{Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m</p>
        </div>
      </Card>
      <Card className="p-6 space-y-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
        <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
          <Award size={20} />
        </div>
        <div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Treinos</p>
          <p className="text-2xl font-bold">{sessions.length}</p>
        </div>
      </Card>
    </div>
  );
}
