# Test API Script
Write-Host "=== Testing Backend API ===" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    Write-Host "✓ Health: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login
Write-Host "`n2. Testing Login..." -ForegroundColor Yellow
$token = $null
try {
    $loginBody = @{
        maso = "admin"
        password = "123456"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host ($loginResponse | ConvertTo-Json -Depth 5)
    $token = $loginResponse.data.token
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.data.user.ho_ten)" -ForegroundColor Cyan
    Write-Host "  Role: $($loginResponse.data.user.roleCode)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Activities (with auth)
if ($token) {
    Write-Host "`n3. Testing Activities Endpoint (with auth)..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $activities = Invoke-RestMethod -Uri "http://localhost:5000/api/v2/activities" -Method GET -Headers $headers
        Write-Host "✓ Activities fetched: $($activities.data.length) items" -ForegroundColor Green
    } catch {
        Write-Host "✗ Activities failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n3. Skipping Activities test (no token)." -ForegroundColor Yellow
}


# Test 4: Get Profile
if ($token) {
    Write-Host "`n4. Testing Profile Endpoint..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $profile = Invoke-RestMethod -Uri "http://localhost:5000/api/v2/profile" -Method GET -Headers $headers
        Write-Host "✓ Profile fetched: $($profile.data.ho_ten)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Profile failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n4. Skipping Profile test (no token)." -ForegroundColor Yellow
}


Write-Host "`n=== All Tests Completed ===`n" -ForegroundColor Green

