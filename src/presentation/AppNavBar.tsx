import { Dumbbell, BarChart3, Zap, Home, User } from 'lucide-react';
import { UserProfile, WorkoutSession } from '../domain/entities';
import { NavButton } from './components/NavButton';

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
  const welcomeDone = !!localStorage.getItem('welcome-done');
  if (
    (!isLoggedIn && !welcomeDone) ||
    activeWorkout ||
    ['landing', 'welcome', 'login', 'register', 'forgot-password'].includes(activeTab) ||
    ['create-workout', 'edit-workout'].includes(activeTab)
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-surface">
      <nav className="max-w-md mx-auto border-t border-white/10 py-3 pb-10 grid grid-cols-5 items-center">
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'dashboard'}
            icon={<Home size={20} />}
            onClick={() => switchTab('dashboard')}
          />
        </div>
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'workouts'}
            icon={<Dumbbell size={20} />}
            onClick={() => switchTab('workouts')}
          />
        </div>
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'stats'}
            icon={<BarChart3 size={20} />}
            onClick={() => switchTab('stats')}
          />
        </div>
        <div className="flex justify-center">
          {userProfile?.userType === 'treinador' ? (
            <NavButton
              active={activeTab === 'students'}
              icon={<Zap size={20} />}
              onClick={onStudentsClick}
            />
          ) : (
            <NavButton
              active={activeTab === 'express'}
              icon={<Zap size={20} />}
              onClick={() => switchTab('express')}
            />
          )}
        </div>
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
