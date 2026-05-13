import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onBack: () => void;
  api: any;
}

export function LoginView({ onLogin, onForgotPassword, onBack, api }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    setError('');
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 pt-14 pb-8">
      {/* Header */}
      <div className="relative flex items-center justify-center mb-10">
        <button onClick={onBack} className="absolute left-0 text-white/50 hover:text-white/70 transition-colors">
          <X size={22} />
        </button>
        <span className="text-white/50 font-bold text-base">Insira os seus dados</span>
      </div>

      {/* Fields */}
      <form onSubmit={handleLogin} className="space-y-0 mb-4">
        <div className="border border-dark-border rounded-2xl overflow-hidden">
          <input
            type="text"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
            placeholder="E-mail, telefone ou nome de usuário"
            className="w-full bg-dark-card px-4 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none border-b border-dark-border caret-brand-red"
          />
          <div className="relative bg-dark-card">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
              placeholder="Senha"
              className="w-full bg-transparent px-4 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none pr-12 caret-brand-red"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-red transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center pt-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest mt-4 transition-all active:scale-95 ${
            canSubmit
              ? 'red-gradient text-black shadow-lg shadow-brand-red/20'
              : 'bg-dark-card text-white/30 cursor-not-allowed'
          }`}
        >
          Entrar
        </button>
      </form>

      {/* Forgot password */}
      <div className="text-center mt-4">
        <button
          onClick={onForgotPassword}
          className="text-sm font-bold text-brand-red uppercase tracking-widest"
        >
          Esqueci a Senha
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom section */}
      <div className="space-y-4">
        <button
          onClick={async () => {
            try { await api.loginWithGoogle(); } catch {}
          }}
          className="w-full py-4 bg-dark-card border border-dark-border rounded-2xl font-bold text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <GoogleIcon />
          <span className="text-white uppercase tracking-widest">Google</span>
        </button>

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
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
