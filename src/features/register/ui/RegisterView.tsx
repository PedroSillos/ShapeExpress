import { useState } from 'react';
import React from 'react';
import { ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../../utils/cn';
import { UserProfile } from '../../../domain/entities';
import { isValidEmail } from '../../../utils/validation';

// ─── Google icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'method' | 'email' | 'password' | 'name' | 'phone' | 'phone-otp';

const STEPS: Step[] = ['method', 'email', 'password', 'name'];
const TOTAL = STEPS.length;

interface RegisterViewProps {
  onRegister: (p: UserProfile) => void;
  onBack: () => void;
  onGoToLogin?: () => void;
  api: any;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function RegisterView({ onRegister, onBack, onGoToLogin, api }: RegisterViewProps) {
  const [step, setStep] = useState<Step>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [emailDuplicate, setEmailDuplicate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaRef = React.useRef<HTMLDivElement>(null);

  const EMAIL_STEPS: Step[] = ['method', 'email', 'password', 'name'];
  const PHONE_STEPS: Step[] = ['method', 'phone', 'phone-otp', 'name'];
  const currentSteps = ['phone', 'phone-otp'].includes(step) ? PHONE_STEPS : EMAIL_STEPS;
  const stepIndex = currentSteps.indexOf(step);
  const progress = (stepIndex + 1) / 4;

  const goBack = () => {
    if (step === 'method') { onBack(); return; }
    setError('');
    setEmailDuplicate(false);
    setStep(currentSteps[stepIndex - 1]);
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      await api.loginWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Erro ao entrar com Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailContinue = () => {
    if (!email.trim()) { setError('Informe seu e-mail.'); return; }
    if (!isValidEmail(email)) { setError('E-mail inválido.'); return; }
    setError('');
    setStep('password');
  };

  const handlePasswordContinue = () => {
    if (password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return; }
    setError('');
    setStep('name');
  };

  const handlePhoneSend = async () => {
    const fullPhone = `+55${phone.replace(/\D/g, '')}`;
    if (fullPhone.length < 13) { setError('Número inválido.'); return; }
    setIsLoading(true); setError('');
    try {
      const result = await api.loginWithPhone(fullPhone, recaptchaRef.current!);
      setConfirmationResult(result);
      setStep('phone-otp');
    } catch (e: any) { setError(e.message || 'Erro ao enviar SMS.'); }
    finally { setIsLoading(false); }
  };

  const handleOtpConfirm = async () => {
    if (otp.length < 6) { setError('Insira o código de 6 dígitos.'); return; }
    setIsLoading(true); setError('');
    try {
      await api.confirmPhoneLogin(confirmationResult!, otp);
    } catch (e: any) { setError(e.message || 'Código inválido.'); }
    finally { setIsLoading(false); }
  };

  const handleFinalize = async () => {
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!firstName.trim()) { setError('Informe seu nome.'); return; }
    setIsLoading(true);
    try {
      await onRegister({
        name,
        email,
        password,
        userType: 'atleta',
        phone: '',
        avatarUrl: '',
        specialties: [],
        experienceLevel: 'Iniciante',
        trainingFrequency: 3,
        objective: 'Ganhar massa muscular',
        trainingLocation: 'Academia',
        experienceYears: '0–1 ano',
        serviceType: 'Ambos',
        studentsCount: '1–10',
        worksInGym: false,
      } as any);
    } catch (e: any) {
      if (e?.code === 'auth/email-already-in-use') {
        setError('Este e-mail já possui uma conta.\nTente fazer login.');
        setEmailDuplicate(true);
      } else {
        setError(e.message || 'Erro ao criar conta.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Shared layout ──────────────────────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col px-6 pt-6 pb-10 bg-dark-bg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button onClick={goBack} className="text-white/60 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg,#ef4444,#f87171)' }}
          />
        </div>
      </div>
      {children}
      {/* Footer terms */}
      <p className="text-center text-xs text-white/30 mt-auto pt-6">
        Ao continuar, você concorda com os nossos{' '}
        <span className="text-white/50 font-semibold">Termos</span> e{' '}
        <span className="text-white/50 font-semibold">Política de Privacidade</span>.
      </p>
    </div>
  );

  const ContinueBtn = ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all active:scale-95',
        disabled || isLoading
          ? 'bg-dark-card border-2 border-dark-border text-white/30 pointer-events-none'
          : 'red-gradient text-black shadow-[0_4px_0_0_rgba(150,10,10,0.6)]'
      )}
    >
      {isLoading
        ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />Verificando...</span>
        : label}
    </button>
  );

  // ─── Steps ──────────────────────────────────────────────────────────────────
  const stepContent: Record<Step, React.ReactNode> = {
    method: (
      <Shell>
        <div className="flex-1 flex flex-col">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-white">Escolha uma opção para continuar!</h1>

          {/* Mascot centered */}
          <div className="flex-1 flex items-center justify-center">
            <img src="/shapinho.png" alt="Shapinho" className="w-32 h-32 object-contain" />
          </div>

          {/* Buttons pinned to bottom */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl border-2 border-dark-border bg-dark-card flex items-center justify-center gap-3 font-semibold text-sm uppercase tracking-widest text-white active:scale-95 transition-all"
            >
              <GoogleIcon />
              Continuar com Google
            </button>
            <button
              onClick={() => { setError(''); setStep('email'); }}
              className="w-full py-4 rounded-2xl border-2 border-dark-border bg-dark-card flex items-center justify-center gap-3 font-semibold text-sm uppercase tracking-widest text-white active:scale-95 transition-all"
            >
              <Mail size={20} className="text-purple-400" />
              Continuar com E-mail
            </button>
            <button
              onClick={() => { setError(''); setStep('phone'); }}
              className="w-full py-4 rounded-2xl border-2 border-dark-border bg-dark-card flex items-center justify-center gap-3 font-semibold text-sm uppercase tracking-widest text-white active:scale-95 transition-all"
            >
              <span className="text-green-400 text-lg">📱</span>
              Continuar com Telefone
            </button>
            <div ref={recaptchaRef} />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </div>
        </div>
      </Shell>
    ),

    phone: (
      <Shell>
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-white">Qual é o seu número?</h1>
          <div className="flex border-2 border-dark-border rounded-2xl overflow-hidden bg-dark-card">
            <span className="flex items-center px-4 text-white/50 text-base border-r border-dark-border select-none">+55</span>
            <input
              autoFocus
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              placeholder="Telefone"
              className="flex-1 bg-transparent px-4 py-4 text-white text-base outline-none"
            />
          </div>
          <p className="text-sm text-white/40 -mt-3">Você receberá um SMS para verificar o seu número.</p>
          {error && <p className="text-red-400 text-sm -mt-3">{error}</p>}
          <ContinueBtn label="Enviar SMS" onClick={handlePhoneSend} disabled={phone.trim().length === 0} />
        </div>
      </Shell>
    ),

    'phone-otp': (
      <Shell>
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-white">Insira o código</h1>
          <input
            autoFocus
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
            placeholder="000000"
            className="w-full bg-dark-card border-2 border-dark-border rounded-2xl py-4 px-5 text-white text-2xl outline-none focus:border-brand-red transition-colors text-center tracking-[0.5em]"
          />
          <p className="text-sm text-white/40 -mt-3 text-center">Código enviado para +55 {phone}</p>
          {error && <p className="text-red-400 text-sm -mt-3">{error}</p>}
          <ContinueBtn label="Confirmar" onClick={handleOtpConfirm} disabled={otp.length < 6} />
        </div>
      </Shell>
    ),

    email: (
      <Shell>
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-white">Qual é o seu e-mail?</h1>
          <input
            autoFocus
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="seuemail@exemplo.com"
            className="w-full bg-dark-card border-2 border-dark-border rounded-2xl py-4 px-5 text-white text-base outline-none focus:border-brand-red transition-colors"
          />
          {error && <p className="text-red-400 text-sm -mt-3">{error}</p>}
          <ContinueBtn label="Continuar" onClick={handleEmailContinue} disabled={!email.trim()} />
        </div>
      </Shell>
    ),

    password: (
      <Shell>
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-white">Crie uma senha</h1>
          <div className="relative">
            <input
              autoFocus
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Senha"
              className="w-full bg-dark-card border-2 border-dark-border rounded-2xl py-4 px-5 pr-12 text-white text-base outline-none focus:border-brand-red transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-red"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm -mt-3">{error}</p>}
          <ContinueBtn label="Continuar" onClick={handlePasswordContinue} disabled={password.length < 8} />
        </div>
      </Shell>
    ),

    name: (
      <Shell>
        <div className="flex-1 flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-white">Qual é o seu nome?</h1>
          <div className="bg-dark-card border-2 border-dark-border rounded-2xl divide-y divide-dark-border">
            <input
              type="text"
              value={firstName}
              onChange={e => { setFirstName(e.target.value); setError(''); setEmailDuplicate(false); }}
              placeholder="Nome"
              className="w-full bg-transparent py-4 px-5 text-white text-base outline-none rounded-t-2xl"
            />
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Sobrenome"
              className="w-full bg-transparent py-4 px-5 text-white text-base outline-none rounded-b-2xl"
            />
          </div>
          {error && <p className="text-red-400 text-sm -mt-3 font-medium text-center whitespace-pre-line">{error}</p>}
          <ContinueBtn
            label={emailDuplicate ? "Voltar" : "Criar perfil"}
            onClick={emailDuplicate ? () => { setEmailDuplicate(false); setError(''); setStep('email'); } : handleFinalize}
            disabled={!emailDuplicate && !firstName.trim()}
          />
          {emailDuplicate && (
            <button
              onClick={() => (onGoToLogin ?? onBack)()}
              className="w-full py-4 rounded-2xl bg-dark-card border-2 border-dark-border text-brand-red font-bold text-sm uppercase tracking-widest active:scale-95 transition-all"
            >
              Fazer login
            </button>
          )}
        </div>
      </Shell>
    ),
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.2 }}
      >
        {stepContent[step]}
      </motion.div>
    </AnimatePresence>
  );
}
