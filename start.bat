@echo off
cd /d "%~dp0"
echo Starting Abyss Walker...
echo.
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
npm run dev
pause
