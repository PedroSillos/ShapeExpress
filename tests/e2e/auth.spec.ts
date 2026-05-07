import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../helpers/auth';

test.describe('Autenticação', () => {
  test('deve fazer login com Pedro (atleta)', async ({ page }) => {
    await login(page, testUsers.pedro.email, testUsers.pedro.password);
    
    await expect(page.locator('body')).toContainText(/Pedro|Dashboard/i);
  });

  test('deve fazer login com Tiago (treinador)', async ({ page }) => {
    await login(page, testUsers.tiago.email, testUsers.tiago.password);
    
    await expect(page.locator('body')).toContainText(/Tiago|Dashboard/i);
  });

  test('deve falhar com credenciais inválidas', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'invalido@se.com');
    await page.fill('input[type="password"]', 'SenhaErrada123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('body')).toContainText(/erro|inválid|incorret/i);
  });
});
