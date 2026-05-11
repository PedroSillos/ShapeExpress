import { test, expect, Page } from '@playwright/test';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { logout } from './auth';

const s = (prefix: string, label: string) => `${prefix} › ${label}`;

function saveCredentialsToEnv(emailKey: string, passwordKey: string, email: string, password: string) {
  const envPath = join(process.cwd(), '.env.local');
  let content = readFileSync(envPath, 'utf-8');
  const setKey = (src: string, key: string, value: string) =>
    src.match(new RegExp(`^${key}=`, 'm'))
      ? src.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`)
      : src + `\n${key}=${value}`;
  content = setKey(content, emailKey, email);
  content = setKey(content, passwordKey, password);
  writeFileSync(envPath, content);
}

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

export async function runRegisterAthleteTest(page: Page, prefix = 'register : atleta') {
  const email = `atleta+${Date.now()}@teste.com`;
  const password = `Teste@${Date.now().toString().slice(-6)}`;

  await test.step(s(prefix, 'Abre a página inicial'), () => page.goto('/'));

  const isLoggedIn = await page.locator('text=/Entrar na Arena/i').isVisible({ timeout: 3000 }).then(v => !v).catch(() => false);
  if (isLoggedIn) {
    await test.step(s(prefix, 'Sessão ativa detectada — fazendo logout'), () => logout(page));
  }

  await test.step(s(prefix, 'Clica em "Criar conta"'), () =>
    page.click('button:has-text("Criar conta")')
  );

  // Step 1 — Identificação básica
  await test.step(s(prefix, 'Preenche nome completo'), () =>
    page.fill('#field-name input', 'Atleta Teste')
  );
  await test.step(s(prefix, `Preenche email: ${email}`), () =>
    page.fill('#field-email input', email)
  );
  await test.step(s(prefix, `Preenche senha: ${'*'.repeat(password.length)}`), () =>
    page.fill('#field-password input', password)
  );
  await test.step(s(prefix, 'Preenche confirmação de senha'), () =>
    page.fill('#field-confirmPassword input', password)
  );
  await test.step(s(prefix, 'Preenche telefone'), () =>
    page.fill('#field-phone input', '11999999999')
  );
  await test.step(s(prefix, 'Seleciona tipo "Atleta"'), () =>
    page.click('#field-userType button:has-text("Atleta")')
  );
  await test.step(s(prefix, 'Avança do step 1'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 2 — Conectar com personal
  await test.step(s(prefix, 'Seleciona "Não, treino sozinho"'), () =>
    page.click('button:has-text("Não, treino sozinho")')
  );
  await test.step(s(prefix, 'Avança do step 2'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 3 — Objetivo
  await test.step(s(prefix, 'Seleciona objetivo "Ganhar massa muscular"'), () =>
    page.click('button:has-text("Ganhar massa muscular")')
  );
  await test.step(s(prefix, 'Avança do step 3'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 4 — Experiência
  await test.step(s(prefix, 'Seleciona nível "Iniciante"'), () =>
    page.click('button:has-text("Iniciante")')
  );
  await test.step(s(prefix, 'Avança do step 4'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 5 — Frequência
  await test.step(s(prefix, 'Seleciona frequência "3 vezes por semana"'), () =>
    page.click('button:has-text("3 vezes por semana")')
  );
  await test.step(s(prefix, 'Avança do step 5'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 6 — Dados físicos
  await test.step(s(prefix, 'Preenche altura'), () =>
    page.fill('#field-height input', '175')
  );
  await test.step(s(prefix, 'Preenche peso'), () =>
    page.fill('#field-weight input', '75')
  );
  await test.step(s(prefix, 'Preenche data de nascimento'), () =>
    page.fill('#field-birthDate input', '01/01/2000')
  );
  await test.step(s(prefix, 'Avança do step 6'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 7 — Local de treino
  await test.step(s(prefix, 'Seleciona "Academia"'), () =>
    page.click('button:has-text("Academia")')
  );
  await test.step(s(prefix, 'Avança do step 7'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 8 — Sucesso
  await test.step(s(prefix, 'Aguarda tela de sucesso'), () =>
    page.waitForSelector('text=Tudo pronto', { timeout: 20000 })
  );
  await test.step(s(prefix, 'Clica em "Ver meu treino"'), () =>
    page.click('button:has-text("Ver meu treino")')
  );
  await test.step(s(prefix, 'Verifica que o registro foi bem-sucedido'), () =>
    expect(page.locator('body')).not.toContainText(/Entrar na Arena/i)
  );

  // Salva credenciais no console, em arquivo e no .env.local
  const credentials = `email: ${email}\npassword: ${password}`;
  console.log(`\n[register:atleta] Credenciais criadas:\n${credentials}\n`);
  const dir = join(process.cwd(), 'test-results');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'register-credentials.txt'), credentials + '\n');
  saveCredentialsToEnv('TEST_ATHLETE_EMAIL', 'TEST_ATHLETE_PASSWORD', email, password);

  return { email, password };
}

export async function runRegisterTrainerTest(page: Page, prefix = 'register') {
  const email = `treinador+${Date.now()}@teste.com`;
  const password = `Teste@${Date.now().toString().slice(-6)}`;

  await test.step(s(prefix, 'Abre a página inicial'), () => page.goto('/'));

  const isLoggedIn = await page.locator('text=/Entrar na Arena/i').isVisible({ timeout: 3000 }).then(v => !v).catch(() => false);
  if (isLoggedIn) {
    await test.step(s(prefix, 'Sessão ativa detectada — fazendo logout'), () => logout(page));
  }

  await test.step(s(prefix, 'Clica em "Criar conta"'), () =>
    page.click('button:has-text("Criar conta")')
  );

  // Step 1 — Identificação básica
  await test.step(s(prefix, 'Preenche nome completo'), () =>
    page.fill('#field-name input', 'Treinador Teste')
  );
  await test.step(s(prefix, `Preenche email: ${email}`), () =>
    page.fill('#field-email input', email)
  );
  await test.step(s(prefix, `Preenche senha: ${'*'.repeat(password.length)}`), () =>
    page.fill('#field-password input', password)
  );
  await test.step(s(prefix, 'Preenche confirmação de senha'), () =>
    page.fill('#field-confirmPassword input', password)
  );
  await test.step(s(prefix, 'Preenche telefone'), () =>
    page.fill('#field-phone input', '11988888888')
  );
  await test.step(s(prefix, 'Seleciona tipo "Treinador"'), () =>
    page.click('#field-userType button:has-text("Treinador")')
  );
  await test.step(s(prefix, 'Avança do step 1'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 2 — Informações profissionais
  await test.step(s(prefix, 'Preenche CREF'), () =>
    page.fill('#field-cref input', '123456-G/SP')
  );
  await test.step(s(prefix, 'Seleciona experiência "1–3 anos"'), () =>
    page.click('button:has-text("1–3 anos")')
  );
  await test.step(s(prefix, 'Seleciona especialidade "Hipertrofia"'), () =>
    page.click('button:has-text("Hipertrofia")')
  );
  await test.step(s(prefix, 'Seleciona atendimento "Presencial"'), () =>
    page.click('button:has-text("Presencial")')
  );
  await test.step(s(prefix, 'Avança do step 2'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 3 — Estrutura de trabalho
  await test.step(s(prefix, 'Seleciona "Trabalha em academia: Sim"'), () =>
    page.click('button:has-text("Sim")')
  );
  await test.step(s(prefix, 'Preenche nome da academia'), () =>
    page.fill('#field-gymName input', 'Academia Teste')
  );
  await test.step(s(prefix, 'Seleciona quantidade de alunos "1–10"'), () =>
    page.click('button:has-text("1–10")')
  );
  await test.step(s(prefix, 'Avança do step 3'), () =>
    page.click('button:has-text("Avançar")')
  );

  // Step 4 — Perfil profissional
  await test.step(s(prefix, 'Preenche data de nascimento'), () =>
    page.fill('#field-birthDate input', '01/01/1990')
  );
  await test.step(s(prefix, 'Clica em "Criar Conta"'), () =>
    page.click('button:has-text("Criar Conta")')
  );

  // Step 5 — Sucesso
  await test.step(s(prefix, 'Aguarda tela de sucesso'), () =>
    page.waitForSelector('text=Conta criada com sucesso', { timeout: 20000 })
  );
  await test.step(s(prefix, 'Clica em "Ir para o Dashboard"'), async () => {
    const btn = page.locator('[data-testid="btn-ir-dashboard"]');
    await btn.waitFor({ state: 'visible' });
    await btn.click();
  });
  await test.step(s(prefix, 'Verifica que o registro foi bem-sucedido'), () =>
    expect(page.locator('body')).not.toContainText(/Entrar na Arena/i)
  );

  // Salva credenciais no console, em arquivo e no .env.local
  const credentials = `email: ${email}\npassword: ${password}`;
  console.log(`\n[register:treinador] Credenciais criadas:\n${credentials}\n`);
  const dir = join(process.cwd(), 'test-results');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'register-credentials.txt'), credentials + '\n', { flag: 'a' });
  saveCredentialsToEnv('TEST_TRAINER_EMAIL', 'TEST_TRAINER_PASSWORD', email, password);

  return { email, password };
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
