import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationSettings, NOTIFICATION_CATEGORIES } from '../hooks/useNotificationSettings';
import { NotificationCategoryView } from './NotificationCategoryView';

interface NotificationsSettingsViewProps {
  onBack: () => void;
}

/**
 * Notifications settings screen.
 * Lists all notification categories with a counter of disabled items.
 * Tapping a category opens its detail sub-screen.
 */
export function NotificationsSettingsView({ onBack }: NotificationsSettingsViewProps) {
  const { settings, toggle, disabledCount } = useNotificationSettings();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const activeCategory = activeCategoryId
    ? NOTIFICATION_CATEGORIES.find((c) => c.id === activeCategoryId) ?? null
    : null;

  return (
    <div className="relative h-full overflow-hidden">
      {/* ── Main notifications list ── */}
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
          <h1 className="text-white/60 text-base font-semibold tracking-wide">Notificações</h1>
          <div className="w-10" /> {/* spacer */}
        </div>

        {/* ── Category list ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            {NOTIFICATION_CATEGORIES.map((category, idx) => {
              const disabled = disabledCount(category.id);
              const isLast = idx === NOTIFICATION_CATEGORIES.length - 1;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategoryId(category.id)}
                  className={[
                    'w-full flex items-center justify-between px-4 py-4',
                    'hover:bg-white/5 active:bg-white/10 transition-colors text-left',
                    !isLast ? 'border-b border-dark-border' : '',
                  ].join(' ')}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-white font-bold text-[15px]">{category.title}</p>
                    <p className="text-white/50 text-sm mt-0.5">{category.description}</p>
                    {disabled > 0 && (
                      <p className="text-sky-400 font-bold text-sm mt-1">
                        {disabled} {disabled === 1 ? 'notificação desativada' : 'notificações desativadas'}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-white/30 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Category detail sub-screen ── */}
      <AnimatePresence>
        {activeCategory && (
          <div className="absolute inset-0 bg-dark-surface">
            <NotificationCategoryView
              category={activeCategory}
              settings={settings}
              onToggle={toggle}
              onBack={() => setActiveCategoryId(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
