@echo off
title Aura 1.0 - Frontend Dev Server
echo ========================================================
echo Starting Aura 1.0 Vite Frontend Dev Server on port 5173...
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
