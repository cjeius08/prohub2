@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "BASE_PORT=8787"
set "PORT="

for /L %%P in (8787,1,8799) do (
  netstat -ano | findstr /R /C:":%%P .*LISTENING" >nul 2>nul
  if errorlevel 1 (
    set "PORT=%%P"
    goto :foundPort
  )
)

set "PORT=%BASE_PORT%"

:foundPort
set "URL=http://127.0.0.1:%PORT%/"
set "PORT=%PORT%"

title Cjei Work Hub Server - SAFE LAUNCHER
cls
echo ==========================================================
echo   Cjei Work Hub Launcher - SAFE VERSION
echo ==========================================================
echo.
echo Folder: %CD%
echo Website: %URL%
echo.
echo Keep this black window open while using the website.
echo Close this window when you are done.
echo.
echo This launcher avoids opening an old/broken server on port 8787.
echo.

where node >nul 2>nul
if not errorlevel 1 (
  echo Node.js found. Starting Work Hub server on port %PORT%...
  start "" /b cmd /c "timeout /t 2 >nul & start "" "%URL%""
  set "PORT=%PORT%"
  node server.mjs
  echo.
  echo Server stopped.
  pause
  exit /b 0
)

echo Node.js was not found. Using the built-in Windows PowerShell server instead.
echo.

where powershell >nul 2>nul
if not errorlevel 1 (
  set "PORT=%PORT%"
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0cjei-local-server.ps1"
  echo.
  echo Server stopped.
  pause
  exit /b 0
)

echo Windows PowerShell was not found, so opening the site directly.
echo YouTube may not work perfectly in this fallback mode.
start "" "%~dp0index.html"
pause
