@echo off
REM ============================================================
REM  Shape Express - Deploy para Google Cloud Run
REM  Pre-requisito: gcloud CLI instalado e autenticado
REM  Download: https://cloud.google.com/sdk/docs/install
REM ============================================================

set PROJECT_ID=shape-express
set SERVICE_NAME=shape-express-api
set REGION=southamerica-east1
set IMAGE=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo.
echo [1/4] Configurando projeto GCP: %PROJECT_ID%
gcloud config set project %PROJECT_ID%

echo.
echo [2/4] Fazendo build e push da imagem...
gcloud builds submit --tag %IMAGE%

echo.
echo [3/4] Fazendo deploy no Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
  --image %IMAGE% ^
  --platform managed ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --port 8080 ^
  --memory 512Mi ^
  --min-instances 0 ^
  --max-instances 10 ^
  --set-env-vars NODE_ENV=production ^
  --set-env-vars "STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY%" ^
  --set-env-vars "GEMINI_API_KEY=%GEMINI_API_KEY%" ^
  --set-env-vars "STRIPE_PUBLIC_KEY=%STRIPE_PUBLIC_KEY%"

echo.
echo [4/4] URL do servico:
gcloud run services describe %SERVICE_NAME% --region %REGION% --format "value(status.url)"

echo.
echo PROXIMO PASSO: copie a URL acima e atualize APP_URL no .env.local
echo.
