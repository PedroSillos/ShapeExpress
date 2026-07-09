import { ChevronLeft, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/utils/cn';
import { ALL_SPORTS } from '../constants';

interface AddSportViewProps {
  /** Sports the user already has — shown as already-selected (disabled). */
  currentSports: string[];
  onAdd: (id: string) => void;
  onBack: () => void;
}

/**
 * Sport selection grid — Duolingo-inspired.
 * Already-selected sports are shown with a check and muted opacity.
 * Tapping an available sport calls onAdd and returns to the manage list.
 */
export function AddSportView({ currentSports, onAdd, onBack }: AddSportViewProps) {
  function handleSelect(id: string) {
    if (currentSports.includes(id)) return;
    onAdd(id);
    onBack();
  }

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
        <h1 className="text-white/60 text-base font-semibold tracking-wide">Adicionar Modalidade</h1>
        <div className="w-10" />
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          {ALL_SPORTS.map((sport) => {
            const selected = currentSports.includes(sport.id);
            return (
              <button
                key={sport.id}
                onClick={() => handleSelect(sport.id)}
                disabled={selected}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all text-left',
                  'bg-dark-card border-dark-border',
                  selected
                    ? 'opacity-40 cursor-default'
                    : 'hover:bg-white/5 active:bg-white/10 cursor-pointer',
                )}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden p-1.5 flex-shrink-0"
                  style={{ backgroundColor: sport.bg }}
                >
                  <img
                    src={sport.icon}
                    alt={sport.label}
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>

                <span className="text-white font-bold text-sm leading-tight">{sport.label}</span>

                {/* Already-selected check badge */}
                {selected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-sky-400 flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
