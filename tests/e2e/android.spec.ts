import { test } from '@playwright/test';
import { runAndroidBuildTest } from '../helpers/steps';

export function androidTests(prefix = 'android') {
  test(`${prefix}`, async () => {
    const start = Date.now();
    await runAndroidBuildTest(prefix);
    await test.step(`Passou com sucesso após ${((Date.now() - start) / 1000).toFixed(2)}s`, () => {});
  });
}
