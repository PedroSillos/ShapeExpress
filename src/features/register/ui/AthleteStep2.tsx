import { Lock, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../../presentation/components/Card';
import { InputGroup } from '../../../presentation/components/InputGroup';
import { cn } from '../../../utils/cn';
import { UserProfile } from '../../../domain/entities';

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (d: Partial<UserProfile>) => void;
  error: string;
  fieldErrors: Record<string, string>;
  clearFieldError: (f: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AthleteStep2({ formData, setFormData, error, fieldErrors, clearFieldError, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">‹</button>
        <h2 className="text-xl font-bold">Conectar com o personal</h2>
      </div>
      <Card className="space-y-6 p-6">
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-xs text-center font-bold">{error}</div>}
        <div className="space-y-4" id="field-hasPersonal">
          <p className={cn('text-sm text-center', fieldErrors.hasPersonal ? 'text-red-500 font-bold' : 'text-white/60')}>
            Você treina com um personal?
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setFormData({ ...formData, hasPersonal: true })}
              className={cn('w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left', formData.hasPersonal ? 'border-emerald-500 bg-emerald-500/10' : 'border-dark-border bg-white/5', fieldErrors.hasPersonal ? 'border-red-500' : '')}
            >
              <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center', formData.hasPersonal ? 'border-emerald-500' : 'border-white/20')}>
                {formData.hasPersonal && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              <div>
                <p className="text-sm font-bold">Sim, tenho um personal</p>
                <p className="text-[10px] text-white/40">Conecte-se para receber treinos exclusivos.</p>
              </div>
            </button>

            {formData.hasPersonal && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pl-8">
                <InputGroup
                  id="field-personalCodeConnected"
                  error={fieldErrors.personalCodeConnected}
                  label="Código do personal"
                  value={formData.personalCodeConnected || ''}
                  onChange={(v) => { setFormData({ ...formData, personalCodeConnected: v }); clearFieldError('personalCodeConnected'); }}
                  icon={<Lock size={18} />}
                  placeholder="Ex: ABC123"
                />
                <button className="w-full py-3 bg-white/5 border border-dark-border rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <QrCode size={18} />Escanear QR Code
                </button>
              </motion.div>
            )}

            <button
              onClick={() => setFormData({ ...formData, hasPersonal: false })}
              className={cn('w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left', formData.hasPersonal === false ? 'border-white/40 bg-white/5' : 'border-dark-border bg-white/5', fieldErrors.hasPersonal ? 'border-red-500' : '')}
            >
              <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center', formData.hasPersonal === false ? 'border-white/40' : 'border-white/20')}>
                {formData.hasPersonal === false && <div className="w-2 h-2 rounded-full bg-white/40" />}
              </div>
              <div>
                <p className="text-sm font-bold">Não, treino sozinho</p>
                <p className="text-[10px] text-white/40">O app irá sugerir treinos para você.</p>
              </div>
            </button>
          </div>
        </div>
        <button onClick={onNext} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
          Avançar
        </button>
      </Card>
    </div>
  );
}
