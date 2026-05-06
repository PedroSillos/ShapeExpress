import { Card } from '../../../presentation/components/Card';
import { cn } from '../../../utils/cn';
import { UserProfile } from '../../../domain/entities';

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (d: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

const LEVELS = [
  { id: 'Iniciante', label: 'Iniciante', desc: 'começando agora', color: 'bg-emerald-500' },
  { id: 'Intermediário', label: 'Intermediário', desc: '1–2 anos treinando', color: 'bg-yellow-500' },
  { id: 'Avançado', label: 'Avançado', desc: '3+ anos', color: 'bg-red-500' },
];

export function AthleteStep4({ formData, setFormData, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">‹</button>
        <h2 className="text-xl font-bold">Experiência de treino</h2>
      </div>
      <Card className="space-y-6 p-6">
        <p className="text-sm text-white/60 text-center">Qual seu nível de experiência?</p>
        <div className="space-y-3">
          {LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => setFormData({ ...formData, experienceLevel: level.id as any })}
              className={cn('w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left', formData.experienceLevel === level.id ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-white/5')}
            >
              <div className={cn('w-3 h-3 rounded-full', level.color)} />
              <div>
                <p className="text-sm font-bold">{level.label}</p>
                <p className="text-[10px] text-white/40">({level.desc})</p>
              </div>
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
