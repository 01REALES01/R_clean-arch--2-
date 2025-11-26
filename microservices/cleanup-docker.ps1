# Docker Cleanup Script
# This script will clean up Kubernetes deployments and Docker resources

Write-Host "🧹 Starting Docker Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all running Docker Compose services
Write-Host "Step 1: Stopping Docker Compose services..." -ForegroundColor Yellow
docker compose down
Write-Host "✅ Docker Compose services stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Remove Kubernetes deployments
Write-Host "Step 2: Removing Kubernetes deployments..." -ForegroundColor Yellow
try {
    kubectl delete all --all --namespace=default 2>$null
    kubectl delete all --all --namespace=taskflow 2>$null
    Write-Host "✅ Kubernetes deployments removed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No Kubernetes deployments found or kubectl not available" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Remove all stopped containers
Write-Host "Step 3: Removing stopped containers..." -ForegroundColor Yellow
docker container prune -f
Write-Host "✅ Stopped containers removed" -ForegroundColor Green
Write-Host ""

# Step 4: Remove unused images
Write-Host "Step 4: Removing unused images..." -ForegroundColor Yellow
docker image prune -a -f
Write-Host "✅ Unused images removed" -ForegroundColor Green
Write-Host ""

# Step 5: Remove unused volumes (CAREFUL: This removes data!)
Write-Host "Step 5: Removing unused volumes..." -ForegroundColor Yellow
Write-Host "⚠️  WARNING: This will remove database data!" -ForegroundColor Red
$response = Read-Host "Do you want to remove volumes? (y/N)"
if ($response -eq 'y' -or $response -eq 'Y') {
    docker volume prune -f
    Write-Host "✅ Unused volumes removed" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipped volume cleanup" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Remove unused networks
Write-Host "Step 6: Removing unused networks..." -ForegroundColor Yellow
docker network prune -f
Write-Host "✅ Unused networks removed" -ForegroundColor Green
Write-Host ""

# Step 7: Show disk usage
Write-Host "Step 7: Current Docker disk usage:" -ForegroundColor Yellow
docker system df
Write-Host ""

Write-Host "🎉 Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: docker compose up --build" -ForegroundColor White
Write-Host "  2. Wait for all services to start" -ForegroundColor White
Write-Host "  3. Access your app at http://localhost" -ForegroundColor White
