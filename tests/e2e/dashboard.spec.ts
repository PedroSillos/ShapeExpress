import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../helpers/auth';

test.describe('Dashboard e Navegação', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.pedro.email, testUsers.pedro.password);
  });

  test('deve exibir dashboard após login', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/Dashboard|Bem-vindo|Treinos/i);
  });

  test('deve navegar para Workouts', async ({ page }) => {
    await page.click('text=/Treinos|Workouts/i');
    await expect(page.locator('body')).toContainText(/Treinos|Templates|Criar/i);
  });

  test('deve navegar para Stats', async ({ page }) => {
    await page.click('text=/Estatísticas|Stats/i');
    await expect(page.locator('body')).toContainText(/Estatísticas|Progresso|Gráfico/i);
  });

  test('deve navegar para Community', async ({ page }) => {
    await page.click('text=/Comunidade|Community/i');
    await expect(page.locator('body')).toContainText(/Comunidade|Feed|Ranking/i);
  });

  test('deve navegar para Profile', async ({ page }) => {
    await page.click('img[alt="Profile"]');
    await expect(page.locator('body')).toContainText(/Pedro|Perfil|Editar/i);
  });
});

test.describe('Dashboard Treinador', () => {
  test('deve exibir aba Students para treinador', async ({ page }) => {
    await login(page, testUsers.tiago.email, testUsers.tiago.password);
    
    await page.click('text=/Alunos|Students/i');
    await expect(page.locator('body')).toContainText(/Alunos|Students|Lista/i);
  });
});
