@echo off
cd /d "%~dp0"
echo ========================================================
echo Starting EduWatch Full Stack (Backend + Frontend)
echo ========================================================

start "EduWatch Backend (Port 5000)" cmd /k "cd /d "%~dp0server" && npm.cmd run dev"
start "EduWatch Frontend (Port 5173)" cmd /k "cd /d "%~dp0client" && npm.cmd run dev"

echo Both servers launched in new windows.
echo Opening http://localhost:5173 in browser...
timeout /t 3 >nul
start http://localhost:5173
