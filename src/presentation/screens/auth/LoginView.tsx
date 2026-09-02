import React, { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';
import iconGoogle from '@/src/assets/icons/icon-google.svg';

interface LoginViewProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onBack: () => void;
  api: any;
}

export function LoginView({ onLogin, onForgotPassword, onBack, api }: LoginViewProps) {
  const [mode, setMode] = useState<'email' | 'phone'>('email');

  // Email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setError(''); }, [mode]);

  const handleEmailLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true); setError('');
    try { await onLogin(email, password); }
    catch (err: any) { setError(err.message || 'Erro ao fazer login.'); }
    finally { setLoading(false); }
  };

  const handlePhoneSend = async () => {
    const fullPhone = `+55${phone.replace(/\D/g, '')}`;
    if (fullPhone.length < 13) { setError('Número inválido.'); return; }
    setLoading(true); setError('');
    try {
      const result = await api.loginWithPhone(fullPhone, recaptchaRef.current!);
      setConfirmationResult(result);
    } catch (err: any) { setError(err.message || 'Erro ao enviar SMS.'); }
    finally { setLoading(false); }
  };

  const handleOtpConfirm = async () => {
    if (otp.length < 6) { setError('Insira o código de 6 dígitos.'); return; }
    setLoading(true); setError('');
    try { await api.confirmPhoneLogin(confirmationResult!, otp); }
    catch (err: any) { setError(err.message || 'Código inválido.'); }
    finally { setLoading(false); }
  };

  const switchMode = () => {
    setMode(m => m === 'email' ? 'phone' : 'email');
    setPhone(''); setOtp(''); setConfirmationResult(null);
  };

  const isPhoneOtp = mode === 'phone' && confirmationResult !== null;

  const canSubmit = !loading && (
    mode === 'email' ? email.trim().length > 0 && password.trim().length > 0
    : isPhoneOtp ? otp.length === 6
    : phone.trim().length > 0
  );

  return (
    <div className="min-h-screen flex flex-col px-4 pt-14 pb-8">
      {/* Header */}
      <div className="relative flex items-center justify-center mb-10">
        <button onClick={onBack} className="absolute left-0 text-white/50 hover:text-white/70 transition-colors">
          <X size={22} />
        </button>
        <span className="text-white/50 font-bold text-lg">Insira os seus dados</span>
      </div>

      {/* Fields */}
      <form onSubmit={mode === 'email' ? handleEmailLogin : e => e.preventDefault()} className="space-y-0 mb-4">
        <div className="border border-dark-border rounded-2xl overflow-hidden">
          {mode === 'email' ? (
            <>
              <input
                type="text"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                placeholder="E-mail, telefone ou nome de usuário"
                className="w-full bg-dark-card px-4 py-4 text-base text-white placeholder:text-white/30 focus:outline-none border-b border-dark-border caret-brand-red"
              />
              <div className="relative bg-dark-card">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  placeholder="Senha"
                  className="w-full bg-transparent px-4 py-4 text-base text-white placeholder:text-white/30 focus:outline-none pr-12 caret-brand-red"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-red transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          ) : isPhoneOtp ? (
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); if (error) setError(''); }}
              placeholder="Código de 6 dígitos"
              className="w-full bg-dark-card px-4 py-4 text-base text-white placeholder:text-white/30 focus:outline-none caret-brand-red text-center tracking-[0.5em]"
            />
          ) : (
            <div className="flex bg-dark-card">
              <span className="flex items-center px-4 text-white/50 text-base border-r border-dark-border select-none">+55</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); if (error) setError(''); }}
                placeholder="Telefone"
                className="flex-1 bg-transparent px-4 py-4 text-base text-white placeholder:text-white/30 focus:outline-none caret-brand-red"
              />
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}

        <button
          type={mode === 'email' ? 'submit' : 'button'}
          onClick={mode === 'phone' ? (isPhoneOtp ? handleOtpConfirm : handlePhoneSend) : undefined}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest mt-4 transition-all active:scale-95 ${
            canSubmit
              ? 'red-gradient text-black shadow-lg shadow-brand-red/20'
              : 'bg-dark-card text-white/30 cursor-not-allowed'
          }`}
        >
          {loading ? 'Processando...' : 'Entrar'}
        </button>
      </form>

      {mode === 'email' && (
        <div className="text-center mt-4">
          <button onClick={onForgotPassword} className="text-sm font-bold text-brand-red uppercase tracking-widest">
            Esqueci a Senha
          </button>
        </div>
      )}

      <div ref={recaptchaRef} />
      <div className="flex-1" />

      <div className="space-y-4">
        {mode === 'email' && (
          <button
            onClick={async () => {
              setLoading(true); setError('');
              try { await api.loginWithGoogle('login'); }
              catch (e: any) { setError(e.message || 'Erro ao entrar com Google.'); }
              finally { setLoading(false); }
            }}
            disabled={loading}
            className="w-full py-4 bg-dark-card border border-dark-border rounded-2xl font-bold text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <GoogleIcon />
            <span className="text-white uppercase tracking-widest">Google</span>
          </button>
        )}

        <p className="text-center text-xs text-white/30 leading-relaxed">
          Ao entrar no Shape Express, você concorda com os nossos{' '}
          <a href="/terms" className="text-white/60 font-semibold">Termos</a>
          {' '}e{' '}
          <a href="/privacy" className="text-white/60 font-semibold">Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return <img src={iconGoogle} width="18" height="18" />;
}
