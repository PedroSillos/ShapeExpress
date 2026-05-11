import { test } from '@playwright/test';
import { testUser } from '../fixtures/users';
import { runLoginTest, runAndroidBuildTest } from '../helpers/steps';

test.describe.configure({ mode: 'serial' });

test.describe('e2e completo', () => {
  test('e2e : login', async ({ page }) => {
    const start = Date.now();
    await runLoginTest(page, testUser, 'e2e : login');
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });

  test('e2e : android', async () => {
    const start = Date.now();
    await runAndroidBuildTest('e2e : android');
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });
});
