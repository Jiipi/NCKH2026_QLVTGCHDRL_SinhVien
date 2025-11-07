# Script bỏ dấu tiếng Việt trong SQL file
param(
    [string]$InputFile = "backend\backups\fresh_backup_20251031_130012.sql",
    [string]$OutputFile = "backend\backups\fresh_backup_no_accent.sql"
)

Write-Host "`n=== BỎ DẤU TIẾNG VIỆT TRONG SQL FILE ===" -ForegroundColor Cyan

# Function để bỏ dấu
function Remove-VietnameseAccents {
    param([string]$Text)
    
    $map = @{
        'à'='a';'á'='a';'ả'='a';'ã'='a';'ạ'='a'
        'ă'='a';'ằ'='a';'ắ'='a';'ẳ'='a';'ẵ'='a';'ặ'='a'
        'â'='a';'ầ'='a';'ấ'='a';'ẩ'='a';'ẫ'='a';'ậ'='a'
        'è'='e';'é'='e';'ẻ'='e';'ẽ'='e';'ẹ'='e'
        'ê'='e';'ề'='e';'ế'='e';'ể'='e';'ễ'='e';'ệ'='e'
        'ì'='i';'í'='i';'ỉ'='i';'ĩ'='i';'ị'='i'
        'ò'='o';'ó'='o';'ỏ'='o';'õ'='o';'ọ'='o'
        'ô'='o';'ồ'='o';'ố'='o';'ổ'='o';'ỗ'='o';'ộ'='o'
        'ơ'='o';'ờ'='o';'ớ'='o';'ở'='o';'ỡ'='o';'ợ'='o'
        'ù'='u';'ú'='u';'ủ'='u';'ũ'='u';'ụ'='u'
        'ư'='u';'ừ'='u';'ứ'='u';'ử'='u';'ữ'='u';'ự'='u'
        'ỳ'='y';'ý'='y';'ỷ'='y';'ỹ'='y';'ỵ'='y'
        'đ'='d'
        'À'='A';'Á'='A';'Ả'='A';'Ã'='A';'Ạ'='A'
        'Ă'='A';'Ằ'='A';'Ắ'='A';'Ẳ'='A';'Ẵ'='A';'Ặ'='A'
        'Â'='A';'Ầ'='A';'Ấ'='A';'Ẩ'='A';'Ẫ'='A';'Ậ'='A'
        'È'='E';'É'='E';'Ẻ'='E';'Ẽ'='E';'Ẹ'='E'
        'Ê'='E';'Ề'='E';'Ế'='E';'Ể'='E';'Ễ'='E';'Ệ'='E'
        'Ì'='I';'Í'='I';'Ỉ'='I';'Ĩ'='I';'Ị'='I'
        'Ò'='O';'Ó'='O';'Ỏ'='O';'Õ'='O';'Ọ'='O'
        'Ô'='O';'Ồ'='O';'Ố'='O';'Ổ'='O';'Ỗ'='O';'Ộ'='O'
        'Ơ'='O';'Ờ'='O';'Ớ'='O';'Ở'='O';'Ỡ'='O';'Ợ'='O'
        'Ù'='U';'Ú'='U';'Ủ'='U';'Ũ'='U';'Ụ'='U'
        'Ư'='U';'Ừ'='U';'Ứ'='U';'Ử'='U';'Ữ'='U';'Ự'='U'
        'Ỳ'='Y';'Ý'='Y';'Ỷ'='Y';'Ỹ'='Y';'Ỵ'='Y'
        'Đ'='D'
    }
    
    $result = $Text
    foreach ($key in $map.Keys) {
        $result = $result -creplace $key, $map[$key]
    }
    
    return $result
}

Write-Host "📖 Reading: $InputFile"
$content = [System.IO.File]::ReadAllText($InputFile, [System.Text.Encoding]::UTF8)

Write-Host "📝 Original size: $($content.Length) characters"

Write-Host "🔄 Removing Vietnamese accents..."
$contentNoAccent = Remove-VietnameseAccents -Text $content

Write-Host "💾 Writing: $OutputFile"
# Write without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($OutputFile, $contentNoAccent, $utf8NoBom)

Write-Host "✅ Done!" -ForegroundColor Green

# Verify
$file = Get-Item $OutputFile
Write-Host "`n📊 Output file:"
Write-Host "   Size: $([math]::Round($file.Length/1MB, 2)) MB"
Write-Host "   Path: $($file.FullName)"

# Sample check
Write-Host "`n🔍 Sample check (first 200 chars):"
$sample = Get-Content $OutputFile -TotalCount 10 -Encoding UTF8 | Out-String
Write-Host $sample.Substring(0, [Math]::Min(200, $sample.Length))
