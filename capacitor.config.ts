import type { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT — Android API calls:
// Relative fetch paths (e.g. "/api/...") do not work in Capacitor because the
// app runs under the capacitor:// scheme, not a real HTTP origin with a proxy.
//
// Before running `npm run android`, make sure your .env.local contains:
//   VITE_API_URL=https://<your-railway-backend>.up.railway.app
//
// The src/utils/apiUrl.ts helper reads this at build time and prepends it to
// every API call. On web the value is empty so the Vite proxy takes over.

const config: CapacitorConfig = {
  appId: 'com.shapeexpress.app',
  appName: 'Shape Express',
  webDir: 'dist',
};

export default config;
