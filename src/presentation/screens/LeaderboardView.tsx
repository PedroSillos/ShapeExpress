import React from 'react';
import { Flame } from 'lucide-react';
import { Badge } from '../components/Badge';
import { LeaderboardEntry, UserProfile, UserStats } from '../../domain/entities';
import { cn } from '../../utils/cn';

interface LeaderboardViewProps {
  currentUserProfile: UserProfile | null;
  userStats: UserStats;
  isLoggedIn: boolean;
  getLeaderboard: (league: string) => Promise<LeaderboardEntry[]>;
  onLogin?: () => void;
  onRegister?: () => void;
}

const MOCK: LeaderboardEntry[] = [
  { id: 'mock-0', name: 'Ana Silva',      avatarUrl: 'https://picsum.photos/seed/u101/200', xp: 15000, streak: 50, level: 30, rank: 1 },
  { id: 'mock-1', name: 'Lucas Oliveira', avatarUrl: 'https://picsum.photos/seed/u102/200', xp: 13800, streak: 42, level: 28, rank: 2 },
  { id: 'mock-2', name: 'Mariana Costa',  avatarUrl: 'https://picsum.photos/seed/u103/200', xp: 12600, streak: 35, level: 26, rank: 3 },
  { id: 'mock-3', name: 'Pedro Santos',   avatarUrl: 'https://picsum.photos/seed/u104/200', xp: 11000, streak: 30, level: 24, rank: 4 },
  { id: 'mock-4', name: 'Carla Dias',     avatarUrl: 'https://picsum.photos/seed/u105/200', xp:  9800, streak: 27, level: 22, rank: 5 },
];

const medalStyle: Record<number, string> = {
  1: 'bg-yellow-400 text-black border-yellow-300',
  2: 'bg-slate-400  text-black border-slate-300',
  3: 'bg-orange-500 text-black border-orange-400',
};

export function LeaderboardView({ currentUserProfile, userStats, isLoggedIn, getLeaderboard, onLogin, onRegister }: LeaderboardViewProps) {
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>(MOCK);

  React.useEffect(() => {
    getLeaderboard('global').then(data => { if (data.length > 0) setLeaderboard(data); }).catch(() => {});
  }, [getLeaderboard]);

  /* ── NOT LOGGED IN ── */
  if (!isLoggedIn) {
    return (
      <div className="pt-24 pb-32">
        {/* Podium card */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {MOCK.slice(0, 3).map((entry, i) => (
            <div
              key={entry.id}
              className={cn('flex items-center gap-4 px-5 py-6', i < 2 && 'border-b border-white/10', i === 1 && 'bg-white/5')}
            >
              <div className={cn('w-11 h-11 rounded-full flex items-center justify-center font-bold text-base border-2 flex-shrink-0', medalStyle[entry.rank])}>
                {entry.rank}
              </div>
              <img src={entry.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/20 flex-shrink-0" referrerPolicy="no-referrer" />
              <div className="flex-1 h-3.5 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>

        {/* CTA text */}
        <p className="text-2xl font-semibold text-center leading-snug mt-8">
          Dispute com outras pessoas<br />nas Ligas!
        </p>

        {/* Buttons — fixed above navbar */}
        <div className="fixed bottom-32 left-0 right-0 z-10">
          <div className="max-w-md mx-auto px-6 space-y-3">
            <button onClick={onRegister} className="w-full py-5 rounded-2xl bg-sky-400 text-black font-bold uppercase tracking-widest text-sm active:scale-95 transition-transform">
              Criar Perfil
            </button>
            <button onClick={onLogin} className="w-full py-5 rounded-2xl border-2 border-white/20 text-sky-400 font-bold uppercase tracking-widest text-sm active:scale-95 transition-transform">
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── LOGGED IN ── */
  return (
    <div className="pt-6 pb-24 space-y-4">
      <h2 className="text-xl font-bold">Ligas</h2>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        {leaderboard.map((entry, i) => (
          <div
            key={entry.id}
            className={cn(
              'flex items-center gap-4 px-4 py-3',
              i < leaderboard.length - 1 && 'border-b border-white/10',
              i % 2 === 1 && 'bg-white/5',
              entry.id === currentUserProfile?.email && 'bg-brand-red/10',
            )}
          >
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 flex-shrink-0',
              medalStyle[entry.rank] ?? 'bg-white/10 text-white/60 border-white/20',
            )}>
              {entry.rank}
            </div>
            <img src={entry.avatarUrl} alt={entry.name} className="w-11 h-11 rounded-full object-cover border-2 border-white/20 flex-shrink-0" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm truncate">{entry.name}</p>
                {entry.id === currentUserProfile?.email && (
                  <Badge variant="outline" className="text-[8px] py-0 px-1 border-brand-red text-brand-red">VOCÊ</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white/40">Nível {entry.level}</span>
                <span className="text-[10px] text-orange-400 font-bold flex items-center gap-0.5"><Flame size={9} />{entry.streak}</span>
              </div>
            </div>
            <span className="text-sm font-bold whitespace-nowrap">
              {entry.xp.toLocaleString()} <span className="text-[10px] text-white/40 font-normal">XP</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
