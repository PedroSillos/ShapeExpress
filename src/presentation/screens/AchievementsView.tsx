import React from 'react';
import { Trophy, ChevronLeft, CheckCircle2, Lock } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { cn } from '../../utils/cn';

interface AchievementsViewProps {
  onBack: () => void;
}

export function AchievementsView({ onBack }: AchievementsViewProps) {
  const achievements = [
    { id: '1', title: 'Primeiro Passo', description: 'Completou seu primeiro treino.', icon: <Trophy size={24} />, unlocked: true, date: '2024-03-01' },
    { id: '2', title: 'Consistência', description: 'Treinou 3 dias seguidos.', icon: <Trophy size={24} />, unlocked: true, date: '2024-03-04' },
    { id: '3', title: 'Volume Monstro', description: 'Atingiu 10.000kg de volume total.', icon: <Trophy size={24} />, unlocked: true, date: '2024-03-10' },
    { id: '4', title: 'Madrugador', description: 'Treinou antes das 7h da manhã.', icon: <Trophy size={24} />, unlocked: false },
    { id: '5', title: 'Guerreiro', description: 'Completou 50 treinos no total.', icon: <Trophy size={24} />, unlocked: false },
    { id: '6', title: 'Mestre da Dieta', description: 'Registrou 30 dias de macros.', icon: <Trophy size={24} />, unlocked: false }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Conquistas</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className={cn(
            "p-6 text-center space-y-4 relative overflow-hidden",
            !achievement.unlocked && "opacity-40 grayscale"
          )}>
            {!achievement.unlocked && (
              <div className="absolute top-2 right-2 text-white/20">
                <Lock size={14} />
              </div>
            )}
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
              achievement.unlocked ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" : "bg-white/5 text-white/20"
            )}>
              {achievement.icon}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold">{achievement.title}</h4>
              <p className="text-[10px] text-white/40 leading-tight">{achievement.description}</p>
            </div>
            {achievement.unlocked && achievement.date && (
              <Badge variant="outline" className="text-[8px] border-brand-red/20 text-brand-red">
                <CheckCircle2 size={8} className="mr-1" />
                {new Date(achievement.date).toLocaleDateString('pt-BR')}
              </Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
