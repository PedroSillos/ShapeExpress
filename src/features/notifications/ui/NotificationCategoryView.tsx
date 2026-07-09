import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import type { NotificationCategory, NotificationSettings } from '../types';

interface NotificationCategoryViewProps {
  category: NotificationCategory;
  settings: NotificationSettings;
  onToggle: (key: string) => void;
  onBack: () => void;
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}

/** Duolingo-style toggle row with sky-blue track when active. */
function ToggleRow({ label, value, onToggle, last = false }: ToggleRowProps) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={onToggle}
      className={[
        'w-full flex items-center justify-between px-4 py-4',
        'hover:bg-white/5 active:bg-white/10 transition-colors text-left',
        !last ? 'border-b border-dark-border' : '',
      ].join(' ')}
    >
      <span className="text-white font-bold text-[15px]">{label}</span>

      {/* Toggle track */}
      <div
        className={[
          'relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0',
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

/**
 * Notification category detail screen.
 * Shows a list of toggles for each item inside the selected category.
 */
export function NotificationCategoryView({
  category,
  settings,
  onToggle,
  onBack,
}: NotificationCategoryViewProps) {
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
        <h1 className="text-white/60 text-base font-semibold tracking-wide">{category.title}</h1>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <p className="text-white/50 text-sm mb-4">{category.description}</p>
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          {category.items.map((item, idx) => (
            <ToggleRow
              key={item.key}
              label={item.label}
              value={settings[item.key] ?? true}
              onToggle={() => onToggle(item.key)}
              last={idx === category.items.length - 1}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
