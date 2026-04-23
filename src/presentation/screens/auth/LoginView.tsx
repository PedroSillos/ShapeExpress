import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Card } from '../../components/Card';
import { Logo } from '../../components/Logo';
import { isValidEmail } from '../../../utils/validation';

interface LoginViewProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  api: any;
}

export function LoginView({ onLogin, onForgotPassword, onRegister, api }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }
    if (!password.trim()) {
      setError('Por favor, insira sua senha.');
      return;
    }
    setError('');
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center space-y-8 py-12">
      <div className="text-center space-y-2">
        <Logo size="lg" />
        <p className="text-white/70 font-medium tracking-widest uppercase text-base">Elite Performance Tracking</p>
      </div>

      <Card className="space-y-6 p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm text-center font-bold">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="atleta@shapeexpress.com"
                className="w-full bg-dark-surface border border-dark-border rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-dark-surface border border-dark-border rounded-xl py-3.5 pl-12 pr-12 text-sm font-medium focus:outline-none focus:border-gray-400 transition-colors"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-brand-red transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          Entrar na Arena
        </button>

        <div className="pt-2">
          <button 
            onClick={async () => {
              try {
                await api.loginWithGoogle();
              } catch (e) {
                // error handled in hook
              }
            }}
            className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Entrar com Google
          </button>
        </div>

        <div className="text-center">
          <button 
            onClick={onForgotPassword}
            className="text-sm text-white/70 hover:text-brand-red transition-colors font-medium"
          >
            Esqueceu a senha?
          </button>
        </div>
      </Card>

      <div className="text-center space-y-4">
        <p className="text-sm text-white/70 font-medium">Não tem uma conta?</p>
        <button 
          onClick={onRegister}
          className="text-xs font-bold text-brand-red uppercase tracking-widest border-b border-brand-red/20 pb-1"
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}
