import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  reporter: [['list', { printSteps: true }]],
  projects: [
    {
      name: 'web',
      testMatch: '**/auth.spec.ts',
      use: { baseURL: 'http://localhost:5173', headless: true },
    },
    {
      name: 'android',
      testMatch: '**/android.spec.ts',
    },
  ],
  webServer: {
    command: 'npx vite',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
