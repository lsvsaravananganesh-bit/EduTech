@echo off
cd /d "%~dp0client"
echo ========================================================
echo Starting EduWatch Frontend Client on http://localhost:5173
echo ========================================================
npm.cmd run dev
pause
