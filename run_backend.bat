@echo off
title Aura 1.0 - Backend Server
echo ========================================================
echo Starting Aura 1.0 FastAPI Backend Server on port 8000...
echo ========================================================
cd /d "%~dp0backend"
if exist "..\venv\Scripts\python.exe" (
    "..\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else if exist "venv\Scripts\python.exe" (
    "venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else if exist "D:\job search\version 0.0\venv\Scripts\python.exe" (
    "D:\job search\version 0.0\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
)
pause
