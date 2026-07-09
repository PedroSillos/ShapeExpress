import iconMusculacao from '@/src/assets/icons/icon-musculacao.svg';
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconCorrida from '@/src/assets/icons/icon-corrida.svg';
import iconCiclismo from '@/src/assets/icons/icon-ciclismo.svg';
import iconNatacao from '@/src/assets/icons/icon-natacao.svg';
import iconCrossfit from '@/src/assets/icons/icon-crossfit.svg';
import iconTriatlo from '@/src/assets/icons/icon-triatlo.svg';
import iconYoga from '@/src/assets/icons/icon-yoga.svg';
import type { SportOption } from './types';

/**
 * Canonical list of available sports.
 * IDs match the strings stored in welcome-answers.sports and UserProfile.specialties.
 */
export const ALL_SPORTS: SportOption[] = [
  { id: 'Musculação',     label: 'Musculação',     icon: iconMusculacao,     bg: '#dc2626' },
  { id: 'Crossfit',       label: 'Crossfit',       icon: iconCrossfit,       bg: '#ea580c' },
  { id: 'Corrida',        label: 'Corrida',        icon: iconCorrida,        bg: '#ca8a04' },
  { id: 'Yoga',           label: 'Yoga',           icon: iconYoga,           bg: '#16a34a' },
  { id: 'Natação',        label: 'Natação',        icon: iconNatacao,        bg: '#2563eb' },
  { id: 'Ciclismo',       label: 'Ciclismo',       icon: iconCiclismo,       bg: '#0891b2' },
  { id: 'Halterofilismo', label: 'Halterofilismo', icon: iconHalterofilismo, bg: '#7c3aed' },
  { id: 'Triatlo',        label: 'Triatlo',        icon: iconTriatlo,        bg: '#db2777' },
];
