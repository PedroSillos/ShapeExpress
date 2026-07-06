import { Settings, Flame, Zap, Trophy, Dumbbell, UserPlus } from 'lucide-react';
import type { UserProfile, UserStats } from '../../../domain/entities';

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

/** Brand color per sport — mirrors DashboardView SPORT_COLORS */
const SPORT_COLORS: Record<string, string> = {
  'Musculação':     '#dc2626',
  'Crossfit':       '#ea580c',
  'Corrida':        '#ca8a04',
  'Yoga':           '#16a34a',
  'Natação':        '#2563eb',
  'Ciclismo':       '#0891b2',
  'Halterofilismo': '#7c3aed',
  'Triatlo':        '#db2777',
};

/**
 * Pre-calculated CSS filters to tint a black SVG to the target color.
 * Generated via https://codepen.io/sosuke/pen/Pjoqqp (Sovran algorithm).
 * Each entry targets its SPORT_COLORS value above.
 */
const SPORT_FILTERS: Record<string, string> = {
  '#dc2626': 'brightness(0) saturate(100%) invert(22%) sepia(96%) saturate(2276%) hue-rotate(347deg) brightness(95%) contrast(98%)',
  '#ea580c': 'brightness(0) saturate(100%) invert(38%) sepia(99%) saturate(1200%) hue-rotate(12deg) brightness(98%) contrast(103%)',
  '#ca8a04': 'brightness(0) saturate(100%) invert(50%) sepia(88%) saturate(700%) hue-rotate(20deg) brightness(97%) contrast(102%)',
  '#16a34a': 'brightness(0) saturate(100%) invert(44%) sepia(74%) saturate(490%) hue-rotate(98deg) brightness(94%) contrast(95%)',
  '#2563eb': 'brightness(0) saturate(100%) invert(30%) sepia(99%) saturate(1200%) hue-rotate(215deg) brightness(97%) contrast(103%)',
  '#0891b2': 'brightness(0) saturate(100%) invert(36%) sepia(87%) saturate(700%) hue-rotate(175deg) brightness(96%) contrast(97%)',
  '#7c3aed': 'brightness(0) saturate(100%) invert(25%) sepia(89%) saturate(1800%) hue-rotate(256deg) brightness(90%) contrast(102%)',
  '#db2777': 'brightness(0) saturate(100%) invert(24%) sepia(95%) saturate(1500%) hue-rotate(316deg) brightness(95%) contrast(98%)',
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

  // @handle: derived from email, shown even while name loads
  // e.g. "pedro.sillos@gmail.com" → "@pedro.sillos"
  const emailHandle = userProfile.email?.split('@')[0]?.trim() ?? '';

  // Name: use filled name; fall back to email prefix, then userType label
  const rawName = userProfile.name?.trim();
  const fallbackName = userProfile.userType === 'treinador' ? 'Treinador' : 'Atleta';
  const displayName = rawName || emailHandle || fallbackName;

  const level = userStats.level ?? 1;
  const xp = userStats.xp ?? 0;
  const totalWorkouts = userStats.totalWorkouts ?? 0;

  // Primary sport SVG icon + color for overview row
  const primarySport = sports[0] ?? '';
  const sportIconSrc = SPORT_ICONS[primarySport] ?? iconMusculacao;
  const sportColor = SPORT_COLORS[primarySport] ?? '#dc2626';
  const sportFilter = SPORT_FILTERS[sportColor] ?? SPORT_FILTERS['#dc2626'];

  return (
    <div className="min-h-screen bg-dark-surface flex flex-col">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden px-5 pt-12 pb-20">

        {/* Top row: name + settings */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white text-3xl font-extrabold leading-tight">{displayName}</h1>
            {emailHandle && (
              <p className="text-white/60 text-sm font-medium mt-0.5">
                @{emailHandle} · Desde {joinYear}
              </p>
            )}
          </div>
          <button
            aria-label="Configurações"
            className="text-white/70 hover:text-white transition-colors mt-1"
            onClick={onSettings}
          >
            <Settings size={22} />
          </button>
        </div>
      </div>

      {/* ── Avatar — overlaps header bottom edge ── */}
      <div className="flex justify-center -mt-14 z-10">
        {userProfile.avatarUrl ? (
          <img
            src={userProfile.avatarUrl}
            alt={displayName}
            className="w-28 h-28 rounded-full object-cover"
            style={{ boxShadow: `0 0 0 4px ${sportColor}` }}
          />
        ) : (
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-extrabold text-white"
            style={{ backgroundColor: sportColor, boxShadow: `0 0 0 4px ${sportColor}99` }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* ── Stats row: modalidades · amigos ── */}
      <div className="px-4 mt-5 flex items-center justify-around">
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
            <img
              src={sportIconSrc}
              alt={primarySport}
              className="w-5 h-5 object-contain"
              style={{ filter: sportFilter }}
            />
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

      {/* Bottom padding so content clears nav bar */}
      <div className="h-28" />
    </div>
  );
}
