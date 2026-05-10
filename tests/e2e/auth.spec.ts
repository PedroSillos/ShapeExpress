import { test, expect } from '@playwright/test';
import { testUser } from '../fixtures/users';
import { login, logout } from '../helpers/auth';

test('login', async ({ page }) => {
  await page.goto('/');

  // Logout if a session is already active
  const isLoggedIn = await page.locator('text=/Entrar na Arena/i').isVisible({ timeout: 3000 }).then(v => !v).catch(() => false);
  if (isLoggedIn) {
    await logout(page);
  }

  await login(page, testUser.email, testUser.password);

  await expect(page.locator('body')).not.toContainText(/Entrar na Arena/i);
});
