import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import type { UserProfile } from '@/src/domain/entities';
import { useUserSports } from '../hooks/useUserSports';
import { ALL_SPORTS } from '../constants';

interface ManageSportsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => Promise<void>;
  onBack: () => void;
}

/**
 * Manage sports screen.
 * Lists current sports with a REMOVER button.
 * Shows a warning only when the user tries to remove the last remaining sport.
 */
export function ManageSportsView({
  userProfile,
  onUpdateProfile,
  onBack,
}: ManageSportsViewProps) {
  const { sports, removeSport } = useUserSports(userProfile, onUpdateProfile);
  const [showMinWarning, setShowMinWarning] = useState(false);

  /** Find the full SportOption for a sport id, or fall back to a plain entry. */
  function sportOption(id: string) {
    return ALL_SPORTS.find((s) => s.id === id) ?? null;
  }

  function handleRemove(id: string) {
    if (sports.length <= 1) {
      setShowMinWarning(true);
      return;
    }
    setShowMinWarning(false);
    removeSport(id);
  }

  return (
    <div className="relative h-full overflow-hidden">
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
          <h1 className="text-white/60 text-base font-semibold tracking-wide">Modalidades</h1>
          <div className="w-10" />
        </div>

        {/* ── Sport list ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3">
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            {sports.length === 0 ? (
              <p className="px-4 py-5 text-white/40 text-sm text-center">
                Nenhuma modalidade selecionada.
              </p>
            ) : (
              sports.map((id, idx) => {
                const opt = sportOption(id);
                return (
                  <div
                    key={id}
                    className={[
                      'flex items-center gap-3 px-4 py-3',
                      idx !== sports.length - 1 ? 'border-b border-dark-border' : '',
                    ].join(' ')}
                  >
                    {/* Icon */}
                    {opt ? (
                      <div
                        className="w-12 h-12 rounded-xl overflow-hidden p-1.5 flex-shrink-0"
                        style={{ backgroundColor: opt.bg }}
                      >
                        <img
                          src={opt.icon}
                          alt={opt.label}
                          className="w-full h-full object-contain brightness-0 invert"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0" />
                    )}

                    {/* Label */}
                    <span className="flex-1 text-white font-bold text-[15px]">
                      {opt?.label ?? id}
                    </span>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(id)}
                      className="text-xs font-black tracking-widest uppercase text-red-400 hover:opacity-70 active:opacity-50 transition-opacity px-1 py-1"
                      aria-label={`Remover ${opt?.label ?? id}`}
                    >
                      Remover
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Warning: shown only after trying to remove the last sport ── */}
          {showMinWarning && (
            <p className="text-white/40 text-xs text-center px-4">
              Você precisa ter pelo menos uma modalidade.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
