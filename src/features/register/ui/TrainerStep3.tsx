import { Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../../presentation/components/Card';
import { InputGroup } from '../../../presentation/components/InputGroup';
import { cn } from '../../../utils/cn';
import { UserProfile } from '../../../domain/entities';

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (d: Partial<UserProfile>) => void;
  fieldErrors: Record<string, string>;
  clearFieldError: (f: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const STUDENT_COUNTS = ['1–10', '10–30', '30–60', '60+'];

export function TrainerStep3({ formData, setFormData, fieldErrors, clearFieldError, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">‹</button>
        <h2 className="text-xl font-bold">Estrutura de trabalho</h2>
      </div>
      <Card className="space-y-6 p-6">
        <div className="space-y-3">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Você trabalha em academia?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormData({ ...formData, worksInGym: true })}
              className={cn('py-3 rounded-xl border transition-all font-bold text-xs', formData.worksInGym ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'border-dark-border bg-white/5 text-white/40')}
            >
              Sim
            </button>
            <button
              onClick={() => setFormData({ ...formData, worksInGym: false })}
              className={cn('py-3 rounded-xl border transition-all font-bold text-xs', formData.worksInGym === false ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'border-dark-border bg-white/5 text-white/40')}
            >
              Não
            </button>
          </div>
        </div>

        {formData.worksInGym && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <InputGroup
              id="field-gymName"
              error={fieldErrors.gymName}
              label="Nome da academia"
              value={formData.gymName || ''}
              onChange={(v) => { setFormData({ ...formData, gymName: v }); clearFieldError('gymName'); }}
              icon={<Building2 size={18} />}
            />
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Quantos alunos você atende hoje?</label>
          <div className="grid grid-cols-2 gap-2">
            {STUDENT_COUNTS.map(count => (
              <button
                key={count}
                onClick={() => setFormData({ ...formData, studentsCount: count })}
                className={cn('py-2.5 rounded-xl text-[10px] font-bold border transition-all', formData.studentsCount === count ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'border-dark-border bg-white/5 text-white/40')}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <button onClick={onNext} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
          Avançar
        </button>
      </Card>
    </div>
  );
}
