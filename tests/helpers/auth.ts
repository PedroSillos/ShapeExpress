import { Page } from '@playwright/test';

export async function logout(page: Page) {
  // If already on login screen, nothing to do
  if (await page.locator('text=/Entrar na Arena/i').isVisible({ timeout: 2000 }).catch(() => false)) return;

  // Use the signOut helper exposed by the app in DEV mode
  await page.evaluate(async () => {
    const fn = (window as any).__testSignOut;
    if (fn) await fn();
  });

  await page.waitForSelector('text=/Entrar na Arena/i', { timeout: 10000 });
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=/Entrar na Arena/i', { state: 'hidden', timeout: 15000 });
}
