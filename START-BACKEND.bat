@echo off
cd /d "%~dp0backend\AdminPro.Api"
dotnet run --urls http://localhost:5001
pause
