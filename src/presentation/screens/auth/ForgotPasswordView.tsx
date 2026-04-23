import React, { useState } from 'react';
import { Mail, ChevronLeft } from 'lucide-react';
import { Card } from '../../components/Card';
import { isValidEmail } from '../../../utils/validation';

interface ForgotPasswordViewProps {
  onBack: () => void;
  api: {
    forgotPassword: (email: string) => Promise<any>;
  };
}

export function ForgotPasswordView({ onBack, api }: ForgotPasswordViewProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecover = async () => {
    if (!isValidEmail(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center space-y-8 py-12">
        <Card className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto">
            <Mail className="text-brand-red" size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Email Enviado!</h2>
            <p className="text-sm text-white/40">
              Enviamos as instruções de recuperação para <span className="text-white font-medium">{email}</span>.
            </p>
          </div>
          <button 
            onClick={onBack}
            className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
          >
            Voltar ao Login
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center space-y-8 py-12">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Recuperar Senha</h2>
      </div>

      <Card className="space-y-6 p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm text-center font-bold">
            {error}
          </div>
        )}
        <p className="text-sm text-white/40">
          Insira seu email cadastrado para receber um link de redefinição de senha.
        </p>
        
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

        <button 
          onClick={handleRecover}
          disabled={loading}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
        >
          {loading ? 'Processando...' : 'Recuperar Senha'}
        </button>
      </Card>
    </div>
  );
}
