import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

test.describe('Build Validation', () => {
  test('deve gerar build de produção válido e preparar assets para Android', async () => {
    // Executa o build
    try {
      execSync('npm run build', { 
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 120000
      });
    } catch (error: any) {
      throw new Error(`Build falhou: ${error.message}`);
    }

    const distPath = join(process.cwd(), 'dist');
    const indexPath = join(distPath, 'index.html');
    const assetsPath = join(distPath, 'assets');

    // Verifica estrutura necessária para Capacitor
    expect(existsSync(distPath)).toBeTruthy();
    expect(existsSync(indexPath)).toBeTruthy();
    expect(existsSync(assetsPath)).toBeTruthy();

    // Limpa diretórios Android antes do sync
    const androidAssetsPath = join(process.cwd(), 'android', 'app', 'src', 'main', 'assets');
    const androidPluginsPath = join(process.cwd(), 'android', 'capacitor-cordova-android-plugins');
    
    if (existsSync(androidAssetsPath)) {
      rmSync(androidAssetsPath, { recursive: true, force: true });
    }
    if (existsSync(androidPluginsPath)) {
      rmSync(androidPluginsPath, { recursive: true, force: true });
    }

    // Executa capacitor sync
    try {
      execSync('npx capacitor sync', { 
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 60000
      });
    } catch (error: any) {
      const stderr = error.stderr?.toString() || '';
      const stdout = error.stdout?.toString() || '';
      throw new Error(`Capacitor sync falhou:\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`);
    }
  });
});
