import { test, expect } from '@playwright/test';
import { testUser } from '../fixtures/users';
import { login, logout } from '../helpers/auth';

test('login', async ({ page }) => {
  await test.step('Abre a página inicial', () => page.goto('/'));

  const isLoggedIn = await page.locator('text=/Entrar na Arena/i').isVisible({ timeout: 3000 }).then(v => !v).catch(() => false);

  if (isLoggedIn) {
    await test.step('Sessão ativa detectada — fazendo logout', () => logout(page));
  }

  await test.step(`Digita o email: ${testUser.email}`, () =>
    page.fill('input[type="email"]', testUser.email)
  );

  await test.step('Digita a senha', () =>
    page.fill('input[type="password"]', testUser.password)
  );

  await test.step('Clica em "Entrar na Arena"', () =>
    page.click('button[type="submit"]')
  );

  await test.step('Aguarda o login ser concluído', () =>
    page.waitForSelector('text=/Entrar na Arena/i', { state: 'hidden', timeout: 15000 })
  );

  await test.step('Verifica que o login foi bem-sucedido', () =>
    expect(page.locator('body')).not.toContainText(/Entrar na Arena/i)
  );
});
