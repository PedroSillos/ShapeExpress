// Default sport avatars for user profiles
// Each avatar is a single emoji representation of a sport

export const SPORT_AVATARS = [
  // Strength & Gym
  { id: 'bodybuilding', emoji: '💪', name: 'Fisiculturismo', color: '#EF4444' },
  { id: 'weightlifting', emoji: '🏋️', name: 'Levantamento de Peso', color: '#F59E0B' },
  { id: 'powerlifting', emoji: '⚡', name: 'Powerlifting', color: '#DC2626' },
  
  // Cardio & Endurance
  { id: 'running', emoji: '🏃', name: 'Corrida', color: '#10B981' },
  { id: 'cycling', emoji: '🚴', name: 'Ciclismo', color: '#3B82F6' },
  { id: 'swimming', emoji: '🏊', name: 'Natação', color: '#06B6D4' },
  
  // Combat Sports
  { id: 'boxing', emoji: '🥊', name: 'Boxe', color: '#DC2626' },
  
  // Ball Sports
  { id: 'volleyball', emoji: '🏐', name: 'Vôlei', color: '#EAB308' },
  { id: 'tennis', emoji: '🎾', name: 'Tênis', color: '#84CC16' },
  
  // Other Sports
  { id: 'climbing', emoji: '🧗', name: 'Escalada', color: '#8B5CF6' },
  { id: 'skateboarding', emoji: '🛹', name: 'Skate', color: '#6366F1' },
] as const;

export type SportAvatarId = typeof SPORT_AVATARS[number]['id'];

/**
 * Get a random sport avatar
 */
export function getRandomSportAvatar() {
  const randomIndex = Math.floor(Math.random() * SPORT_AVATARS.length);
  return SPORT_AVATARS[randomIndex];
}

/**
 * Get sport avatar by ID
 */
export function getSportAvatarById(id: SportAvatarId) {
  return SPORT_AVATARS.find(avatar => avatar.id === id);
}

/**
 * Generate avatar URL from sport avatar
 * Creates a data URL with a single emoji and background color
 */
export function generateAvatarUrl(avatar: typeof SPORT_AVATARS[number]): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Background — white or black based on contrast with the avatar color
  const hex = avatar.color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Complementary color (maximum contrast)
  ctx.fillStyle = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
  ctx.fillRect(0, 0, 400, 400);

  // Single emoji — centered
  ctx.font = '220px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(avatar.emoji, 200, 210);
  
  return canvas.toDataURL('image/png');
}
