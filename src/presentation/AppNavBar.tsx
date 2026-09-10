import { Dumbbell, BarChart3, Home, User, ShoppingBag, Users, UserCheck } from 'lucide-react';
import { UserProfile, WorkoutSession } from '../domain/entities';
import { NavButton } from './components/NavButton';
import { STORAGE_KEYS } from '../shared/lib/storageKeys';
import { motion } from 'motion/react';
import type { RestTimerState } from './hooks/useRestTimer';

interface AppNavBarProps {
  isLoggedIn: boolean;
  activeTab: string;
  activeWorkout: WorkoutSession | null;
  userProfile: UserProfile;
  switchTab: (tab: string) => void;
  onStudentsClick: () => void;
  restTimer?: RestTimerState;
}

export function AppNavBar({
  isLoggedIn,
  activeTab,
  activeWorkout,
  userProfile,
  switchTab,
  onStudentsClick,
  restTimer,
}: AppNavBarProps) {
  const welcomeDone = !!localStorage.getItem(STORAGE_KEYS.WELCOME_DONE);
  if (
    (!isLoggedIn && !welcomeDone) ||
    activeWorkout ||
    ['landing', 'welcome', 'login', 'register', 'forgot-password'].includes(activeTab) ||
    ['create-workout', 'edit-workout'].includes(activeTab)
  ) {
    return null;
  }

  const isTrainer = userProfile?.userType === 'treinador';

  // Show rest timer pill when user navigated away from the active workout screen
  // (activeWorkout is null here because the guard above already handles the
  //  in-workout state — this covers the case where a workout IS active but
  //  the workout view somehow isn't showing, which shouldn't happen, but
  //  more importantly: isResting stays true even when the user navigated out
  //  because restTimer lives in global state. We show the pill whenever
  //  isResting is true and we're NOT inside the active workout screen.)
  const showRestPill = !!(restTimer?.isResting);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-surface">
      {/* Rest timer mini pill — visible when a rest countdown is running in background */}
      {showRestPill && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-1"
        >
          <div className="relative overflow-hidden flex items-center gap-2 bg-dark-card border border-white/10 rounded-full px-4 py-1.5 shadow-lg">
            {/* Progress fill behind the pill content */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/5"
              style={{ transformOrigin: 'left center' }}
              animate={{ scaleX: restTimer!.progress }}
              transition={{ duration: 0.5, ease: 'linear' }}
            />
            <span className="relative text-xs text-white/50 font-bold font-mono tabular-nums">
              {restTimer!.remaining}s
            </span>
            <span className="relative text-xs text-white/30 font-medium">descanso</span>
          </div>
        </motion.div>
      )}

      <nav className="max-w-md mx-auto border-t border-white/10 py-3 pb-10 grid grid-cols-6 items-center">
        {/* Home */}
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'dashboard'}
            icon={<Home size={20} />}
            onClick={() => switchTab('dashboard')}
          />
        </div>

        {/* Treinos */}
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'workouts'}
            icon={<Dumbbell size={20} />}
            onClick={() => switchTab('workouts')}
          />
        </div>

        {/* Stats */}
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'stats'}
            icon={<BarChart3 size={20} />}
            onClick={() => switchTab('stats')}
          />
        </div>

        {/* Loja (todos os tipos de usuário) */}
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'store'}
            icon={<ShoppingBag size={20} />}
            onClick={() => switchTab('store')}
          />
        </div>

        {/* Treinadores (atleta) ou Alunos (treinador) */}
        <div className="flex justify-center">
          {isTrainer ? (
            <NavButton
              active={activeTab === 'students'}
              icon={<Users size={20} />}
              onClick={onStudentsClick}
            />
          ) : (
            <NavButton
              active={activeTab === 'trainers'}
              icon={<UserCheck size={20} />}
              onClick={() => switchTab('trainers')}
            />
          )}
        </div>

        {/* Perfil */}
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'perfil'}
            icon={<User size={20} />}
            onClick={() => switchTab('perfil')}
          />
        </div>
      </nav>
    </div>
  );
}
