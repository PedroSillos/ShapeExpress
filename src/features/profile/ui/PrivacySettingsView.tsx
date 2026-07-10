import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { usePrivacySettings, type PrivacySettings } from '../hooks/usePrivacySettings';

interface PrivacySettingsViewProps {
  onBack: () => void;
}

interface PrivacyToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}

/** Toggle row with title + description, matching the Privacy settings design. */
function PrivacyToggleRow({
  label,
  description,
  value,
  onToggle,
  last = false,
}: PrivacyToggleRowProps) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={onToggle}
      className={[
        'w-full flex items-start justify-between px-4 py-4 gap-4',
        'hover:bg-white/5 active:bg-white/10 transition-colors text-left',
        !last ? 'border-b border-dark-border' : '',
      ].join(' ')}
    >
      {/* Text block */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-[15px] leading-snug">{label}</p>
        <p className="text-white/50 text-sm mt-1 leading-snug">{description}</p>
      </div>

      {/* Toggle track */}
      <div
        className={[
          'relative mt-0.5 w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0',
          value ? 'bg-sky-400' : 'bg-white/20',
        ].join(' ')}
      >
        {/* Toggle thumb */}
        <span
          className={[
            'absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
            value ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </div>
    </button>
  );
}

interface PrivacyItem {
  key: keyof PrivacySettings;
  label: string;
  description: string;
}

const PRIVACY_ITEMS: PrivacyItem[] = [
  {
    key: 'informationCollection',
    label: 'Coleta de informações',
    description: 'Rastreamento e personalização para publicidade',
  },
  {
    key: 'shareActivityWithAnyone',
    label: 'Compartilhar atividade com todos',
    description: 'Permitir que qualquer pessoa veja sua atividade no Feed, não apenas seguidores',
  },
];

/**
 * Privacy settings screen.
 * Displays toggle rows for privacy preferences (collection & sharing).
 */
export function PrivacySettingsView({ onBack }: PrivacySettingsViewProps) {
  const { settings, toggle } = usePrivacySettings();

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-dark-surface flex flex-col"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-dark-border">
        <button
          aria-label="Voltar"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft size={22} className="text-sky-400" />
        </button>
        <h1 className="text-white/60 text-base font-semibold tracking-wide">Privacidade</h1>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          {PRIVACY_ITEMS.map((item, idx) => (
            <PrivacyToggleRow
              key={item.key}
              label={item.label}
              description={item.description}
              value={settings[item.key]}
              onToggle={() => toggle(item.key)}
              last={idx === PRIVACY_ITEMS.length - 1}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
