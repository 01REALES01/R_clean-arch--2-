# TaskFlow API Test Script (PowerShell)
# Usage: .\test-api.ps1

$baseUrl = "http://localhost:3000"
$testEmail = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "Password123!"

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "🚀 TaskFlow Microservices Test Suite" -ForegroundColor Cyan
Write-Host "===========================================================`n" -ForegroundColor Cyan

# Test 1: Register User
Write-Host "📝 Test 1: Register new user..." -ForegroundColor Yellow
$registerBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✓ Registration successful" -ForegroundColor Green
    Write-Host "  User: $($registerResponse.email)" -ForegroundColor Blue
    Write-Host "  Role: $($registerResponse.role)`n" -ForegroundColor Blue
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Is the server running? Check: http://localhost:3000`n" -ForegroundColor Yellow
    exit 1
}

# Test 2: Login
Write-Host "🔑 Test 2: Login user..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 30))...`n" -ForegroundColor Blue
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Create Task
Write-Host "➕ Test 3: Create new task..." -ForegroundColor Yellow
$createTaskBody = @{
    title = "Test Task - Automated"
    description = "This task was created by automated test script"
    priority = "HIGH"
    dueDate = (Get-Date).AddDays(7).ToString("o")
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $taskResponse = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Body $createTaskBody -ContentType "application/json" -Headers $headers
    $taskId = $taskResponse.id
    Write-Host "✓ Task created successfully" -ForegroundColor Green
    Write-Host "  Task ID: $taskId" -ForegroundColor Blue
    Write-Host "  Title: $($taskResponse.title)" -ForegroundColor Blue
    Write-Host "  Status: $($taskResponse.status)" -ForegroundColor Blue
    Write-Host "  Priority: $($taskResponse.priority)`n" -ForegroundColor Blue
} catch {
    Write-Host "✗ Task creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Get All Tasks
Write-Host "📜 Test 4: Get all tasks..." -ForegroundColor Yellow
try {
    $tasks = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Get -Headers $headers
    Write-Host "✓ Tasks retrieved successfully" -ForegroundColor Green
    Write-Host "  Total tasks: $($tasks.Count)`n" -ForegroundColor Blue
} catch {
    Write-Host "✗ Failed to retrieve tasks: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get Specific Task
Write-Host "🔍 Test 5: Get specific task..." -ForegroundColor Yellow
try {
    $task = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskId" -Method Get -Headers $headers
    Write-Host "✓ Task retrieved successfully" -ForegroundColor Green
    Write-Host "  Title: $($task.title)" -ForegroundColor Blue
    Write-Host "  Status: $($task.status)`n" -ForegroundColor Blue
} catch {
    Write-Host "✗ Failed to retrieve task: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Update Task
Write-Host "✏️  Test 6: Update task..." -ForegroundColor Yellow
$updateTaskBody = @{
    status = "IN_PROGRESS"
    title = "Updated Test Task"
} | ConvertTo-Json

try {
    $updatedTask = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskId" -Method Patch -Body $updateTaskBody -ContentType "application/json" -Headers $headers
    Write-Host "✓ Task updated successfully" -ForegroundColor Green
    Write-Host "  New status: $($updatedTask.status)" -ForegroundColor Blue
    Write-Host "  New title: $($updatedTask.title)`n" -ForegroundColor Blue
} catch {
    Write-Host "✗ Failed to update task: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Filter Tasks by Status
Write-Host "🔎 Test 7: Filter tasks by status..." -ForegroundColor Yellow
try {
    $filteredTasks = Invoke-RestMethod -Uri "$baseUrl/tasks?status=IN_PROGRESS" -Method Get -Headers $headers
    Write-Host "✓ Filtered tasks retrieved successfully" -ForegroundColor Green
    Write-Host "  Tasks with status IN_PROGRESS: $($filteredTasks.Count)`n" -ForegroundColor Blue
} catch {
    Write-Host "✗ Failed to filter tasks: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Delete Task
Write-Host "🗑️  Test 8: Delete task..." -ForegroundColor Yellow
try {
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskId" -Method Delete -Headers $headers
    Write-Host "✓ Task deleted successfully" -ForegroundColor Green
    Write-Host "  Message: $($deleteResponse.message)`n" -ForegroundColor Blue
} catch {
    Write-Host "✗ Failed to delete task: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Verify Deletion
Write-Host "✔️  Test 9: Verify task deletion..." -ForegroundColor Yellow
try {
    $verifyTask = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskId" -Method Get -Headers $headers
    Write-Host "✗ Task still exists after deletion" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "✓ Task successfully deleted (404 confirmed)`n" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "✅ Test Suite Completed" -ForegroundColor Cyan
Write-Host "===========================================================`n" -ForegroundColor Cyan

Write-Host "📊 Summary:" -ForegroundColor Green
Write-Host "  • All authentication endpoints tested" -ForegroundColor Blue
Write-Host "  • All task CRUD operations tested" -ForegroundColor Blue
Write-Host "  • Event publishing should be visible in RabbitMQ`n" -ForegroundColor Blue

Write-Host "🔍 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Check Swagger UI: http://localhost:3000/api" -ForegroundColor Blue
Write-Host "  2. Check RabbitMQ Management UI: http://localhost:15672" -ForegroundColor Blue
Write-Host "  3. Verify queues: tasks_queue, users_queue, notifications_queue`n" -ForegroundColor Blue

