import { Check } from 'lucide-react';
import { Card } from '../../../presentation/components/Card';
import { cn } from '../../../utils/cn';
import { UserProfile } from '../../../domain/entities';

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (d: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FREQUENCIES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function AthleteStep5({ formData, setFormData, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">‹</button>
        <h2 className="text-xl font-bold">Frequência de treino</h2>
      </div>
      <Card className="space-y-6 p-6">
        <p className="text-sm text-white/60 text-center">Quantas vezes por semana você pretende treinar?</p>
        <div className="grid grid-cols-2 gap-3">
          {FREQUENCIES.map(days => (
            <button
              key={days}
              onClick={() => setFormData({ ...formData, trainingFrequency: days })}
              className={cn('w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all', formData.trainingFrequency === days ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-white/5')}
            >
              <span className={cn('text-sm font-bold', formData.trainingFrequency === days ? 'text-white' : 'text-white/60')}>{days} vezes por semana</span>
              {formData.trainingFrequency === days && <Check size={18} className="text-brand-red" />}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-white/40 text-center">Isso ajuda o app a sugerir a melhor divisão de treino (ABC, ABCD, etc).</p>
        <button onClick={onNext} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
          Avançar
        </button>
      </Card>
    </div>
  );
}
