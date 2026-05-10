import { Page } from '@playwright/test';

export async function logout(page: Page) {
  const logoutBtn = page.locator('button:has(svg[data-lucide="log-out"]), button[aria-label*="logout" i], button[aria-label*="sair" i]');
  if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await logoutBtn.click();
  } else {
    // Navigate to profile and click the LogOut icon button
    await page.goto('/');
    const profileBtn = page.locator('img[alt="Profile"]');
    if (await profileBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await profileBtn.click();
      await page.locator('button:has(.lucide-log-out), button svg[class*="lucide-log-out"]').first().click();
    }
  }
  await page.waitForSelector('text=/Entrar na Arena/i', { timeout: 10000 });
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=/Entrar na Arena/i', { state: 'hidden', timeout: 15000 });
}
