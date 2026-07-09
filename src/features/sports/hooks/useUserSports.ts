import { useState } from 'react';
import type { UserProfile } from '@/src/domain/entities';

/**
 * Reads and writes the user's selected sports (modalidades).
 *
 * Both athletes and trainers store their sports in `UserProfile.specialties`,
 * which is persisted to Firestore via `onUpdateProfile`.
 */
export function useUserSports(
  userProfile: UserProfile,
  onUpdateProfile: (p: UserProfile) => Promise<void>,
) {
  const [sports, setSports] = useState<string[]>(
    () => userProfile?.specialties ?? [],
  );

  async function addSport(id: string) {
    if (sports.includes(id)) return;
    const next = [...sports, id];
    await persist(next);
    setSports(next);
  }

  async function removeSport(id: string) {
    if (sports.length <= 1) return; // keep at least one
    const next = sports.filter((s) => s !== id);
    await persist(next);
    setSports(next);
  }

  async function persist(next: string[]) {
    await onUpdateProfile({ ...userProfile, specialties: next });
  }

  return { sports, addSport, removeSport };
}
