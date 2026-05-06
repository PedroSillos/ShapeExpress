import { Briefcase } from 'lucide-react';
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

const EXPERIENCE_OPTIONS = ['0–1 ano', '1–3 anos', '3–5 anos', '5+ anos'];
const SPECIALTIES = ['Hipertrofia', 'Emagrecimento', 'Reabilitação', 'Treino funcional', 'Treino feminino', 'Treino para atletas', 'Treino em casa'];
const SERVICE_TYPES = ['Presencial', 'Online', 'Ambos'];

export function TrainerStep2({ formData, setFormData, fieldErrors, clearFieldError, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">‹</button>
        <h2 className="text-xl font-bold">Informações profissionais</h2>
      </div>
      <Card className="space-y-6 p-6">
        <InputGroup
          id="field-cref"
          error={fieldErrors.cref}
          label="CREF (Registro Profissional)"
          value={formData.cref || ''}
          onChange={(v) => { setFormData({ ...formData, cref: v }); clearFieldError('cref'); }}
          icon={<Briefcase size={18} />}
        />

        <div className="space-y-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Tempo de experiência</label>
          <div className="grid grid-cols-2 gap-2">
            {EXPERIENCE_OPTIONS.map(exp => (
              <button
                key={exp}
                onClick={() => setFormData({ ...formData, experienceYears: exp })}
                className={cn('py-2.5 rounded-xl text-[10px] font-bold border transition-all', formData.experienceYears === exp ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'border-dark-border bg-white/5 text-white/40')}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Especialidades</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(spec => (
              <button
                key={spec}
                onClick={() => {
                  const specs = formData.specialties || [];
                  setFormData({ ...formData, specialties: specs.includes(spec) ? specs.filter(s => s !== spec) : [...specs, spec] });
                }}
                className={cn('px-3 py-2 rounded-full text-[10px] font-bold border transition-all', formData.specialties?.includes(spec) ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'border-dark-border bg-white/5 text-white/40')}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Tipo de atendimento</label>
          <div className="grid grid-cols-3 gap-2">
            {SERVICE_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setFormData({ ...formData, serviceType: type as any })}
                className={cn('py-2.5 rounded-xl text-[10px] font-bold border transition-all', formData.serviceType === type ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'border-dark-border bg-white/5 text-white/40')}
              >
                {type}
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
