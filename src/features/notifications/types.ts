/** A single notification toggle item inside a category. */
export interface NotificationItem {
  key: string;
  label: string;
}

/** A group of notification toggles displayed as a settings category. */
export interface NotificationCategory {
  id: string;
  /** Category title shown in the list, e.g. "Lembretes". */
  title: string;
  /** Short description shown below the title in the category list. */
  description: string;
  /** All toggle items belonging to this category. */
  items: NotificationItem[];
}

/**
 * Flat map of all notification toggle states.
 * Key = NotificationItem.key, value = enabled/disabled.
 */
export type NotificationSettings = Record<string, boolean>;
