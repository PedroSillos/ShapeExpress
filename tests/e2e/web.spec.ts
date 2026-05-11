import { test } from '@playwright/test';
import { testUser } from '../fixtures/users';
import { runLoginTest, runRegisterAthleteTest, runRegisterTrainerTest } from '../helpers/steps';

test.describe.configure({ mode: 'serial' });

export function webTests(prefix = 'web') {
  test(`${prefix} : login`, async ({ page }) => {
    const start = Date.now();
    await runLoginTest(page, testUser, `${prefix} : login`);
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });

  test(`${prefix} : register : atleta`, async ({ page }) => {
    const start = Date.now();
    await runRegisterAthleteTest(page, `${prefix} : register : atleta`);
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });

  test(`${prefix} : register : treinador`, async ({ page }) => {
    const start = Date.now();
    await runRegisterTrainerTest(page, `${prefix} : register : treinador`);
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });
}
