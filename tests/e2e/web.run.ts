import { test } from '@playwright/test';
import { webTests } from './web.spec';

test.describe('web', () => { webTests(); });
