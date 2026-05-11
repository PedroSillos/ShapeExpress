import { Page } from '@playwright/test';

export async function logout(page: Page) {
  // Wait for app to settle: either login screen or logged-in header
  const loginBtn = page.locator('text=/Entrar na Arena/i');
  const headerAvatar = page.locator('button:has(img[alt="Profile"])');

  await Promise.race([
    loginBtn.waitFor({ state: 'visible', timeout: 15000 }),
    headerAvatar.waitFor({ state: 'visible', timeout: 15000 }),
  ]);

  // Already on login screen — nothing to do
  if (await loginBtn.isVisible({ timeout: 500 }).catch(() => false)) return;

  // Navigate to profile and click logout
  const directBtn = page.locator('[data-testid="btn-logout"]');
  if (!await directBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await headerAvatar.click();
    // After clicking avatar, wait for either profile screen or login screen
    await Promise.race([
      page.locator('[data-testid="btn-logout"]').waitFor({ state: 'visible', timeout: 5000 }),
      loginBtn.waitFor({ state: 'visible', timeout: 5000 }),
    ]).catch(() => {});
  }

  // If we ended up on login screen (e.g. CI behaviour after register), we're done
  if (await loginBtn.isVisible({ timeout: 500 }).catch(() => false)) return;

  await page.locator('[data-testid="btn-logout"]').click();
  await page.locator('[data-testid="btn-confirm-logout"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('[data-testid="btn-confirm-logout"]').click();
  await page.waitForSelector('text=/Entrar na Arena/i', { timeout: 10000 });
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=/Entrar na Arena/i', { state: 'hidden', timeout: 15000 });
}
