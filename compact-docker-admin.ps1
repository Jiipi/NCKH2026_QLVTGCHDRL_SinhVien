# Run this script as Administrator
# Right-click PowerShell and select "Run as Administrator"

Write-Host "=== Docker VHDX Compact Tool ===" -ForegroundColor Cyan
Write-Host ""

$vhdPath = "C:\Users\JiiPii\AppData\Local\Docker\wsl\disk\docker_data.vhdx"

# Check if file exists
if (-not (Test-Path $vhdPath)) {
    Write-Host "ERROR: Docker disk not found at: $vhdPath" -ForegroundColor Red
    exit 1
}

# Get size before
$sizeBefore = (Get-Item $vhdPath).Length
$sizeBeforeGB = [math]::Round($sizeBefore / 1GB, 2)
Write-Host "Current size: $sizeBeforeGB GB" -ForegroundColor Yellow

# Check if WSL is running
Write-Host "`nChecking WSL status..." -ForegroundColor Cyan
$wslStatus = wsl --list --verbose
Write-Host $wslStatus

# Shutdown WSL
Write-Host "`nShutting down WSL..." -ForegroundColor Cyan
wsl --shutdown
Start-Sleep -Seconds 5

# Compact the disk
Write-Host "`nCompacting disk... This may take several minutes." -ForegroundColor Cyan
$diskpartCommands = @"
select vdisk file="$vhdPath"
attach vdisk readonly
compact vdisk
detach vdisk
exit
"@

$diskpartCommands | diskpart

Start-Sleep -Seconds 3

# Get size after
$sizeAfter = (Get-Item $vhdPath).Length
$sizeAfterGB = [math]::Round($sizeAfter / 1GB, 2)
$saved = $sizeBeforeGB - $sizeAfterGB

Write-Host "`n=== Results ===" -ForegroundColor Green
Write-Host "Size before: $sizeBeforeGB GB" -ForegroundColor White
Write-Host "Size after:  $sizeAfterGB GB" -ForegroundColor White
Write-Host "Saved:       $saved GB" -ForegroundColor Green

Write-Host "`nYou can now start Docker Desktop again." -ForegroundColor Cyan
