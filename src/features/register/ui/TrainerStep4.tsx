import { Camera, Instagram, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '../../../presentation/components/Card';
import { InputGroup } from '../../../presentation/components/InputGroup';
import { ImageUpload } from '../../../presentation/components/ImageUpload';
import { SportAvatarSelector } from './SportAvatarSelector';
import { UserProfile } from '../../../domain/entities';

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (d: Partial<UserProfile>) => void;
  fieldErrors: Record<string, string>;
  clearFieldError: (f: string) => void;
  isLoading: boolean;
  onFinalize: () => void;
  onBack: () => void;
  api: any;
}

export function TrainerStep4({ formData, setFormData, fieldErrors, clearFieldError, isLoading, onFinalize, onBack, api }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">‹</button>
        <h2 className="text-xl font-bold">Perfil profissional</h2>
      </div>
      <Card className="space-y-6 p-6">
        <div className="flex flex-col items-center gap-4">
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

        <div className="space-y-1.5">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Mini bio</label>
          <textarea
            value={formData.bio || ''}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Ex: Personal trainer focado em hipertrofia e emagrecimento"
            className="w-full bg-dark-surface border border-dark-border rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-gray-400 transition-colors h-24 resize-none"
          />
        </div>

        <InputGroup
          label="Instagram (opcional)"
          value={formData.instagram || ''}
          onChange={(v) => setFormData({ ...formData, instagram: v })}
          icon={<Instagram size={18} />}
          placeholder="@seuusuario"
        />

        <InputGroup
          id="field-birthDate"
          error={fieldErrors.birthDate}
          label="Data de nascimento"
          value={formData.birthDate || ''}
          onChange={(v) => { setFormData({ ...formData, birthDate: v }); clearFieldError('birthDate'); }}
          icon={<CalendarIcon size={18} />}
          type="date"
        />

        <button
          onClick={onFinalize}
          disabled={isLoading}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />}
          Criar Conta
        </button>
      </Card>
    </div>
  );
}
