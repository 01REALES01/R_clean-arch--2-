@echo off
echo Creating .env files...
echo.

REM Create .env for task-service
(
echo DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
echo RABBITMQ_URL="amqp://localhost:5672"
echo JWT_SECRET="your-secret-key-here-change-in-production"
echo JWT_EXPIRATION="1d"
echo NODE_ENV="development"
echo PORT=3000
echo SERVICE_NAME="task-service"
) > task-service\.env

if exist task-service\.env (
    echo [32m✓ task-service/.env created[0m
) else (
    echo [31m✗ Failed to create task-service/.env[0m
)

REM Create .env for notification-service
(
echo DATABASE_URL="postgresql://postgres:password@localhost:5436/taskflow?schema=public"
echo RABBITMQ_URL="amqp://localhost:5672"
echo JWT_SECRET="your-secret-key-here-change-in-production"
echo JWT_EXPIRATION="1d"
echo NODE_ENV="development"
echo PORT=3001
echo SERVICE_NAME="notification-service"
echo.
echo # Email Configuration (Optional - leave blank to disable emails)
echo # For Gmail: smtp.gmail.com, port 587, use App Password not regular password
echo # Get App Password: https://myaccount.google.com/apppasswords
echo SMTP_HOST=
echo SMTP_PORT=587
echo SMTP_USER=
echo SMTP_PASS=
echo SMTP_FROM=
) > notification-service\.env

if exist notification-service\.env (
    echo [32m✓ notification-service/.env created[0m
) else (
    echo [31m✗ Failed to create notification-service/.env[0m
)

echo.
echo [32mDone! .env files created for both services.[0m
echo.
pause

