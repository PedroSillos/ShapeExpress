import { test } from '@playwright/test';
import { runRegisterAthleteTest } from '../helpers/steps';

test('register : atleta', async ({ page }) => {
  const start = Date.now();
  await runRegisterAthleteTest(page, 'register : atleta');
  await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
});
