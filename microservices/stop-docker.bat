@echo off
echo ================================================
echo   Deteniendo TaskFlow (Docker)
echo ================================================
echo.

docker-compose down

echo.
echo [32m✓ Todos los servicios han sido detenidos[0m
echo.
pause
