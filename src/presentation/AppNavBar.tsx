import { LayoutDashboard, Users, Play, BarChart3, Zap, Home } from 'lucide-react';
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
  if ((!isLoggedIn && !welcomeDone) || activeWorkout || ['landing', 'welcome', 'login', 'register', 'forgot-password'].includes(activeTab) || ['create-workout', 'edit-workout'].includes(activeTab)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-surface">
      <nav className="max-w-md mx-auto border-t border-white/10 py-3 pb-6 grid grid-cols-5 items-center">
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'dashboard'}
            icon={<Home size={20} />}
            label="Início"
            onClick={() => switchTab('dashboard')}
          />
        </div>
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'community'}
            icon={<Users size={20} />}
            label="Comunidade"
            onClick={() => switchTab('community')}
          />
        </div>
        <div className="flex justify-center">
          <div className="relative -top-7">
            <button
              onClick={() => switchTab('workouts')}
              className="w-14 h-14 rounded-full red-gradient shadow-lg shadow-brand-red/20 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Play color="currentColor" size={28} fill="currentColor" />
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <NavButton
            active={activeTab === 'stats'}
            icon={<BarChart3 size={20} />}
            label="Stats"
            onClick={() => switchTab('stats')}
          />
        </div>
        <div className="flex justify-center">
          {userProfile?.userType === 'treinador' ? (
            <NavButton
              active={activeTab === 'students'}
              icon={<Users size={20} />}
              label="Alunos"
              onClick={onStudentsClick}
            />
          ) : (
            <NavButton
              active={activeTab === 'express'}
              icon={<Zap size={20} />}
              label="Express"
              onClick={() => switchTab('express')}
            />
          )}
        </div>
      </nav>
    </div>
  );
}
