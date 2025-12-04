@echo off
REM Deploy RSC Server to Fly.io
REM This script sets secrets and deploys the server

echo ========================================
echo Deploying RSC Server to Fly.io
echo ========================================

REM Find Fly CLI
set FLY_CMD=fly
where fly >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "%USERPROFILE%\.fly\bin\flyctl.exe" (
        set FLY_CMD="%USERPROFILE%\.fly\bin\flyctl.exe"
        echo Using Fly CLI from %USERPROFILE%\.fly\bin\flyctl.exe
    ) else (
        echo Fly CLI not found. Installing...
        powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
        echo Fly CLI installed.
        set FLY_CMD="%USERPROFILE%\.fly\bin\flyctl.exe"
    )
)

echo.
echo Checking authentication...
%FLY_CMD% auth whoami >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo You are not logged in to Fly.io.
    echo Opening login page...
    %FLY_CMD% auth login
)

echo.
echo Setting Cloudflare secrets...

%FLY_CMD% secrets set CLOUDFLARE_ACCOUNT_ID=6872653edcee9c787c1b783173793
%FLY_CMD% secrets set CLOUDFLARE_KV_NAMESPACE_ID=f2881801ac59415a86236d0841f27103
%FLY_CMD% secrets set CLOUDFLARE_API_TOKEN=9edfd6891042bede27f3899e34a057b7a5683

echo.
echo Deploying to Fly.io...

%FLY_CMD% deploy --config fly.toml --dockerfile Dockerfile

echo.
echo ========================================
echo Deployment complete!
echo ========================================
echo.
echo Check status: %FLY_CMD% status
echo View logs: %FLY_CMD% logs
echo Open dashboard: %FLY_CMD% dashboard
echo.
