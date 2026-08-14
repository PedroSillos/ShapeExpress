interface PublishGuestViewProps {
  onCreateProfile: () => void;
  onLogin: () => void;
  onClose: () => void;
}

export function PublishGuestView({ onCreateProfile, onLogin, onClose }: PublishGuestViewProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-dark-card border border-white/10 rounded-3xl mx-6 max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center gap-6">
          <p className="text-white/70 text-xl font-normal text-center leading-snug">
            Você precisa ter um perfil para publicar treinos na loja.
          </p>
          <div className="w-full flex flex-col gap-3">
            <button onClick={onCreateProfile} className="w-full bg-brand-red active:opacity-80 text-white/90 font-semibold uppercase tracking-widest text-sm py-4 rounded-2xl shadow-lg shadow-brand-red/20 transition-opacity">
              Criar Perfil
            </button>
            <button onClick={onLogin} className="w-full border border-white/20 active:bg-white/5 text-brand-red font-semibold uppercase tracking-widest text-sm py-4 rounded-2xl transition-colors">
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
