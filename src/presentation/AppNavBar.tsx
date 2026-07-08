import { Dumbbell, BarChart3, Home, User, ShoppingBag, Users, UserCheck } from 'lucide-react';
import { UserProfile, WorkoutSession } from '../domain/entities';
import { NavButton } from './components/NavButton';
import { STORAGE_KEYS } from '../shared/lib/storageKeys';

interface AppNavBarProps {
  isLoggedIn: boolean;
  activeTab: string;
  activeWorkout: WorkoutSession | null;
  userProfile: UserProfile;
  switchTab: (tab: string) => void;
  onStudentsClick: () => void;
}

export function AppNavBar({
  isLoggedIn,
  activeTab,
  activeWorkout,
  userProfile,
  switchTab,
  onStudentsClick,
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-surface">
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
