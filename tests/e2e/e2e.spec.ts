import { test } from '@playwright/test';
import { webTests } from './web.spec';
import { androidTests } from './android.spec';

test.describe('e2e', () => {
  test.describe('web', () => { webTests('e2e : web'); });
  test.describe('android', () => { androidTests('e2e : android'); });
});
