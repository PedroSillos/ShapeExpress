import { Home, Building2 } from 'lucide-react';
import { Card } from '../../../presentation/components/Card';
import { cn } from '../../../utils/cn';
import { UserProfile } from '../../../domain/entities';

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (d: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AthleteStep7({ formData, setFormData, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">‹</button>
        <h2 className="text-xl font-bold">Tipo de Treino</h2>
      </div>
      <Card className="space-y-6 p-6">
        <p className="text-sm text-white/60 text-center">Onde você treina?</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setFormData({ ...formData, trainingLocation: 'Casa' })}
            className={cn('py-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all', formData.trainingLocation === 'Casa' ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-white/5')}
          >
            <Home size={32} className={formData.trainingLocation === 'Casa' ? 'text-brand-red' : 'text-white/20'} />
            <span className={cn('text-xs font-bold', formData.trainingLocation === 'Casa' ? 'text-white' : 'text-white/40')}>Em casa</span>
          </button>
          <button
            onClick={() => setFormData({ ...formData, trainingLocation: 'Academia' })}
            className={cn('py-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all', formData.trainingLocation === 'Academia' ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-white/5')}
          >
            <Building2 size={32} className={formData.trainingLocation === 'Academia' ? 'text-brand-red' : 'text-white/20'} />
            <span className={cn('text-xs font-bold', formData.trainingLocation === 'Academia' ? 'text-white' : 'text-white/40')}>Academia</span>
          </button>
        </div>
        <button onClick={onNext} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
          Avançar
        </button>
      </Card>
    </div>
  );
}
