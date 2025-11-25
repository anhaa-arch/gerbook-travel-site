@echo off
title Gerbook Travel - Full Stack Servers

echo ========================================
echo   GERBOOK TRAVEL SITE
echo   Starting All Servers...
echo ========================================
echo.

REM Check if MySQL is running
echo [1/3] Checking MySQL...
sc query MySQL80 | find "RUNNING" >nul
if %errorlevel% == 0 (
    echo ✓ MySQL is running
) else (
    echo ✗ MySQL is NOT running!
    echo Please start MySQL from XAMPP or Services
    pause
    exit /b 1
)

echo.
echo [2/3] Starting Backend Server (Port 8000)...
echo Opening new window for Backend...
start "Backend Server (Port 8000)" cmd /k "cd tusul_back && npm start"

echo.
echo [3/3] Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   SERVERS STARTED!
echo ========================================
echo.
echo Backend:  http://"http://152.42.163.155:8000/graphql"
echo Frontend: Starting now...
echo.
echo Press Ctrl+C to stop the frontend
echo (Backend will keep running in separate window)
echo ========================================
echo.

npm run dev

