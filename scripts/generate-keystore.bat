@echo off
REM ============================================================
REM  Shape Express - Gerador de Keystore para Play Store
REM  Execute UMA VEZ e guarde o .jks em local seguro (fora do repo)
REM ============================================================

set KEYTOOL="C:\Program Files\Java\jdk-21\bin\keytool.exe"
set KEYSTORE_PATH=%USERPROFILE%\shapeexpress-release.jks
set KEY_ALIAS=shapeexpress
set VALIDITY=10000

echo.
echo Gerando keystore em: %KEYSTORE_PATH%
echo.
echo Voce sera solicitado a criar uma senha para o keystore e para a chave.
echo GUARDE ESSAS SENHAS - sem elas nao e possivel atualizar o app na Play Store.
echo.

%KEYTOOL% -genkey -v ^
  -keystore "%KEYSTORE_PATH%" ^
  -alias %KEY_ALIAS% ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity %VALIDITY%

echo.
echo Keystore gerado em: %KEYSTORE_PATH%
echo.
echo PROXIMOS PASSOS:
echo 1. Abra o Android Studio: npx capacitor open android
echo 2. Va em Build ^> Generate Signed Bundle / APK
echo 3. Escolha "Android App Bundle"
echo 4. Aponte para o keystore em: %KEYSTORE_PATH%
echo 5. Use o alias: %KEY_ALIAS%
echo.
