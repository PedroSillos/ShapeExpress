import { test } from '@playwright/test';
import { runAndroidBuildTest } from '../helpers/steps';

test('android build', async () => {
  const start = Date.now();
  await runAndroidBuildTest();
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  await test.step(`Teste de build Android passou com sucesso após ${elapsed}s`, () => {});
});
