# Script tạo backup không dấu tiếng Việt

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TẠO BACKUP SQL KHÔNG DẤU TIẾNG VIỆT                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$inputFile = "backend\backups\fresh_backup_20251031_130012.sql"
$outputFile = "backend\backups\fresh_backup_no_accent.sql"

Write-Host "`n[1/3] Reading file..." -ForegroundColor Yellow
$bytes = [System.IO.File]::ReadAllBytes($inputFile)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)
Write-Host "      Size: $([math]::Round($content.Length/1KB, 2)) KB"

Write-Host "`n[2/3] Removing Vietnamese accents..." -ForegroundColor Yellow
# Bỏ dấu từng ký tự
$content = $content `
    -replace 'à|á|ả|ã|ạ','a' `
    -replace 'ă|ắ|ằ|ẳ|ẵ|ặ','a' `
    -replace 'â|ấ|ầ|ẩ|ẫ|ậ','a' `
    -replace 'è|é|ẻ|ẽ|ẹ','e' `
    -replace 'ê|ế|ề|ể|ễ|ệ','e' `
    -replace 'ì|í|ỉ|ĩ|ị','i' `
    -replace 'ò|ó|ỏ|õ|ọ','o' `
    -replace 'ô|ố|ồ|ổ|ỗ|ộ','o' `
    -replace 'ơ|ớ|ờ|ở|ỡ|ợ','o' `
    -replace 'ù|ú|ủ|ũ|ụ','u' `
    -replace 'ư|ứ|ừ|ử|ữ|ự','u' `
    -replace 'ỳ|ý|ỷ|ỹ|ỵ','y' `
    -replace 'đ','d' `
    -replace 'À|Á|Ả|Ã|Ạ','A' `
    -replace 'Ă|Ắ|Ằ|Ẳ|Ẵ|Ặ','A' `
    -replace 'Â|Ấ|Ầ|Ẩ|Ẫ|Ậ','A' `
    -replace 'È|É|Ẻ|Ẽ|Ẹ','E' `
    -replace 'Ê|Ế|Ề|Ể|Ễ|Ệ','E' `
    -replace 'Ì|Í|Ỉ|Ĩ|Ị','I' `
    -replace 'Ò|Ó|Ỏ|Õ|Ọ','O' `
    -replace 'Ô|Ố|Ồ|Ổ|Ỗ|Ộ','O' `
    -replace 'Ơ|Ớ|Ờ|Ở|Ỡ|Ợ','O' `
    -replace 'Ù|Ú|Ủ|Ũ|Ụ','U' `
    -replace 'Ư|Ứ|Ừ|Ử|Ữ|Ự','U' `
    -replace 'Ỳ|Ý|Ỷ|Ỹ|Ỵ','Y' `
    -replace 'Đ','D'

Write-Host "      Processed: $([math]::Round($content.Length/1KB, 2)) KB"

Write-Host "`n[3/3] Writing file (UTF-8 without BOM)..." -ForegroundColor Yellow
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputFile, $content, $utf8NoBom)

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ HOÀN TẤT                                              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

$file = Get-Item $outputFile
Write-Host "`nFile: $($file.Name)"
Write-Host "Size: $([math]::Round($file.Length/1MB, 2)) MB"
Write-Host "Path: $($file.FullName)" -ForegroundColor Gray

# Verify
Write-Host "`n--- VERIFICATION ---" -ForegroundColor Cyan
$sampleLines = Get-Content $outputFile -TotalCount 50 -Encoding UTF8
$copyLine = $sampleLines | Where-Object { $_ -match '^COPY public\.' } | Select-Object -First 1
if ($copyLine) {
    Write-Host "✅ SQL structure intact"
} else {
    Write-Host "⚠️  Warning: Could not find COPY statement"
}

Write-Host "`n🚀 Ready to deploy to EC2!"
Write-Host "   scp -i key.pem $outputFile ec2-user@<EC2_IP>:~/backup.sql" -ForegroundColor Gray
