@echo off
TITLE CareBridge Django Backend Server
COLOR 0B

echo ========================================================
echo   CAREBRIDGE SMART HEALTHCARE MANAGEMENT SYSTEM
echo   Python / Django Backend & Database Engine
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Python environment...
python --version
if errorlevel 1 (
    echo Python is not detected in PATH.
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

echo.
echo [2/4] Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [3/4] Initializing Database (SQLite / MySQL) & Running Migrations...
python manage.py makemigrations hospital
python manage.py migrate

echo.
echo [4/4] Loading CareBridge initial seed data...
python manage.py seed_data

echo.
echo ========================================================
echo   CareBridge Django API server running at:
echo   -- API Base:   http://localhost:8000/api/
echo   -- Stats KPI:  http://localhost:8000/api/stats/
echo   -- Admin:      http://localhost:8000/admin/
echo ========================================================
echo.

start http://localhost:8000/api/stats/
python manage.py runserver 0.0.0.0:8000

pause
