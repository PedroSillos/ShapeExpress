import { Share2, Settings, Flame, Zap, Trophy, Dumbbell, UserPlus } from 'lucide-react';
import type { UserProfile, UserStats } from '../../../domain/entities';
import { cn } from '../../../utils/cn';

// Sport SVG icons — same mapping as DashboardView
import iconMusculacao from '@/src/assets/icons/icon-musculacao.svg';
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconCorrida from '@/src/assets/icons/icon-corrida.svg';
import iconCiclismo from '@/src/assets/icons/icon-ciclismo.svg';
import iconNatacao from '@/src/assets/icons/icon-natacao.svg';
import iconCrossfit from '@/src/assets/icons/icon-crossfit.svg';
import iconTriatlo from '@/src/assets/icons/icon-triatlo.svg';

const SPORT_ICONS: Record<string, string> = {
  'Musculação':     iconMusculacao,
  'Halterofilismo': iconHalterofilismo,
  'Corrida':        iconCorrida,
  'Ciclismo':       iconCiclismo,
  'Natação':        iconNatacao,
  'Crossfit':       iconCrossfit,
  'Triatlo':        iconTriatlo,
};

interface ProfileUserViewProps {
  userProfile: UserProfile;
  userStats: UserStats;
  streak: number;
  sports: string[];
  friendsCount: number;
  onAddFriends?: () => void;
  onSettings?: () => void;
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
function StatChip({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-white text-lg font-bold">{value}</span>
      <div className="flex items-center gap-1 text-white/40">
        {icon}
        <span className="text-[11px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
    </div>
  );
}

// ─── Achievement badge ────────────────────────────────────────────────────────
function AchievementBadge({
  icon,
  count,
  color,
  locked = false,
}: {
  icon: React.ReactNode;
  count?: number;
  color: string;
  locked?: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          locked ? 'bg-white/5' : '',
        )}
        style={locked ? undefined : { backgroundColor: color + '22', border: `2px solid ${color}44` }}
      >
        <div className={cn('text-2xl', locked && 'opacity-20')}>{icon}</div>
      </div>
      {!locked && count !== undefined && (
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full text-dark-surface"
          style={{ backgroundColor: color }}
        >
          {count >= 1000 ? `${(count / 1000).toFixed(0)}k` : count}
        </span>
      )}
    </div>
  );
}

export function ProfileUserView({
  userProfile,
  userStats,
  streak,
  sports,
  friendsCount,
  onAddFriends,
  onSettings,
}: ProfileUserViewProps) {
  const joinYear = new Date().getFullYear();

  // Name: use filled name; fall back to userType label only if name is truly empty
  const rawName = userProfile.name?.trim();
  const fallbackName = userProfile.userType === 'treinador' ? 'Treinador' : 'Atleta';
  const displayName = rawName || fallbackName;

  // @handle: derived from email, shown even while name loads
  // e.g. "pedro.sillos@gmail.com" → "@pedro.sillos"
  const emailHandle = userProfile.email?.split('@')[0]?.trim() ?? '';

  const level = userStats.level ?? 1;
  const xp = userStats.xp ?? 0;
  const totalWorkouts = userStats.totalWorkouts ?? 0;

  // Primary sport SVG icon for overview row
  const primarySport = sports[0] ?? '';
  const sportIconSrc = SPORT_ICONS[primarySport] ?? iconMusculacao;

  return (
    <div className="min-h-screen bg-dark-surface flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <h1 className="text-white text-2xl font-extrabold">{displayName}</h1>
        <div className="flex items-center gap-4">
          <button aria-label="Compartilhar" className="text-white/50 hover:text-white/80 transition-colors">
            <Share2 size={22} />
          </button>
          <button
            aria-label="Configurações"
            className="text-white/50 hover:text-white/80 transition-colors"
            onClick={onSettings}
          >
            <Settings size={22} />
          </button>
        </div>
      </div>

      {/* ── Avatar hero ── */}
      <div className="bg-white/5 mx-4 rounded-2xl overflow-hidden flex items-center justify-center py-8">
        {userProfile.avatarUrl ? (
          <img
            src={userProfile.avatarUrl}
            alt={displayName}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-white/10"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center text-4xl font-extrabold text-white/40">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* ── @username + year ── */}
      <div className="px-4 mt-4">
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
          {emailHandle ? `@${emailHandle} · Desde ${joinYear}` : `Desde ${joinYear}`}
        </p>
      </div>

      {/* ── Sports tags ── */}
      {sports.length > 0 && (
        <div className="px-4 mt-2 flex flex-wrap gap-1.5">
          {sports.map((s) => (
            <span
              key={s}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* ── Stats row: modalidades · amigos ── */}
      <div className="px-4 mt-4 flex items-center justify-around">
        <StatChip
          icon={<Dumbbell size={12} />}
          value={sports.length}
          label="Modalidades"
        />
        <div className="w-px h-8 bg-white/10" />
        <StatChip
          icon={<UserPlus size={12} />}
          value={friendsCount}
          label="Amigos"
        />
      </div>

      {/* ── Add friends button ── */}
      <div className="px-4 mt-4">
        <button
          onClick={onAddFriends}
          className="w-full flex items-center justify-center gap-2 border border-white/20 rounded-2xl py-3 text-white/80 font-semibold text-sm hover:bg-white/5 active:bg-white/10 transition-colors"
        >
          <UserPlus size={16} />
          Adicionar Amigos
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mt-5 border-t border-white/10" />

      {/* ── Overview ── */}
      <div className="px-4 mt-5">
        <p className="text-white/40 text-[11px] font-extrabold uppercase tracking-widest mb-3">Visão Geral</p>
        <div className="grid grid-cols-2 gap-y-4">
          {/* X dias */}
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-500" />
            <span className="text-white font-bold text-sm">{streak} dias</span>
          </div>
          {/* SVG ícone da modalidade + nível de experiência */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <img
                src={sportIconSrc}
                alt={primarySport}
                className="w-full h-full object-contain brightness-0 invert opacity-80"
              />
            </div>
            <span className="text-white font-bold text-sm">
              {userProfile.experienceLevel ?? 'Iniciante'}
            </span>
          </div>
          {/* Nível X */}
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-purple-400" />
            <span className="text-white font-bold text-sm">Nível {level}</span>
          </div>
          {/* X XP */}
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" />
            <span className="text-white font-bold text-sm">{xp.toLocaleString('pt-BR')} XP</span>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mt-5 border-t border-white/10" />

      {/* ── Conquistas ── */}
      <div className="px-4 mt-5">
        <p className="text-white/40 text-[11px] font-extrabold uppercase tracking-widest mb-3">Conquistas</p>
        <div className="flex items-center gap-4">
          {totalWorkouts >= 1 && (
            <AchievementBadge icon={<Dumbbell size={20} />} count={totalWorkouts} color="#EF4444" />
          )}
          {streak >= 1 && (
            <AchievementBadge icon={<Flame size={20} />} count={streak} color="#FF9600" />
          )}
          {xp >= 100 && (
            <AchievementBadge icon={<Zap size={20} />} count={xp} color="#FFD700" />
          )}
          {level >= 5 && (
            <AchievementBadge icon={<Trophy size={20} />} count={level} color="#9B59B6" />
          )}
          {[...Array(Math.max(0, 4 - [totalWorkouts >= 1, streak >= 1, xp >= 100, level >= 5].filter(Boolean).length))].map(
            (_, i) => (
              <AchievementBadge key={i} icon={<Trophy size={20} />} color="#fff" locked />
            ),
          )}
        </div>
      </div>

      {/* Bottom padding so content clears nav bar */}
      <div className="h-28" />
    </div>
  );
}
