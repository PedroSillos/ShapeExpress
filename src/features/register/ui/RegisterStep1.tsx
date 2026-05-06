import { User, Mail, Lock, Smartphone, GraduationCap, Dumbbell, Eye, EyeOff, Check, X } from 'lucide-react';
import { Card } from '../../../presentation/components/Card';
import { InputGroup } from '../../../presentation/components/InputGroup';
import { cn } from '../../../utils/cn';
import { UserProfile } from '../../../domain/entities';

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (d: Partial<UserProfile>) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  userType: 'treinador' | 'atleta' | null;
  setUserType: (t: 'treinador' | 'atleta') => void;
  error: string;
  fieldErrors: Record<string, string>;
  clearFieldError: (f: string) => void;
  showPasswordRules: boolean;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
  api: any;
}

export function RegisterStep1({
  formData, setFormData,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  showPassword, setShowPassword,
  userType, setUserType,
  error, fieldErrors, clearFieldError,
  showPasswordRules, hasMinLength, hasNumber, hasUpperCase, hasLowerCase,
  isLoading, onNext, onBack, api,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Identificação básica</h2>
        <p className="text-sm text-white/40">Crie sua conta rapidamente para começar.</p>
      </div>

      <Card className="space-y-4 p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-xs text-center font-bold">
            {error}
          </div>
        )}

        <InputGroup
          id="field-name"
          error={fieldErrors.name}
          label="Nome completo"
          value={formData.name || ''}
          onChange={(v) => { setFormData({ ...formData, name: v }); clearFieldError('name'); }}
          icon={<User size={18} />}
        />
        <InputGroup
          id="field-email"
          error={fieldErrors.email}
          label="Email"
          value={formData.email || ''}
          onChange={(v) => { setFormData({ ...formData, email: v }); clearFieldError('email'); }}
          icon={<Mail size={18} />}
          type="email"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5" id="field-password">
            <label className={cn('text-[10px] font-bold uppercase tracking-widest px-2', fieldErrors.password ? 'text-red-500' : 'text-white/40')}>
              Senha
            </label>
            <div className="relative">
              <Lock className={cn('absolute left-4 top-1/2 -translate-y-1/2', fieldErrors.password ? 'text-red-500/50' : 'text-white/20')} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                placeholder="••••••••"
                className={cn(
                  'w-full bg-dark-surface border rounded-xl py-3 pl-10 pr-10 text-xs font-medium focus:outline-none transition-colors',
                  fieldErrors.password ? 'border-red-500 focus:border-gray-400' : 'border-dark-border focus:border-gray-400',
                )}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs text-red-500 px-2 mt-1">{fieldErrors.password}</p>}
          </div>

          <div className="space-y-1.5" id="field-confirmPassword">
            <label className={cn('text-[10px] font-bold uppercase tracking-widest px-2', fieldErrors.confirmPassword ? 'text-red-500' : 'text-white/40')}>
              Confirmar
            </label>
            <div className="relative">
              <Lock className={cn('absolute left-4 top-1/2 -translate-y-1/2', fieldErrors.confirmPassword ? 'text-red-500/50' : 'text-white/20')} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                placeholder="••••••••"
                className={cn(
                  'w-full bg-dark-surface border rounded-xl py-3 pl-10 pr-10 text-xs font-medium focus:outline-none transition-colors',
                  fieldErrors.confirmPassword ? 'border-red-500 focus:border-gray-400' : 'border-dark-border focus:border-gray-400',
                )}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="text-xs text-red-500 px-2 mt-1">{fieldErrors.confirmPassword}</p>}
          </div>
        </div>

        {showPasswordRules && (
          <div className="px-2 text-[10px] space-y-1 -mt-2">
            <p className={hasMinLength ? 'text-emerald-500' : 'text-red-500'}>{hasMinLength ? <Check size={10} className="inline mr-1" /> : <X size={10} className="inline mr-1" />}Mínimo de 8 caracteres</p>
            <p className={hasUpperCase ? 'text-emerald-500' : 'text-red-500'}>{hasUpperCase ? <Check size={10} className="inline mr-1" /> : <X size={10} className="inline mr-1" />}1 letra maiúscula</p>
            <p className={hasLowerCase ? 'text-emerald-500' : 'text-red-500'}>{hasLowerCase ? <Check size={10} className="inline mr-1" /> : <X size={10} className="inline mr-1" />}1 letra minúscula</p>
            <p className={hasNumber ? 'text-emerald-500' : 'text-red-500'}>{hasNumber ? <Check size={10} className="inline mr-1" /> : <X size={10} className="inline mr-1" />}1 número</p>
          </div>
        )}

        <InputGroup
          id="field-phone"
          error={fieldErrors.phone}
          label="Telefone / WhatsApp"
          value={formData.phone || ''}
          onChange={(v) => { const n = v.replace(/\D/g, ''); setFormData({ ...formData, phone: n }); clearFieldError('phone'); }}
          icon={<Smartphone size={18} />}
          placeholder="(00) 00000-0000"
          type="tel"
        />

        <div className="pt-2">
          <button
            onClick={async () => { try { await api.loginWithGoogle(); } catch (_) {} }}
            className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Entrar com Google
          </button>
        </div>

        <div className="space-y-2 pt-2" id="field-userType">
          <label className={cn('text-[10px] font-bold uppercase tracking-widest px-2 block text-center', fieldErrors.userType ? 'text-red-500' : 'text-white/40')}>
            Eu sou:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setUserType('treinador'); clearFieldError('userType'); }}
              className={cn('py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all', userType === 'treinador' ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-white/5', fieldErrors.userType && !userType ? 'border-red-500' : '')}
            >
              <GraduationCap size={24} className={userType === 'treinador' ? 'text-brand-red' : 'text-white/40'} />
              <span className={cn('text-xs font-bold', userType === 'treinador' ? 'text-white' : 'text-white/40')}>Treinador</span>
            </button>
            <button
              onClick={() => { setUserType('atleta'); clearFieldError('userType'); }}
              className={cn('py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all', userType === 'atleta' ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-white/5', fieldErrors.userType && !userType ? 'border-red-500' : '')}
            >
              <Dumbbell size={24} className={userType === 'atleta' ? 'text-brand-red' : 'text-white/40'} />
              <span className={cn('text-xs font-bold', userType === 'atleta' ? 'text-white' : 'text-white/40')}>Atleta</span>
            </button>
          </div>
          {fieldErrors.userType && <p className="text-xs text-red-500 text-center mt-1">{fieldErrors.userType}</p>}
        </div>

        <button
          onClick={onNext}
          disabled={isLoading}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /><span>Verificando...</span></>
          ) : 'Avançar'}
        </button>

        <p className="text-center text-xs text-white/40">
          Já tem conta? <button onClick={onBack} className="text-brand-red font-bold">Entrar</button>
        </p>
      </Card>
    </div>
  );
}
