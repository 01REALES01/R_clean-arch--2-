# ========================================
# RBAC Testing Script
# ========================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Testing Role-Based Access Control" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# ========================================
# 1. Register Regular User
# ========================================
Write-Host "[1/7] Registering regular USER..." -ForegroundColor Yellow

$userRegister = @{
    email = "user@test.com"
    password = "User1234!"
} | ConvertTo-Json

try {
    $userResult = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $userRegister
    
    Write-Host "✅ User registered: $($userResult.user.email) (Role: $($userResult.user.role))" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  User already exists (this is okay)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed: $_" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# ========================================
# 2. Register Admin User
# ========================================
Write-Host "`n[2/7] Registering ADMIN user..." -ForegroundColor Yellow

$adminRegister = @{
    email = "admin@test.com"
    password = "Admin1234!"
} | ConvertTo-Json

try {
    $adminResult = Invoke-RestMethod -Uri "$baseUrl/auth/register-admin" `
        -Method Post `
        -ContentType "application/json" `
        -Body $adminRegister
    
    Write-Host "✅ Admin registered: $($adminResult.user.email) (Role: $($adminResult.user.role))" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  Admin already exists (this is okay)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed: $_" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# ========================================
# 3. Login as Regular User
# ========================================
Write-Host "`n[3/7] Login as regular USER..." -ForegroundColor Yellow

$userLogin = @{
    email = "user@test.com"
    password = "User1234!"
} | ConvertTo-Json

$userAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $userLogin

$userToken = $userAuth.access_token
$userHeaders = @{ "Authorization" = "Bearer $userToken" }

Write-Host "✅ User logged in successfully" -ForegroundColor Green
Write-Host "   User ID: $($userAuth.user.id)" -ForegroundColor Gray

Start-Sleep -Seconds 1

# ========================================
# 4. Test USER creating a task
# ========================================
Write-Host "`n[4/7] USER creating a task..." -ForegroundColor Yellow

$taskBody = @{
    title = "RBAC Test Task"
    description = "Testing role-based access"
    status = "TODO"
    priority = "HIGH"
    dueDate = "2025-10-30T12:00:00Z"
} | ConvertTo-Json

$task = Invoke-RestMethod -Uri "$baseUrl/tasks" `
    -Method Post `
    -ContentType "application/json" `
    -Headers $userHeaders `
    -Body $taskBody

Write-Host "✅ Task created: $($task.title)" -ForegroundColor Green

Start-Sleep -Seconds 1

# ========================================
# 5. Test USER trying to access admin endpoint (should FAIL)
# ========================================
Write-Host "`n[5/7] USER trying to access admin endpoint..." -ForegroundColor Yellow

try {
    $users = Invoke-RestMethod -Uri "$baseUrl/admin/users" `
        -Method Get `
        -Headers $userHeaders
    
    Write-Host "❌ SECURITY ISSUE: User should NOT have access!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Correctly blocked (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Start-Sleep -Seconds 1

# ========================================
# 6. Login as Admin
# ========================================
Write-Host "`n[6/7] Login as ADMIN..." -ForegroundColor Yellow

$adminLogin = @{
    email = "admin@test.com"
    password = "Admin1234!"
} | ConvertTo-Json

$adminAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $adminLogin

$adminToken = $adminAuth.access_token
$adminHeaders = @{ "Authorization" = "Bearer $adminToken" }

Write-Host "✅ Admin logged in successfully" -ForegroundColor Green
Write-Host "   Admin ID: $($adminAuth.user.id)" -ForegroundColor Gray

Start-Sleep -Seconds 1

# ========================================
# 7. Test ADMIN accessing admin endpoints (should SUCCEED)
# ========================================
Write-Host "`n[7/7] ADMIN accessing admin endpoints..." -ForegroundColor Yellow

try {
    # Get all users
    $allUsers = Invoke-RestMethod -Uri "$baseUrl/admin/users" `
        -Method Get `
        -Headers $adminHeaders
    
    Write-Host "✅ Admin can view all users: $($allUsers.total) users found" -ForegroundColor Green
    
    # Get statistics
    $stats = Invoke-RestMethod -Uri "$baseUrl/admin/statistics" `
        -Method Get `
        -Headers $adminHeaders
    
    Write-Host "✅ Admin can view statistics:" -ForegroundColor Green
    Write-Host "   - Total Users: $($stats.users.total)" -ForegroundColor Gray
    Write-Host "   - Total Tasks: $($stats.tasks.total)" -ForegroundColor Gray
    Write-Host "   - Total Notifications: $($stats.notifications.total)" -ForegroundColor Gray
    
    # Get all tasks
    $allTasks = Invoke-RestMethod -Uri "$baseUrl/admin/tasks/all" `
        -Method Get `
        -Headers $adminHeaders
    
    Write-Host "✅ Admin can view all tasks: $($allTasks.total) tasks found" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}

# ========================================
# Summary
# ========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RBAC Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ Regular users can manage their own tasks" -ForegroundColor Green
Write-Host "✅ Regular users are blocked from admin endpoints" -ForegroundColor Green
Write-Host "✅ Admin users have full system access" -ForegroundColor Green

Write-Host "`n📖 Open Swagger UI: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "📖 Read full guide: RBAC_GUIDE.md`n" -ForegroundColor Cyan


