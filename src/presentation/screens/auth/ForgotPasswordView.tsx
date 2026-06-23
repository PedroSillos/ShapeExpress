import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../../firebase';
import { isValidEmail } from '../../../utils/validation';

interface ForgotPasswordViewProps {
  onBack: () => void;
  api: {
    forgotPassword: (email: string) => Promise<any>;
  };
}

export function ForgotPasswordView({ onBack, api }: ForgotPasswordViewProps) {
  const [mode, setMode] = useState<'email' | 'phone'>('email');

  // Email state
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Phone state
  const [phone, setPhone] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState('');
  const [phoneDone, setPhoneDone] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    return () => {
      recaptchaVerifier.current?.clear();
    };
  }, []);

  const getOrCreateRecaptcha = () => {
    if (recaptchaVerifier.current) return recaptchaVerifier.current;
    recaptchaVerifier.current = new RecaptchaVerifier(auth, recaptchaRef.current!, { size: 'invisible' });
    return recaptchaVerifier.current;
  };

  const handleEmailRecover = async () => {
    if (!isValidEmail(email)) { setError('Por favor, insira um email válido.'); return; }
    setLoading(true); setError('');
    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSend = async () => {
    const fullPhone = `+55${phone.replace(/\D/g, '')}`;
    if (fullPhone.length < 13) { setError('Por favor, insira um número válido.'); return; }
    setLoading(true); setError('');
    try {
      const verifier = getOrCreateRecaptcha();
      const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      recaptchaVerifier.current?.clear();
      recaptchaVerifier.current = null;
      setError('Erro ao enviar SMS. Verifique o número e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpConfirm = async () => {
    if (otp.length < 6) { setError('Insira o código de 6 dígitos.'); return; }
    setLoading(true); setError('');
    try {
      await confirmationResult!.confirm(otp);
      setPhoneDone(true);
    } catch {
      setError('Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'email' ? 'phone' : 'email');
    setError('');
    setPhone('');
    setOtp('');
    setConfirmationResult(null);
  };

  // Success states
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col px-4 pt-14 pb-8">
        <div className="relative flex items-center justify-center mb-10">
          <button onClick={onBack} className="absolute left-0 text-white/50 hover:text-white/70 transition-colors">
            <X size={22} />
          </button>
          <span className="text-white/50 font-bold text-lg">Recuperar Senha</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
          <h2 className="text-xl font-bold text-white">Email enviado!</h2>
          <p className="text-base text-white/40 leading-relaxed">
            Enviamos as instruções de recuperação para{' '}
            <span className="text-white font-medium">{email}</span>.
          </p>
          <button onClick={onBack} className="mt-4 w-full py-4 red-gradient rounded-2xl text-black font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 transition-transform">
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  if (phoneDone) {
    return (
      <div className="min-h-screen flex flex-col px-4 pt-14 pb-8">
        <div className="relative flex items-center justify-center mb-10">
          <button onClick={onBack} className="absolute left-0 text-white/50 hover:text-white/70 transition-colors">
            <X size={22} />
          </button>
          <span className="text-white/50 font-bold text-lg">Recuperar Senha</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
          <h2 className="text-xl font-bold text-white">Número verificado!</h2>
          <p className="text-base text-white/40 leading-relaxed">
            Seu número foi verificado com sucesso. Você já pode redefinir sua senha.
          </p>
          <button onClick={onBack} className="mt-4 w-full py-4 red-gradient rounded-2xl text-black font-bold text-sm uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 transition-transform">
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  const isPhoneStep2 = mode === 'phone' && confirmationResult !== null;
  const canSubmit = !loading && (
    mode === 'email' ? email.trim().length > 0 :
    isPhoneStep2 ? otp.length === 6 : phone.trim().length > 0
  );

  return (
    <div className="min-h-screen flex flex-col px-4 pt-14 pb-8">
      {/* Header */}
      <div className="relative flex items-center justify-center mb-10">
        <button onClick={onBack} className="absolute left-0 text-white/50 hover:text-white/70 transition-colors">
          <X size={22} />
        </button>
        <span className="text-white/50 font-bold text-lg">Esqueceu a senha?</span>
      </div>

      {/* Input */}
      <div className="border border-dark-border rounded-2xl overflow-hidden mb-4">
        {mode === 'email' ? (
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
            placeholder="E-mail"
            className="w-full bg-dark-card px-4 py-4 text-base text-white placeholder:text-white/30 focus:outline-none caret-brand-red"
          />
        ) : isPhoneStep2 ? (
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

      {error && (
        <p className="text-base text-brand-red leading-relaxed text-center mb-4">{error}</p>
      )}

      <p className="text-base text-white/40 leading-relaxed mt-6 text-center">
        {mode === 'email'
          ? 'Insira o seu e-mail e receba um link para redefini-la.'
          : isPhoneStep2
          ? 'Insira o código enviado por SMS para o seu número.'
          : 'Você receberá um SMS para verificar o seu número.'}
      </p>

      <div ref={recaptchaRef} />

      <div className="flex-1" />

      <div className="space-y-4">
        {!isPhoneStep2 && (
          <button
            onClick={switchMode}
            className="w-full text-center text-sm font-bold text-brand-red uppercase tracking-widest py-2"
          >
            {mode === 'email' ? 'Usar número de telefone' : 'Usar e-mail'}
          </button>
        )}

        <button
          onClick={mode === 'email' ? handleEmailRecover : isPhoneStep2 ? handleOtpConfirm : handlePhoneSend}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95 ${
            canSubmit
              ? 'red-gradient text-black shadow-lg shadow-brand-red/20'
              : 'bg-dark-card text-white/30 cursor-not-allowed'
          }`}
        >
          {loading ? 'Processando...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}
