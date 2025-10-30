# Rebuild Docker without cache to pick up new dependencies
Write-Host "🔄 Rebuilding Docker containers without cache..." -ForegroundColor Cyan

docker-compose -f docker-compose.production.yml build --no-cache frontend

Write-Host "✅ Rebuild complete!" -ForegroundColor Green
Write-Host "Now run: docker-compose -f docker-compose.production.yml up -d" -ForegroundColor Yellow
