import { test, expect, Page } from '@playwright/test';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { logout } from './auth';

const s = (prefix: string, label: string) => `${prefix} › ${label}`;

export async function runLoginTest(page: Page, testUser: { email: string; password: string }, prefix = 'login') {
  await test.step(s(prefix, 'Abre a página inicial'), () => page.goto('/'));

  const isLoggedIn = await page.locator('text=/Entrar na Arena/i').isVisible({ timeout: 3000 }).then(v => !v).catch(() => false);
  if (isLoggedIn) {
    await test.step(s(prefix, 'Sessão ativa detectada — fazendo logout'), () => logout(page));
  }

  await test.step(s(prefix, `Digita o email: ${testUser.email}`), () =>
    page.fill('input[type="email"]', testUser.email)
  );

  await test.step(s(prefix, `Digita a senha: ${'*'.repeat(testUser.password.length)}`), () =>
    page.fill('input[type="password"]', testUser.password)
  );

  await test.step(s(prefix, 'Clica em "Entrar na Arena"'), () =>
    page.click('button[type="submit"]')
  );

  await test.step(s(prefix, 'Aguarda o login ser concluído'), () =>
    page.waitForSelector('text=/Entrar na Arena/i', { state: 'hidden', timeout: 15000 })
  );

  await test.step(s(prefix, 'Verifica que o login foi bem-sucedido'), () =>
    expect(page.locator('body')).not.toContainText(/Entrar na Arena/i)
  );
}

export async function runAndroidBuildTest(prefix = 'android') {
  const root = process.cwd();

  await test.step(s(prefix, 'Executa npm run build'), () => {
    execSync('npm run build', { cwd: root, stdio: 'pipe', timeout: 120000 });
  });

  await test.step(s(prefix, 'Verifica que dist/index.html foi gerado'), () => {
    expect(existsSync(join(root, 'dist', 'index.html'))).toBe(true);
  });

  await test.step(s(prefix, 'Executa npx capacitor sync'), () => {
    execSync('npx capacitor sync android', { cwd: root, stdio: 'pipe', timeout: 60000 });
  });

  await test.step(s(prefix, 'Verifica que os assets Android foram sincronizados'), () => {
    expect(existsSync(join(root, 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html'))).toBe(true);
  });

  await test.step(s(prefix, 'Executa gradle assembleDebug'), () => {
    execSync('.\\gradlew.bat assembleDebug', { cwd: join(root, 'android'), stdio: 'pipe', timeout: 300000 });
  });

  await test.step(s(prefix, 'Verifica que o APK foi gerado'), () => {
    const apkPath = join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    expect(existsSync(apkPath)).toBe(true);
  });
}
