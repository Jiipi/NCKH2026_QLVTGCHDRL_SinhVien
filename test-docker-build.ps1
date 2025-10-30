# Build frontend trong Docker (local test)
# Không cần Node.js local

Write-Host "Building frontend in Docker environment..." -ForegroundColor Yellow

docker build -t test-frontend-build `
  --build-arg REACT_APP_API_URL=http://localhost:3001/api `
  -f frontend/Dockerfile.production `
  frontend/

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build SUCCESS in Docker!" -ForegroundColor Green
    Write-Host "`nTo extract build folder:" -ForegroundColor Cyan
    Write-Host "docker create --name temp-container test-frontend-build" -ForegroundColor White
    Write-Host "docker cp temp-container:/usr/share/nginx/html ./build-output" -ForegroundColor White
    Write-Host "docker rm temp-container" -ForegroundColor White
} else {
    Write-Host "`n❌ Build FAILED" -ForegroundColor Red
}
