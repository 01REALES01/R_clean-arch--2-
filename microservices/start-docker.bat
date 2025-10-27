@echo off
echo.
echo ========================================
echo   Starting TaskFlow in Docker
echo ========================================
echo.

echo [1/3] Stopping any local Node.js services...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping process on port 3000...
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Stopping process on port 3001...
    taskkill /F /PID %%a 2>nul
)

echo.
echo [2/3] Starting Docker containers...
docker-compose up -d --build

echo.
echo [3/3] Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo   Docker Status:
echo ========================================
docker-compose ps

echo.
echo ========================================
echo   Access Your Application:
echo ========================================
echo   Task Service:         http://localhost:3000/api
echo   Notification Service: http://localhost:3001/api
echo   RabbitMQ Management:  http://localhost:15672
echo ========================================
echo.
echo To view logs: docker-compose logs -f
echo To stop:      docker-compose down
echo.
pause


