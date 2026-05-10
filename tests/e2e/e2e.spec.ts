import { test } from '@playwright/test';
import { testUser } from '../fixtures/users';
import { runLoginTest, runAndroidBuildTest } from '../helpers/steps';

test('e2e completo', async ({ page }) => {
  const totalStart = Date.now();

  const loginStart = Date.now();
  await test.step('e2e : login', async () => {
    await runLoginTest(page, testUser, 'e2e : login');
    await test.step(`Passou com sucesso após ${((Date.now() - loginStart) / 1000).toFixed(2)}s`, () => {});
  });

  const androidStart = Date.now();
  await test.step('e2e : android', async () => {
    await runAndroidBuildTest('e2e : android');
    await test.step(`Passou com sucesso após ${((Date.now() - androidStart) / 1000).toFixed(2)}s`, () => {});
  });

  await test.step(`Teste e2e completo passou com sucesso após ${((Date.now() - totalStart) / 1000).toFixed(2)}s`, () => {});
});
