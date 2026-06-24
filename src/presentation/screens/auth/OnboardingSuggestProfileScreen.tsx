interface Props {
  onCreateProfile: () => void;
  onSkip: () => void;
}

export function OnboardingSuggestProfileScreen({ onCreateProfile, onSkip }: Props) {
  return (
    <div className="h-screen overflow-hidden flex flex-col px-6 py-8">
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="relative bg-dark-card border border-dark-border rounded-2xl px-5 py-4 w-full">
          <p className="text-white text-lg leading-snug text-center">
            Não perca o seu progresso! Vamos criar um perfil.
          </p>
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-[10px] w-0 h-0"
            style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '10px solid var(--theme-card)' }}
          />
        </div>
        <img src="/shapinho.png" alt="Shapinho" className="w-32 h-32 object-contain" />
      </div>
      <div className="flex flex-col gap-4 shrink-0">
        <button
          onClick={onCreateProfile}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest red-gradient text-black shadow-[0_4px_0_0_rgba(150,10,10,0.6)] active:scale-95 transition-all"
        >
          Criar perfil
        </button>
        <button
          onClick={onSkip}
          className="w-full py-2 font-black text-sm uppercase tracking-widest text-white/40 active:opacity-60 transition-opacity"
        >
          Depois
        </button>
      </div>
    </div>
  );
}
