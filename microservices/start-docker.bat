@echo off
echo ================================================
echo   Iniciando TaskFlow (Docker)
echo ================================================
echo.

docker-compose up -d

echo.
echo Esperando a que los servicios esten listos (30 segundos)...
timeout /t 30 /nobreak >nul

echo.
echo [32m================================================[0m
echo [32m  TaskFlow esta corriendo![0m
echo [32m================================================[0m
echo.
echo URLs disponibles:
echo   Task Service:         http://localhost:3000/api
echo   Notification Service: http://localhost:3001/api
echo   RabbitMQ Management:  http://localhost:15672
echo                         (usuario: guest / password: guest)
echo.
echo Para ver los logs:    docker-compose logs -f
echo Para detener:         docker-compose down
echo.
pause
