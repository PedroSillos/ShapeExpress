import { test, expect } from '@playwright/test';
import { testUser } from '../fixtures/users';
import { logout } from '../helpers/auth';
import { runLoginTest } from '../helpers/steps';

test('login', async ({ page }) => {
  const start = Date.now();
  await runLoginTest(page, testUser);
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  await test.step(`Teste de login passou com sucesso após ${elapsed}s`, () => {});
});
