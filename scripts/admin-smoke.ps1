param(
  [string]$BaseUrl = 'http://127.0.0.1:3500'
)

$routes = @(
  '/admin',
  '/admin/users',
  '/admin/activities',
  '/admin/approvals',
  '/admin/reports',
  '/admin/settings',
  '/admin/profile',
  '/admin/semesters',
  '/admin/roles',
  '/admin/notifications',
  '/admin/qr-attendance',
  '/admin/activity-types'
)

Write-Host "=== Admin Route Smoke Test ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor DarkCyan

$results = @()
foreach ($r in $routes) {
  $url = "$BaseUrl$r"
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -Method GET -TimeoutSec 15
    $code = $resp.StatusCode
    $results += [pscustomobject]@{ Route = $r; StatusCode = $code; Length = $resp.Content.Length }
    Write-Host "[OK] $r => $code" -ForegroundColor Green
  }
  catch {
    $results += [pscustomobject]@{ Route = $r; StatusCode = 'ERR'; Length = 0 }
    Write-Host "[FAIL] $r => $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "\nSummary:" -ForegroundColor Yellow
$results | Format-Table -AutoSize

$failed = $results | Where-Object { $_.StatusCode -ne 200 -and $_.StatusCode -ne '200' }
if ($failed.Count -gt 0) {
  Write-Host "\nSome routes failed." -ForegroundColor Red
  exit 1
} else {
  Write-Host "\nAll routes returned 200 (index.html fallback counts as accessible)." -ForegroundColor Green
  exit 0
}
