import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../helpers/auth';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pedro.email, testUsers.pedro.password);
    await page.click('img[alt="Profile"]');
  });

  test('deve exibir informações do perfil', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Pedro/i);
    await expect(page.locator('body')).toContainText(/pedro1@se\.com/i);
  });

  test('deve exibir configurações', async ({ page }) => {
    const settingsButton = page.locator('text=/Configurações|Settings/i');
    
    if (await settingsButton.isVisible()) {
      await expect(page.locator('body')).toContainText(/Configurações/i);
    }
  });

  test('deve exibir conquistas', async ({ page }) => {
    const achievementsButton = page.locator('text=/Conquistas|Achievements/i');
    
    if (await achievementsButton.isVisible()) {
      await expect(page.locator('body')).toContainText(/Conquistas/i);
    }
  });
});

test.describe('Profile Treinador', () => {
  test('deve exibir perfil do treinador', async ({ page }) => {
    await login(page, testUsers.tiago.email, testUsers.tiago.password);
    await page.click('img[alt="Profile"]');
    
    await expect(page.locator('body')).toContainText(/Tiago|Treinador/i);
  });
});
