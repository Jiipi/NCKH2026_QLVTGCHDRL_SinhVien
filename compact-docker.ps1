# Compact Docker WSL2 Virtual Disk
$vhdPath = "$env:LOCALAPPDATA\Docker\wsl\data\ext4.vhdx"

if (Test-Path $vhdPath) {
    Write-Host "Found Docker disk at: $vhdPath" -ForegroundColor Green
    $sizeBeforeMB = [math]::Round((Get-Item $vhdPath).Length / 1MB, 2)
    Write-Host "Current size: $sizeBeforeMB MB" -ForegroundColor Yellow
    
    Write-Host "`nCompacting disk..." -ForegroundColor Cyan
    
    $diskpartScript = @"
select vdisk file="$vhdPath"
attach vdisk readonly
compact vdisk
detach vdisk
exit
"@
    
    $diskpartScript | diskpart
    
    $sizeAfterMB = [math]::Round((Get-Item $vhdPath).Length / 1MB, 2)
    $savedMB = $sizeBeforeMB - $sizeAfterMB
    
    Write-Host "`nSize after compact: $sizeAfterMB MB" -ForegroundColor Green
    Write-Host "Space reclaimed: $savedMB MB" -ForegroundColor Green
} else {
    Write-Host "Docker disk not found at: $vhdPath" -ForegroundColor Red
    Write-Host "Please check Docker Desktop installation." -ForegroundColor Yellow
}
