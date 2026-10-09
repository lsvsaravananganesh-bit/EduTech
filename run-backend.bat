@echo off
cd /d "%~dp0server"
echo ========================================================
echo Starting EduWatch Backend API Server on http://localhost:5000
echo ========================================================
npm.cmd run dev
pause
