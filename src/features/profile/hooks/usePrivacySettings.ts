import { useState, useEffect } from 'react';

/** All user-configurable privacy settings, persisted to localStorage. */
export interface PrivacySettings {
  /** Allow tracking and personalization for advertising. */
  informationCollection: boolean;
  /** Allow anyone (not just followers) to see activity on their Feed. */
  shareActivityWithAnyone: boolean;
}

const STORAGE_KEY = 'se:privacy-settings';

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  informationCollection: false,
  shareActivityWithAnyone: true,
};

function loadSettings(): PrivacySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRIVACY_SETTINGS;
    return { ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRIVACY_SETTINGS;
  }
}

/**
 * Hook for reading and updating privacy settings.
 * Changes are persisted immediately to localStorage.
 */
export function usePrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings>(loadSettings);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable — silently ignore
    }
  }, [settings]);

  function toggle(key: keyof PrivacySettings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return { settings, toggle };
}
