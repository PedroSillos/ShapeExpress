/**
 * Sport XP / Level calculations.
 *
 * Rules (aligned with UserStats.sportXp):
 *   - Each completed workout grants 100 XP to its sport.
 *   - Level formula: floor(xp / 1000) + 1  (starts at level 1 with 0 XP).
 *   - The global `xp` field on UserStats is the sum of all sportXp values.
 *   - The global `level` is derived from that same sum.
 */

export const SPORT_XP_PER_WORKOUT = 100;
export const SPORT_XP_PER_LEVEL   = 1000;

/**
 * Returns the level (1-based) for a given XP amount.
 * @example calcSportLevel(0)    → 1
 * @example calcSportLevel(999)  → 1
 * @example calcSportLevel(1000) → 2
 * @example calcSportLevel(2500) → 3
 */
export function calcSportLevel(xp: number): number {
  return Math.floor(Math.max(0, xp) / SPORT_XP_PER_LEVEL) + 1;
}

/**
 * Returns the accumulated XP for a given sport, defaulting to 0.
 */
export function getSportXp(
  sportXp: Record<string, number> | undefined,
  sport: string,
): number {
  return sportXp?.[sport] ?? 0;
}

/**
 * Returns the level (1-based) for a given sport.
 */
export function getSportLevel(
  sportXp: Record<string, number> | undefined,
  sport: string,
): number {
  return calcSportLevel(getSportXp(sportXp, sport));
}

/**
 * Produces updated stats after completing a workout for `sport`.
 * - Adds SPORT_XP_PER_WORKOUT to sportXp[sport].
 * - Recomputes the global xp as the sum of all sport XP values.
 * - Recomputes the global level from the new global xp.
 */
export function addSportXp(
  stats: { xp: number; level: number; sportXp?: Record<string, number> },
  sport: string,
): { xp: number; level: number; sportXp: Record<string, number> } {
  const prevSportXp  = stats.sportXp ?? {};
  const prevForSport = prevSportXp[sport] ?? 0;

  const newSportXp: Record<string, number> = {
    ...prevSportXp,
    [sport]: prevForSport + SPORT_XP_PER_WORKOUT,
  };

  // Global XP = sum of all sport XP
  const newGlobalXp = Object.values(newSportXp).reduce((sum, v) => sum + v, 0);
  const newLevel    = calcSportLevel(newGlobalXp);

  return { xp: newGlobalXp, level: newLevel, sportXp: newSportXp };
}
