import { Settings, Flame, Zap, Trophy, Dumbbell, UserPlus } from 'lucide-react';
import type { UserProfile, UserStats } from '../../../domain/entities';
import { fullName } from '../../../domain/entities';

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

  // Name: use filled firstName; fall back to email prefix, then userType label
  const rawName = fullName(userProfile).trim();
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

      {/* ── Header cinza claro: name + avatar + settings ── */}
      <div className="bg-gray-200 -mx-6 px-6 pb-30 relative">
        {/* Top bar: name + settings */}
        <div className="flex items-center justify-between pt-8 pb-6">
          <h1 className="text-[1.625rem] font-extrabold" style={{ color: '#4C4C4C' }}>{displayName}</h1>
          <button
            aria-label="Configurações"
            className="transition-opacity hover:opacity-70"
            style={{ color: '#4C4C4C' }}
            onClick={onSettings}
          >
            <Settings size={24} />
          </button>
        </div>

        {/* Avatar grande - posicionado na base do container */}
        <div className="flex justify-center absolute bottom-0 left-0 right-0">
          <div 
            className="w-40 h-30 rounded-t-3xl flex items-center justify-center text-6xl font-extrabold text-white"
            style={{ backgroundColor: sportColor }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Info bar: @handle · joined ── */}
      <div className="bg-dark-card py-4 px-6 -mx-6 flex items-center justify-center gap-3">
        {emailHandle && (
          <>
            <span className="text-white/60 text-sm font-semibold">@{emailHandle}</span>
            <span className="text-white/30">·</span>
          </>
        )}
        <span className="text-white/60 text-sm font-semibold uppercase tracking-wide">Desde {joinYear}</span>
      </div>

      {/* ── Stats row: modalidades · seguindo · amigos ── */}
      <div className="flex items-center justify-around py-6 px-4">
        <div className="flex flex-col items-center">
          <span className="text-white text-3xl font-extrabold">{sports.length}</span>
          <span className="text-white/50 text-sm font-semibold mt-1">Modalidades</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-white text-3xl font-extrabold">{totalWorkouts}</span>
          <span className="text-white/50 text-sm font-semibold mt-1">Treinos</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-white text-3xl font-extrabold">{friendsCount}</span>
          <span className="text-white/50 text-sm font-semibold mt-1">Amigos</span>
        </div>
      </div>

      {/* ── Adicionar amigos button ── */}
      <div className="px-4">
        <button
          onClick={onAddFriends}
          className="w-full flex items-center justify-center gap-2 bg-white/10 rounded-2xl py-4 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/15 active:bg-white/20 transition-colors"
        >
          <UserPlus size={18} />
          Adicionar amigos
        </button>
      </div>

      {/* ── Overview ── */}
      <div className="px-4 mt-8">
        <p className="text-white/40 text-xs font-extrabold uppercase tracking-widest mb-4">Overview</p>
        <div className="grid grid-cols-2 gap-y-5">
          <div className="flex items-center gap-2.5">
            <Flame size={20} className="text-orange-500" />
            <span className="text-white font-bold">{streak} dias</span>
          </div>
          <div className="flex items-center gap-2.5">
            <img
              src={sportIconSrc}
              alt={primarySport}
              className="w-5 h-5 object-contain"
              style={{ filter: sportFilter }}
            />
            <span className="text-white font-bold">
              {userProfile.experienceLevel ?? 'Iniciante'}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Trophy size={20} className="text-purple-400" />
            <span className="text-white font-bold">Nível {level}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Zap size={20} className="text-yellow-400" />
            <span className="text-white font-bold">{xp.toLocaleString('pt-BR')} XP</span>
          </div>
        </div>
      </div>

      {/* Bottom padding so content clears nav bar */}
      <div className="h-28" />
    </div>
  );
}
