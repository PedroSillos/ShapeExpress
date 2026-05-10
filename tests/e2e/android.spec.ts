import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

test('android build', async () => {
  const root = process.cwd();

  await test.step('Executa npm run build', () => {
    execSync('npm run build', { cwd: root, stdio: 'pipe', timeout: 120000 });
  });

  await test.step('Verifica que dist/index.html foi gerado', () => {
    expect(existsSync(join(root, 'dist', 'index.html'))).toBe(true);
  });

  await test.step('Executa npx capacitor sync', () => {
    execSync('npx capacitor sync android', { cwd: root, stdio: 'pipe', timeout: 60000 });
  });

  await test.step('Verifica que os assets Android foram sincronizados', () => {
    expect(existsSync(join(root, 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html'))).toBe(true);
  });

  await test.step('Executa gradle assembleDebug', () => {
    execSync('.\\gradlew.bat assembleDebug', { cwd: join(root, 'android'), stdio: 'pipe', timeout: 300000 });
  });

  await test.step('Verifica que o APK foi gerado', () => {
    const apkPath = join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    expect(existsSync(apkPath)).toBe(true);
  });
});
