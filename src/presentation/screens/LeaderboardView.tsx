import React from 'react';
import { Trophy, RefreshCw, Flame } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { LeaderboardEntry, UserProfile, UserStats } from '../../domain/entities';
import { cn } from '../../utils/cn';

interface LeaderboardViewProps {
  currentUserProfile: UserProfile | null;
  userStats: UserStats;
  getLeaderboard: (league: string) => Promise<LeaderboardEntry[]>;
}

export function LeaderboardView({ currentUserProfile, userStats, getLeaderboard }: LeaderboardViewProps) {
  const [activeTab, setActiveTab] = React.useState<'global' | 'league' | 'friends'>('global');
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const userLeague = userStats.league || 'Bronze';

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const leagueParam = activeTab === 'global' ? 'global' : (activeTab === 'friends' ? 'friends' : userLeague);
        const data = await getLeaderboard(leagueParam);
        
        if (data.length === 0) {
          // Fallback to mock data for demo if no real data in DB
          const mockData: LeaderboardEntry[] = Array.from({ length: 10 }).map((_, i) => ({
            id: `mock-${i}`,
            name: ['Lucas Oliveira', 'Mariana Costa', 'Pedro Santos', 'Ana Silva', 'João Pereira', 'Carla Dias', 'Bruno Lima', 'Sofia Rocha', 'Tiago Alves', 'Beatriz Cruz'][i],
            avatarUrl: `https://picsum.photos/seed/user${i + (activeTab === 'global' ? 100 : (activeTab === 'friends' ? 300 : 200))}/200`,
            xp: 15000 - (i * 1200),
            streak: 50 - (i * 4),
            level: 30 - (i * 2),
            rank: i + 1
          }));
          setLeaderboard(mockData);
        } else {
          setLeaderboard(data);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab, userLeague, getLeaderboard]);

  const getLeagueColor = (league: string) => {
    switch (league) {
      case 'Bronze': return 'text-orange-700';
      case 'Prata': return 'text-slate-400';
      case 'Ouro': return 'text-yellow-500';
      case 'Platina': return 'text-cyan-400';
      case 'Esmeralda': return 'text-emerald-500';
      case 'Diamante': return 'text-blue-500';
      default: return 'text-white';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Ranking</h2>
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('global')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'global' ? "bg-brand-red text-black" : "text-white/40"
              )}
            >
              Global
            </button>
            <button 
              onClick={() => setActiveTab('league')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'league' ? "bg-brand-red text-black" : "text-white/40"
              )}
            >
              Liga
            </button>
            <button 
              onClick={() => setActiveTab('friends')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'friends' ? "bg-brand-red text-black" : "text-white/40"
              )}
            >
              Amigos
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          {activeTab === 'league' && <Trophy size={14} className={getLeagueColor(userLeague)} />}
          <h3 className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            activeTab === 'league' ? getLeagueColor(userLeague) : "text-white/40"
          )}>
            {activeTab === 'global' && "Ranking Global"}
            {activeTab === 'league' && `Liga ${userLeague}`}
            {activeTab === 'friends' && "Ranking de Amigos"}
          </h3>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <RefreshCw className="animate-spin text-brand-red" size={32} />
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Carregando Ranking...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <Card 
              key={entry.id} 
              className={cn(
                "p-4 flex items-center gap-4 transition-all",
                entry.id === currentUserProfile?.email ? "border-brand-red/50 bg-brand-red/5" : "bg-white/5"
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-xs font-bold">
                {entry.rank}
              </div>
              
              <img 
                src={entry.avatarUrl} 
                alt={entry.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                referrerPolicy="no-referrer"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold truncate">{entry.name}</h4>
                  {entry.id === currentUserProfile?.email && (
                    <Badge variant="outline" className="text-[8px] py-0 px-1 border-brand-red text-brand-red">VOCÊ</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-white/40 font-medium">Nível {entry.level}</span>
                  <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold">
                    <Flame size={10} />
                    {entry.streak}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-bold">{entry.xp.toLocaleString()}</div>
                <div className="text-[8px] text-white/40 font-bold uppercase tracking-widest">XP Total</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Current User Fixed Bar if not in top 10 */}
      {!isLoading && !leaderboard.some(e => e.id === currentUserProfile?.email) && (
        <div className="fixed bottom-24 left-4 right-4 z-10">
          <Card className="p-4 flex items-center gap-4 bg-brand-red border-none shadow-2xl shadow-brand-red/20">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/20 text-xs font-bold text-black">
              12
            </div>
            
            <img 
              src={currentUserProfile?.avatarUrl} 
              alt={currentUserProfile?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-black/10"
              referrerPolicy="no-referrer"
            />
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold truncate text-black">{currentUserProfile?.name}</h4>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-black/60 font-bold">Nível {userStats.level}</span>
                <div className="flex items-center gap-1 text-[10px] text-black font-bold">
                  <Flame size={10} />
                  {userStats.streak}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-bold text-black">{(userStats.xp + (userStats.level - 1) * 1000).toLocaleString()}</div>
              <div className="text-[8px] text-black/60 font-bold uppercase tracking-widest">XP Total</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
