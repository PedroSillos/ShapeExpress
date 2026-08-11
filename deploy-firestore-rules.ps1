# Deploy Firestore Rules
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploy Firestore Rules" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if firebase-tools is installed
try {
    $version = firebase --version
    Write-Host "Firebase CLI version: $version" -ForegroundColor Green
} catch {
    Write-Host "Firebase CLI nao encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

Write-Host ""
Write-Host "Passo 1: Fazer login no Firebase" -ForegroundColor Yellow
Write-Host ""

firebase login

Write-Host ""
Write-Host "Passo 2: Deploy das regras" -ForegroundColor Yellow
Write-Host ""

firebase deploy --only firestore:rules

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deploy concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
