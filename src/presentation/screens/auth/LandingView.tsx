interface LandingViewProps {
  onStart: () => void;
  onLogin: () => void;
}

export function LandingView({ onStart, onLogin }: LandingViewProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-between py-16 px-6 overflow-hidden bg-dark-surface">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-36 h-36 rounded-full bg-dark-card flex items-center justify-center">
          <span className="text-7xl select-none">⚡</span>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold red-text-gradient">shape express</h1>
          <p className="text-white/40 text-base">Treine inteligente. Evolua mais rápido.</p>
        </div>
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
          className="w-full py-4 bg-transparent border border-dark-border rounded-2xl text-white/60 font-bold text-sm uppercase tracking-widest active:scale-95 transition-transform"
        >
          Já Tenho Uma Conta
        </button>
      </div>
    </div>
  );
}
