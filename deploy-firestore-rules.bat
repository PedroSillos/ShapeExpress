@echo off
echo ========================================
echo Deploy Firestore Rules
echo ========================================
echo.
echo Este script vai fazer o deploy das regras do Firestore.
echo.
echo Passo 1: Fazer login no Firebase
echo.
firebase login
echo.
echo Passo 2: Deploy das regras
echo.
firebase deploy --only firestore:rules
echo.
echo ========================================
echo Deploy concluido!
echo ========================================
pause
