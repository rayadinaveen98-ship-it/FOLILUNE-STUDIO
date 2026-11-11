@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer is required.
  echo Install Node.js, reopen this window, then run this file again.
  pause
  exit /b 1
)
echo.
echo FOLILUNE Studio Autonomous Creation Engine - Stage 1A
echo Open http://127.0.0.1:44831 in Chrome or Edge.
echo The server is LOCAL ONLY. No public publishing is enabled.
echo Press Ctrl+C to stop the engine.
echo.
node engine\server.mjs
if errorlevel 1 pause
