import { Bell } from 'lucide-react';
import { Logo } from './components/Logo';
import { UserProfile, UserStats, AppNotification } from '../domain/entities';

interface AppHeaderProps {
  isLoggedIn: boolean;
  userProfile: UserProfile;
  userStats: UserStats;
  notifications: AppNotification[];
  onNotificationsClick: () => void;
  onProfileClick: () => void;
}

export function AppHeader({
  isLoggedIn,
  userProfile,
  userStats,
  notifications,
  onNotificationsClick,
  onProfileClick,
}: AppHeaderProps) {
  if (!isLoggedIn) return null;

  return (
    <header className="sticky top-0 z-40 bg-dark-surface/80 backdrop-blur-md p-6 flex justify-between items-center border-b border-white/5">
      <div>
        <Logo size="sm" />
        <p className="text-xs text-white/40 font-medium tracking-widest uppercase">Elite Performance</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onNotificationsClick}
          className="relative p-2 text-white/60 hover:text-brand-red transition-colors active:scale-90"
        >
          <Bell size={24} />
          {notifications.some(n => !n.read) && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full border border-dark-surface" />
          )}
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-white truncate max-w-[100px]">{userProfile?.name || 'Atleta'}</p>
            <p className="text-[10px] text-white/40 font-medium">{userStats.xp} XP</p>
          </div>
          <div className="relative">
            <button
              onClick={onProfileClick}
              className="w-10 h-10 rounded-full border-2 border-brand-red p-0.5 active:scale-90 transition-transform overflow-hidden"
            >
              <img
                src={userProfile?.avatarUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
            <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-brand-red rounded-full flex items-center justify-center border-2 border-dark-surface shadow-lg">
              <span className="text-[10px] font-black text-black">{userStats.level}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
