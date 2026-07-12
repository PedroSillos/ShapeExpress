import { useState } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { InitialsAvatar } from '@/src/shared/ui/InitialsAvatar';
import type { UserProfile } from '@/src/domain/entities';

interface LogoutAccountScreenProps {
  /** The profile of the currently logged-in user — shown in the account card. */
  userProfile: UserProfile;
  /** Called after the Firebase signOut resolves. */
  onLogoutConfirm: () => Promise<void>;
  /**
   * Called when the user taps their own account card — no logout is performed,
   * the screen is dismissed and the active session is resumed.
   */
  onResumeSession: () => void;
  /** Navigates to the register screen (user tapped "Adicionar outra conta"). */
  onGoToRegister: () => void;
  /** Navigates to a screen listing all saved accounts (future feature). */
  onManageAccounts: () => void;
}

/**
 * "Volte pra sua conta" screen — Duolingo-inspired fullscreen logout screen.
 *
 * Shown when the user taps "Sair da conta" in Settings.
 * The screen:
 *  1. Performs the Firebase signOut immediately on mount so the session is
 *     terminated as soon as the screen appears.
 *  2. Shows the previous account card so the user can quickly log back in.
 *  3. Offers "Adicionar outra conta" to start a fresh registration.
 */
export function LogoutAccountScreen({
  userProfile,
  onLogoutConfirm,
  onResumeSession,
  onGoToRegister,
  onManageAccounts,
}: LogoutAccountScreenProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName =
    [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ') ||
    userProfile.email?.split('@')[0] ||
    'Usuário';

  const email = userProfile.email ?? '';

  // Tapping the account card: the user still has an active session, so just
  // dismiss this screen and resume — no logout needed.
  function handleAccountPress() {
    onResumeSession();
  }

  // Tapping "Adicionar outra conta": complete logout then go to register.
  async function handleAddAccount() {
    if (loggingOut) return;
    setLoggingOut(true);
    await onLogoutConfirm();
    onGoToRegister();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] bg-dark-surface flex flex-col items-center justify-between px-6 py-16"
    >
      {/* ── Top spacer + mascot ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <motion.img
          src="/icon.png"
          alt="Shapinho"
          className="w-36 h-36 object-contain drop-shadow-2xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, type: 'spring', bounce: 0.4 }}
        />

        <motion.h1
          className="text-white font-extrabold text-3xl text-center leading-tight"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          Volte pra sua conta!
        </motion.h1>
      </div>

      {/* ── Account card ── */}
      <motion.div
        className="w-full max-w-sm"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
      >
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          {/* Existing account row */}
          <button
            onClick={handleAccountPress}
            disabled={loggingOut}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors border-b border-dark-border"
          >
            <InitialsAvatar
              name={displayName}
              sizeClass="w-12 h-12"
              className="text-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white font-bold text-[15px] leading-snug truncate">
                {displayName}
              </p>
              <p className="text-white/50 text-sm truncate">{email}</p>
            </div>
            <ChevronRight size={18} className="text-white/30 flex-shrink-0" />
          </button>

          {/* Add another account row */}
          <button
            onClick={handleAddAccount}
            disabled={loggingOut}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center flex-shrink-0">
              <Plus size={22} className="text-white/50" />
            </div>
            <span className="text-white/50 font-bold text-[15px]">Adicionar outra conta</span>
          </button>
        </div>
      </motion.div>

      {/* ── Manage accounts link ── */}
      <motion.button
        onClick={onManageAccounts}
        disabled={loggingOut}
        className="mt-8 text-white/30 font-bold text-sm tracking-widest uppercase hover:text-white/50 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.3 }}
      >
        Gerenciar contas
      </motion.button>
    </motion.div>
  );
}
