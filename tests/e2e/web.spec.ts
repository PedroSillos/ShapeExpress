import { test } from '@playwright/test';
import { runLoginTest, runRegisterAthleteTest, runRegisterTrainerTest, runDeleteAccountTest, readEnvCredentials } from '../helpers/steps';

test.describe.configure({ mode: 'serial' });

export function webTests(prefix = 'web') {
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

  test(`${prefix} : login : atleta`, async ({ page }) => {
    const start = Date.now();
    const { email, password } = readEnvCredentials('TEST_ATHLETE_EMAIL', 'TEST_ATHLETE_PASSWORD');
    await runLoginTest(page, { email, password }, `${prefix} : login : atleta`);
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });

  test(`${prefix} : login : treinador`, async ({ page }) => {
    const start = Date.now();
    const { email, password } = readEnvCredentials('TEST_TRAINER_EMAIL', 'TEST_TRAINER_PASSWORD');
    await runLoginTest(page, { email, password }, `${prefix} : login : treinador`);
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });

  test(`${prefix} : delete : atleta`, async ({ page }) => {
    const start = Date.now();
    const { email, password } = readEnvCredentials('TEST_ATHLETE_EMAIL', 'TEST_ATHLETE_PASSWORD');
    await runDeleteAccountTest(page, email, password, `${prefix} : delete : atleta`);
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });

  test(`${prefix} : delete : treinador`, async ({ page }) => {
    const start = Date.now();
    const { email, password } = readEnvCredentials('TEST_TRAINER_EMAIL', 'TEST_TRAINER_PASSWORD');
    await runDeleteAccountTest(page, email, password, `${prefix} : delete : treinador`);
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });
}
