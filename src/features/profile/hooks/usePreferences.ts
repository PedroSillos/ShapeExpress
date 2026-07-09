import { useState, useEffect } from 'react';

/** All user-configurable preferences, persisted to localStorage. */
export interface UserPreferences {
  // Experiência de treino
  soundEffects: boolean;
  hapticFeedback: boolean;
  animations: boolean;
  motivationalMessages: boolean;
  // Social
  friendActivity: boolean;
  communityNotifications: boolean;
}

const STORAGE_KEY = 'se:preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  soundEffects: true,
  hapticFeedback: true,
  animations: true,
  motivationalMessages: true,
  friendActivity: true,
  communityNotifications: true,
};

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Hook for reading and updating user preferences.
 * Changes are persisted immediately to localStorage.
 */
export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Storage unavailable — silently ignore
    }
  }, [preferences]);

  function toggle(key: keyof UserPreferences) {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return { preferences, toggle };
}
