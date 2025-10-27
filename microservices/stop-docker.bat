@echo off
echo.
echo ========================================
echo   Stopping TaskFlow Docker Services
echo ========================================
echo.

docker-compose down

echo.
echo All services stopped.
echo.
echo To start again: docker-compose up -d
echo or run: start-docker.bat
echo.
pause


