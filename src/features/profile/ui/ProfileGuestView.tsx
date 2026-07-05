interface ProfileGuestViewProps {
  onCreateProfile: () => void;
  onLogin: () => void;
}

export function ProfileGuestView({ onCreateProfile, onLogin }: ProfileGuestViewProps) {
  return (
    <div
      className="flex flex-col bg-dark-surface"
      style={{ height: 'calc(100vh - 6rem)', overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="flex items-center justify-center px-4 pt-8 pb-4">
        <span className="text-white/40 text-base font-medium tracking-wide uppercase">Perfil</span>
      </div>

      {/* Body — centered CTA */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <p className="text-white/70 text-xl font-normal text-center leading-snug">
          Você precisa ter um perfil para se conectar com os seus amigos.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onCreateProfile}
            className="w-full bg-brand-red active:opacity-80 text-white/90 font-semibold uppercase tracking-widest text-sm py-4 rounded-2xl shadow-lg shadow-brand-red/20 transition-opacity"
          >
            Criar Perfil
          </button>

          <button
            onClick={onLogin}
            className="w-full border border-white/20 active:bg-white/5 text-brand-red font-semibold uppercase tracking-widest text-sm py-4 rounded-2xl transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
