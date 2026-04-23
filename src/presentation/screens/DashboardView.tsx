import React from 'react';
import { Flame, TrendingUp, Clock, Award, ChevronRight, Play, Sparkles, User, Scale, Target, Zap, Heart, Trophy } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { WorkoutSession, WorkoutTemplate, UserTrainingProfile, ExerciseUserStats, UserCalorieProfile, BodyAssessment, UserProfile } from '../../domain/entities';

interface DashboardViewProps {
  user: UserProfile;
  trainingProfile: UserTrainingProfile;
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  onStartWorkout: (t: WorkoutTemplate) => void;
  onViewEvolution: () => void;
  onViewAchievements: () => void;
}

export function DashboardView({ user, trainingProfile, sessions, templates, onStartWorkout, onViewEvolution, onViewAchievements, trainers = [] }: DashboardViewProps & { trainers?: UserProfile[] }) {
  const lastSession = sessions[0];
  const weeklyWorkouts = sessions.filter(s => {
    const d = new Date(s.date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Olá, {user.name.split(' ')[0]}!</h2>
          <p className="text-xs text-white/40">Pronto para o treino de hoje?</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User size={24} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Treinos na Semana</p>
            <p className="text-2xl font-bold">{weeklyWorkouts}</p>
          </div>
        </Card>
        <Card className="p-6 space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Volume Total</p>
            <p className="text-2xl font-bold">{lastSession?.totalVolume || 0}kg</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Treinos Sugeridos</h3>
          <button className="text-[10px] text-brand-red font-bold uppercase tracking-widest flex items-center gap-1">
            Ver Todos <ChevronRight size={10} />
          </button>
        </div>
        <div className="space-y-3">
          {templates.slice(0, 2).map((template) => {
            const trainer = template.creatorEmail && template.creatorEmail !== user.email 
              ? trainers.find(t => t.email === template.creatorEmail)
              : null;
            
            return (
              <Card key={template.id} className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-red transition-colors">
                    <Play size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{template.name}</h4>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                      {template.category === 'multicycle' ? `${template.cycles?.length || 0} Ciclos` : `${template.sheets?.length || 0} Vezes por Semana`}
                    </p>
                    {trainer && (
                      <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider mt-0.5">
                        Por {trainer.name}
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => onStartWorkout(template)}
                  className="p-2 bg-brand-red text-black rounded-lg shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
                >
                  <Play size={14} fill="currentColor" />
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Acesso Rápido</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onViewEvolution} className="w-full text-left">
            <Card className="p-4 flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-red transition-colors">
                <Scale size={16} />
              </div>
              <span className="text-xs font-bold">Evolução</span>
            </Card>
          </button>
          <button onClick={onViewAchievements} className="w-full text-left">
            <Card className="p-4 flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-red transition-colors">
                <Trophy size={16} />
              </div>
              <span className="text-xs font-bold">Conquistas</span>
            </Card>
          </button>
        </div>
      </div>
    </div>
  );
}
