import { useState, useEffect } from 'react';
import type { NotificationSettings, NotificationCategory } from '../types';

const STORAGE_KEY = 'se:notification-settings';

/** All notification categories with their toggle items. */
export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: 'lembretes',
    title: 'Lembretes',
    description: 'Lembretes diários de treino e sequência',
    items: [
      { key: 'reminder_daily_practice', label: 'Lembrete de treino diário' },
      { key: 'reminder_streak', label: 'Não quebre sua sequência' },
      { key: 'reminder_weekly_goal', label: 'Meta semanal em risco' },
    ],
  },
  {
    id: 'amigos',
    title: 'Amigos',
    description: 'Novos seguidores e conquistas de amigos',
    items: [
      { key: 'friends_new_follower', label: 'Novo seguidor' },
      { key: 'friends_achievement', label: 'Conquista de amigo' },
    ],
  },
  {
    id: 'nudges',
    title: 'Nudges de Amigos',
    description: 'Lembretes enviados por amigos',
    items: [
      { key: 'nudge_received', label: 'Receber nudge de amigo' },
    ],
  },
  {
    id: 'comunicados',
    title: 'Comunicados',
    description: 'Novidades, promoções e eventos',
    items: [
      { key: 'announcements_features', label: 'Novas funcionalidades' },
      { key: 'announcements_promotions', label: 'Promoções e ofertas' },
      { key: 'announcements_events', label: 'Eventos e competições' },
    ],
  },
];

/** Build default settings: all notifications enabled. */
function buildDefaults(): NotificationSettings {
  const defaults: NotificationSettings = {};
  for (const category of NOTIFICATION_CATEGORIES) {
    for (const item of category.items) {
      defaults[item.key] = true;
    }
  }
  return defaults;
}

function loadSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaults();
    return { ...buildDefaults(), ...JSON.parse(raw) };
  } catch {
    return buildDefaults();
  }
}

/**
 * Hook for reading and updating per-item notification settings.
 * Changes are persisted immediately to localStorage.
 */
export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(loadSettings);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable — silently ignore
    }
  }, [settings]);

  function toggle(key: string) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  /** Count how many items are disabled in a given category. */
  function disabledCount(categoryId: string): number {
    const category = NOTIFICATION_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return 0;
    return category.items.filter((item) => !settings[item.key]).length;
  }

  return { settings, toggle, disabledCount };
}
