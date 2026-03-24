@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PS_SCRIPT=%SCRIPT_DIR%deploy.ps1"

if /I "%~1"=="/help" goto :help
if /I "%~1"=="-h" goto :help
if /I "%~1"=="--help" goto :help

echo ==========================================
echo   Interactive Deploy
echo ==========================================
echo.

echo Select deploy mode:
echo   1. Frontend + Backend
echo   2. Backend only
echo   3. Frontend only
set /p MODE=Choice [1]: 
if "%MODE%"=="" set "MODE=1"

if "%MODE%"=="1" (
    set "MODE_ARGS="
) else if "%MODE%"=="2" (
    set "MODE_ARGS=-BackendOnly"
) else if "%MODE%"=="3" (
    set "MODE_ARGS=-FrontendOnly"
) else (
    echo Invalid mode: %MODE%
    exit /b 1
)

set /p TARGET=Target path [/home/root]: 
if "%TARGET%"=="" set "TARGET=/home/root"

set "RESTART_ARGS="
if not "%MODE%"=="3" (
    set /p STOP_FIRST=Stop current backend before deploy? [Y/n]: 
    if /I "%STOP_FIRST%"=="n" set "RESTART_ARGS=-NoRestart"
)

set "START_ARGS="
if not "%MODE%"=="3" (
    set /p START_AFTER=Start backend after deploy? [Y/n]: 
    if /I not "%START_AFTER%"=="n" set "START_ARGS=-StartBackend"
)

echo.
echo Summary:
echo   Mode: %MODE%
echo   Target: %TARGET%
if defined RESTART_ARGS (
    echo   Stop old backend: No
) else if not "%MODE%"=="3" (
    echo   Stop old backend: Yes
)
if defined START_ARGS (
    echo   Start backend after deploy: Yes
) else if not "%MODE%"=="3" (
    echo   Start backend after deploy: No
)
echo.

powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -Target "%TARGET%" %MODE_ARGS% %RESTART_ARGS% %START_ARGS%
exit /b %ERRORLEVEL%

:help
echo Usage: scripts\deploy.cmd
echo.
echo Interactive Windows wrapper for scripts\deploy.ps1.
echo It asks for:
echo   - deploy mode
echo   - target path
echo   - whether to stop the current backend
echo   - whether to start backend after deploy
echo.
echo Example:
echo   scripts\deploy.cmd
exit /b 0
