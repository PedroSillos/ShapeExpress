import { Camera, Ruler, Scale, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '../../../presentation/components/Card';
import { InputGroup } from '../../../presentation/components/InputGroup';
import { ImageUpload } from '../../../presentation/components/ImageUpload';
import { SportAvatarSelector } from './SportAvatarSelector';
import { cn } from '../../../utils/cn';
import { isValidDate } from '../../../utils/validation';
import { UserProfile } from '../../../domain/entities';

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (d: Partial<UserProfile>) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  clearFieldError: (f: string) => void;
  onNext: () => void;
  onBack: () => void;
  api: any;
}

export function AthleteStep6({ formData, setFormData, fieldErrors, setFieldErrors, clearFieldError, onNext, onBack, api }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">‹</button>
        <h2 className="text-xl font-bold">Dados físicos (opcional)</h2>
      </div>
      <Card className="space-y-6 p-6">
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-brand-red p-1 overflow-hidden">
              <img src={formData.avatarUrl} alt="Preview" className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0">
              <ImageUpload
                onUploadComplete={(url) => setFormData({ ...formData, avatarUrl: url })}
                uploadImage={api.uploadImage}
                variant="button"
                className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-black border-2 border-dark-card cursor-pointer"
                label={<Camera size={16} />}
              />
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Foto de perfil</p>
        </div>

        <SportAvatarSelector
          currentAvatarUrl={formData.avatarUrl || ''}
          onSelect={(url) => setFormData({ ...formData, avatarUrl: url })}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Altura (cm)" value={formData.height?.toString() || ''} onChange={(v) => setFormData({ ...formData, height: Number(v) })} icon={<Ruler size={18} />} type="number" />
          <InputGroup label="Peso (kg)" value={formData.initialWeight?.toString() || ''} onChange={(v) => setFormData({ ...formData, initialWeight: Number(v) })} icon={<Scale size={18} />} type="number" />
        </div>

        <InputGroup
          id="field-birthDate"
          error={fieldErrors.birthDate}
          label="Data de nascimento"
          value={formData.birthDate || ''}
          onChange={(v) => { setFormData({ ...formData, birthDate: v }); clearFieldError('birthDate'); }}
          onBlur={() => {
            if (formData.birthDate && !isValidDate(formData.birthDate)) {
              setFieldErrors(prev => ({ ...prev, birthDate: 'Data de nascimento inválida' }));
              setFormData({ ...formData, birthDate: '' });
            }
          }}
          icon={<CalendarIcon size={18} />}
          type="date"
        />

        <p className="text-[10px] text-white/40 text-center">Isso ajuda a estimar calorias e progresso.</p>

        <button onClick={onNext} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
          Avançar
        </button>
      </Card>
    </div>
  );
}
