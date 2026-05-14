import { Logo } from '../../components/Logo';

interface LandingViewProps {
  onStart: () => void;
  onLogin: () => void;
}

export function LandingView({ onStart, onLogin }: LandingViewProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-between py-16 px-6 overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        <Logo size="lg" />
      </div>
      <div className="w-full space-y-3">
        <button
          onClick={onStart}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold text-sm uppercase tracking-widest active:scale-95 transition-transform"
        >
          Começar Agora
        </button>
        <button
          onClick={onLogin}
          className="w-full py-4 bg-transparent border border-brand-red rounded-2xl text-brand-red font-bold text-sm uppercase tracking-widest active:scale-95 transition-transform"
        >
          Já Tenho Uma Conta
        </button>
      </div>
    </div>
  );
}
