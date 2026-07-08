import { ChevronRight, X } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  onClose: () => void;
  onLogout: () => void;
}

interface SettingsItem {
  label: string;
  onPress?: () => void;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

/**
 * Settings screen — Duolingo-inspired layout.
 * Groups: Conta · Assinatura · Suporte · Sign Out · Legal links.
 */
export function SettingsView({ onClose, onLogout }: SettingsViewProps) {
  const sections: SettingsSection[] = [
    {
      title: 'Conta',
      items: [
        { label: 'Preferências' },
        { label: 'Perfil' },
        { label: 'Notificações' },
        { label: 'Privacidade' },
      ],
    },
    {
      title: 'Assinatura',
      items: [
        { label: 'Escolher plano' },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { label: 'Central de ajuda' },
        { label: 'Enviar feedback' },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-dark-surface flex flex-col"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-dark-border">
        <div className="w-10" /> {/* spacer */}
        <h1 className="text-white/60 text-base font-semibold tracking-wide">Configurações</h1>
        <button
          aria-label="Fechar configurações"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
          onClick={onClose}
        >
          <X size={20} className="text-sky-400 font-bold" />
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

        {/* ── Sections ── */}
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-white font-bold text-base mb-2">{section.title}</p>
            <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={item.onPress}
                  className={[
                    'w-full flex items-center justify-between px-4 py-4',
                    'hover:bg-white/5 active:bg-white/10 transition-colors text-left',
                    idx !== section.items.length - 1 ? 'border-b border-dark-border' : '',
                  ].join(' ')}
                >
                  <span className="text-white font-semibold text-[15px]">{item.label}</span>
                  <ChevronRight size={18} className="text-white/30" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* ── Sign out button ── */}
        <button
          onClick={onLogout}
          className="w-full py-4 border border-dark-border rounded-2xl text-sky-400 font-bold text-sm tracking-widest uppercase hover:bg-white/5 active:bg-white/10 transition-colors"
        >
          Sair da conta
        </button>

        {/* ── Legal links ── */}
        <div className="flex flex-col gap-2 pb-8">
          <button className="text-left text-sky-400 font-bold text-sm tracking-widest uppercase hover:opacity-70 transition-opacity">
            Termos de uso
          </button>
          <button className="text-left text-sky-400 font-bold text-sm tracking-widest uppercase hover:opacity-70 transition-opacity">
            Política de privacidade
          </button>
        </div>
      </div>
    </motion.div>
  );
}
