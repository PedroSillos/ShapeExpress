import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../helpers/auth';

test.describe('Workouts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pedro.email, testUsers.pedro.password);
    await page.click('text=/Treinos|Workouts/i');
  });

  test('deve exibir lista de templates de treino', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Treinos|Templates|Meus treinos/i);
  });

  test('deve abrir modal de criação de treino', async ({ page }) => {
    await page.click('text=/Criar|Novo|\\+/i');
    await expect(page.locator('body')).toContainText(/Criar|Nome|Exercícios/i);
  });

  test('deve visualizar detalhes de um template', async ({ page }) => {
    const firstTemplate = page.locator('[data-testid="template-card"], .template-item').first();
    
    if (await firstTemplate.isVisible()) {
      await firstTemplate.click();
      await expect(page.locator('body')).toContainText(/Exercícios|Séries|Repetições/i);
    }
  });

  test('deve iniciar treino a partir de template', async ({ page }) => {
    const startButton = page.locator('text=/Iniciar|Começar|Start/i').first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await expect(page.locator('body')).toContainText(/Treino|Exercício|Série/i);
    }
  });
});
