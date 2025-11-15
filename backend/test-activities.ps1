# Test Activities Endpoints

Write-Host "=== Testing Activities Module ===" -ForegroundColor Cyan

# 1. Login
Write-Host "`n1. Login..." -ForegroundColor Yellow
$loginBody = @{
    maso = "202101002"
    password = "123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
    $token = $loginResponse.data.accessToken
    Write-Host "✓ Login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    Authorization = "Bearer $token"
}

# 2. Get activities list
Write-Host "`n2. GET /api/activities (list)..." -ForegroundColor Yellow
try {
    $activities = Invoke-RestMethod -Uri 'http://localhost:3001/api/activities?page=1&limit=5' -Headers $headers
    Write-Host "✓ Activities list retrieved" -ForegroundColor Green
    Write-Host "  Total: $($activities.data.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

# 3. Test V2 endpoint
Write-Host "`n3. GET /api/v2/activities (v2)..." -ForegroundColor Yellow
try {
    $activitiesV2 = Invoke-RestMethod -Uri 'http://localhost:3001/api/v2/activities?page=1&limit=5' -Headers $headers
    Write-Host "✓ V2 Activities list retrieved" -ForegroundColor Green
    Write-Host "  Total: $($activitiesV2.data.total)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
