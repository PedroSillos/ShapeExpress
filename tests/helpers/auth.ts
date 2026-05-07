import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Aguarda o botão de login desaparecer (indica que o login foi bem-sucedido)
  await page.waitForSelector('text=/Entrar na Arena/i', { state: 'hidden', timeout: 15000 });
  // Aguarda um pouco para o conteúdo carregar
  await page.waitForTimeout(1000);
}

export async function logout(page: Page) {
  // Clica no avatar do usuário no header
  await page.click('img[alt="Profile"]');
  // Aguarda a tela de perfil carregar e clica em sair
  await page.waitForTimeout(500);
  await page.click('text=/Sair|Logout/i');
  await page.waitForSelector('text=/Entrar na Arena/i');
}
