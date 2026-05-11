import { test } from '@playwright/test';
import { androidTests } from './android.spec';

test.describe('android', () => { androidTests(); });
