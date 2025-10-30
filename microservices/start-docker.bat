@echo off
echo ================================================
echo   Iniciando TaskFlow (Docker)
echo ================================================
echo.

echo [1/3] Iniciando infraestructura...
docker-compose up -d

echo.
echo [2/3] Esperando a que RabbitMQ este listo (15 segundos)...
timeout /t 15 /nobreak >nul

echo.
echo [3/3] Reiniciando servicios para conectar a RabbitMQ...
docker-compose restart task-service notification-service

echo.
echo Esperando inicio completo (10 segundos)...
timeout /t 10 /nobreak >nul

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
echo Verificar conexion:   docker-compose logs task-service
echo Ver logs:             docker-compose logs -f
echo Detener:              docker-compose down
echo.
pause
