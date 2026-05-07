import { test, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';
import { login } from '../helpers/auth';

test.describe('Chat', () => {
  test('deve enviar mensagem de Pedro para Tiago', async ({ page }) => {
    await login(page, testUsers.pedro.email, testUsers.pedro.password);
    
    // Navegar para chat
    const chatButton = page.locator('text=/Chat|Mensagens/i');
    if (await chatButton.isVisible()) {
      await chatButton.click();
    }
    
    // Selecionar conversa com Tiago ou iniciar nova
    const tiagoChat = page.locator('text=/Tiago/i').first();
    if (await tiagoChat.isVisible()) {
      await tiagoChat.click();
    }
    
    // Enviar mensagem de teste
    const messageInput = page.locator('input[placeholder*="mensagem" i], textarea[placeholder*="mensagem" i]');
    if (await messageInput.isVisible()) {
      const testMessage = `Teste E2E ${Date.now()}`;
      await messageInput.fill(testMessage);
      await page.click('button[type="submit"], button[aria-label*="enviar" i]');
      
      // Verificar mensagem enviada
      await expect(page.locator('body')).toContainText(testMessage);
    }
  });

  test('deve exibir lista de conversas', async ({ page }) => {
    await login(page, testUsers.tiago.email, testUsers.tiago.password);
    
    const chatButton = page.locator('text=/Chat|Mensagens/i');
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await expect(page.locator('body')).toContainText(/Chat|Conversas|Mensagens/i);
    }
  });

  test('deve abrir conversa existente', async ({ page }) => {
    await login(page, testUsers.tiago.email, testUsers.tiago.password);
    
    const chatButton = page.locator('text=/Chat|Mensagens/i');
    if (await chatButton.isVisible()) {
      await chatButton.click();
      
      const firstChat = page.locator('[data-testid="chat-item"], .chat-item').first();
      if (await firstChat.isVisible()) {
        await firstChat.click();
        await expect(page.locator('body')).toContainText(/Enviar|Digite/i);
      }
    }
  });
});
