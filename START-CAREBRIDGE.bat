@echo off
TITLE CareBridge Smart Healthcare Management System
COLOR 0A

echo ============================================================================
echo      CAREBRIDGE - SMART HEALTHCARE MANAGEMENT SYSTEM
echo ============================================================================
echo.
echo  Please choose how you want to launch CareBridge:
echo.
echo  [1] Launch Full-Stack Node.js & React System (http://localhost:5000) [Default]
echo  [2] Launch Python / Django Backend & Database (http://localhost:8000)
echo  [3] Open Standalone Dashboard Directly (Zero setup required - HTML/JS)
echo  [4] Open Pure HTML/CSS/JS Frontend Portal
echo.
set /p choice="Enter choice [1-4] (default is 1): "

if "%choice%"=="2" goto django
if "%choice%"=="3" goto standalone
if "%choice%"=="4" goto html_portal

:node
echo.
echo Starting CareBridge Live Server on http://localhost:5000...
start "" "http://localhost:5000"
node backend/server.js
goto end

:django
echo.
echo Starting CareBridge Django Engine on http://localhost:8000...
cd django_backend
call run_django.bat
goto end

:standalone
echo.
echo Opening Standalone Dashboard in default browser...
start "" "%~dp0dashboard.html"
goto end

:html_portal
echo.
echo Opening Pure HTML/CSS/JS Portal in default browser...
start "" "%~dp0frontend_html\index.html"
goto end

:end
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Process ended.
  pause
)
