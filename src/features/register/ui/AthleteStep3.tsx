import { Dumbbell, Flame, Zap, Heart, Trophy } from 'lucide-react';
import { Card } from '../../../presentation/components/Card';
import { cn } from '../../../utils/cn';
import { UserProfile } from '../../../domain/entities';

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (d: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

const OBJECTIVES = [
  { id: 'Ganhar massa muscular', label: 'Ganhar massa muscular', icon: <Dumbbell className="text-brand-red" /> },
  { id: 'Emagrecer', label: 'Emagrecer', icon: <Flame className="text-orange-500" /> },
  { id: 'Melhorar condicionamento', label: 'Melhorar condicionamento', icon: <Zap className="text-yellow-400" /> },
  { id: 'Saúde e mobilidade', label: 'Saúde e mobilidade', icon: <Heart className="text-emerald-400" /> },
  { id: 'Força', label: 'Força', icon: <Trophy className="text-blue-400" /> },
];

export function AthleteStep3({ formData, setFormData, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">‹</button>
        <h2 className="text-xl font-bold">Objetivo de treino</h2>
      </div>
      <Card className="space-y-4 p-6">
        <p className="text-sm text-white/60 text-center mb-2">Qual é seu objetivo principal?</p>
        <div className="grid grid-cols-1 gap-3">
          {OBJECTIVES.map(obj => (
            <button
              key={obj.id}
              onClick={() => setFormData({ ...formData, objective: obj.id })}
              className={cn('w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left', formData.objective === obj.id ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-white/5')}
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{obj.icon}</div>
              <span className={cn('text-sm font-bold', formData.objective === obj.id ? 'text-white' : 'text-white/60')}>{obj.label}</span>
            </button>
          ))}
        </div>
        <button onClick={onNext} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
          Avançar
        </button>
      </Card>
    </div>
  );
}
