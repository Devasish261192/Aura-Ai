@echo off
title Aura 1.0 - Master Launcher
echo ========================================================
echo Launching Aura 1.0 (Backend + Frontend)...
echo ========================================================

:: Start Backend in new window
start "Aura Backend (Port 8000)" cmd /k "%~dp0run_backend.bat"

:: Wait 2 seconds for backend initialization
timeout /t 2 /nobreak >nul

:: Start Frontend in new window
start "Aura Frontend (Port 5173)" cmd /k "%~dp0run_frontend.bat"

:: Wait 2 seconds and open browser
timeout /t 2 /nobreak >nul
start http://localhost:5173/

echo Aura 1.0 is now running!
