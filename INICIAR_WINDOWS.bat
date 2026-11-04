@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Instale o Node.js LTS pelo site oficial https://nodejs.org e abra este arquivo novamente.
 pause
 exit /b 1
)
if not exist dist\index.html (
 echo A pasta dist nao foi encontrada. Use npm ci e npm run build.
 pause
 exit /b 1
)
start "" http://localhost:4173
node serve.mjs
pause
