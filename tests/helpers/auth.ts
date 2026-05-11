import { Page } from '@playwright/test';

export async function logout(page: Page) {
  // If already on login screen, nothing to do
  if (await page.locator('text=/Entrar na Arena/i').isVisible({ timeout: 2000 }).catch(() => false)) return;

  // Wait for __testSignOut to be available (async import in firebase.ts)
  await page.waitForFunction(() => typeof (window as any).__testSignOut === 'function', { timeout: 10000 });

  // Call Firebase signOut directly in the browser context
  await page.evaluate(async () => { await (window as any).__testSignOut(); });

  // Wait for loading spinner to disappear, then wait for login screen
  await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.waitForSelector('text=/Entrar na Arena/i', { timeout: 15000 });
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=/Entrar na Arena/i', { state: 'hidden', timeout: 15000 });
}
