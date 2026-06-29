import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Requests the OS-level notification permission popup.
 * On Android 13+ and iOS this triggers the native system dialog.
 * On web (non-Capacitor) it falls back to the browser Notifications API.
 *
 * @returns true if permission was granted, false otherwise.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // Native Android / iOS
  if (Capacitor.isNativePlatform()) {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }

  // Web fallback
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
