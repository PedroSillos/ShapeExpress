import { test } from '@playwright/test';
import { webTests } from './web.spec';

test.describe.configure({ mode: 'serial' });

test.describe('web', () => { webTests(); });
