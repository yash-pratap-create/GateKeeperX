@echo off
title GateKeeperX Launcher
echo.
echo  ==========================================
echo    GateKeeperX - Starting Servers...
echo  ==========================================
echo.

echo  [1/2] Starting Backend  (http://localhost:5000)
start "GateKeeperX - Backend" cmd /k "cd /d %~dp0 && npm run server:dev"

timeout /t 2 /nobreak >nul

echo  [2/2] Starting Frontend (http://localhost:5173)
start "GateKeeperX - Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo  Waiting for Vite to be ready...
timeout /t 5 /nobreak >nul

echo  Opening GateKeeperX in Chrome...
start chrome "http://localhost:5173"

echo.
echo  Done! Servers are running in background windows.
timeout /t 3 /nobreak >nul
