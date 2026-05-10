import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 600000,
  reporter: [['list', { printSteps: true }]],
  projects: [
    {
      name: 'login',
      testMatch: '**/auth.spec.ts',
      use: { baseURL: 'http://localhost:5173', headless: true },
    },
    {
      name: 'android',
      testMatch: '**/android.spec.ts',
    },
    {
      name: 'e2e',
      testMatch: '**/e2e.spec.ts',
      use: { baseURL: 'http://localhost:5173', headless: true },
    },
  ],
  webServer: {
    command: 'npx vite',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
