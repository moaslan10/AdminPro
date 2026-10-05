@echo off
cd /d "%~dp0frontend"
npm.cmd install
npm.cmd run dev
pause
