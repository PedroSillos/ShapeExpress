import { Page } from '@playwright/test';

export async function logout(page: Page) {
  // Wait for the app to settle: either logged in (header visible) or already logged out
  const loginBtn = page.locator('text=/Entrar na Arena/i');
  const headerAvatar = page.locator('button:has(img[alt="Profile"])');

  await Promise.race([
    loginBtn.waitFor({ state: 'visible', timeout: 15000 }),
    headerAvatar.waitFor({ state: 'visible', timeout: 15000 }),
  ]);

  // If already on login screen, nothing to do
  if (await loginBtn.isVisible({ timeout: 500 }).catch(() => false)) return;

  // Try direct logout button first (visible if already on profile screen)
  const directBtn = page.locator('[data-testid="btn-logout"]');
  if (await directBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await directBtn.click();
  } else {
    await headerAvatar.click();
    await page.locator('[data-testid="btn-logout"]').waitFor({ state: 'visible', timeout: 8000 });
    await page.locator('[data-testid="btn-logout"]').click();
  }

  // Confirm the logout modal
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
