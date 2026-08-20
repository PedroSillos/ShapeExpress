/**
 * Returns the correct API base URL for the current platform.
 *
 * - Web (Vite): uses a relative path ("") so the Vite proxy `/api → localhost:3000` handles it.
 * - Android (Capacitor): the app runs as `capacitor://localhost`, so relative paths
 *   never reach the Express server. VITE_API_URL must be set to the production backend
 *   (e.g. https://shapeexpress.up.railway.app).
 *
 * Usage:
 *   fetch(`${getApiBaseUrl()}/api/store/claim-free`, { ... })
 */
export function getApiBaseUrl(): string {
  // VITE_API_URL is injected at build time. When running on Android the build
  // is done with this env var set (see .env.local).
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) {
    // Strip any trailing slash to keep URL construction consistent.
    return envUrl.replace(/\/$/, '');
  }
  // On web, use empty string so fetch('/api/...') resolves via the Vite proxy.
  return '';
}
