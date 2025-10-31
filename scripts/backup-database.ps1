#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script backup database với 2 chế độ: schema-only và full-data
    
.DESCRIPTION
    Tạo 2 file backup:
    1. schema_only_backup_[timestamp].sql - Chỉ cấu trúc bảng, indexes, constraints
    2. full_backup_[timestamp].sql - Cấu trúc + toàn bộ dữ liệu
    
.PARAMETER Mode
    Chế độ backup: "schema", "full", hoặc "both" (mặc định: both)
    
.EXAMPLE
    .\backup-database.ps1
    .\backup-database.ps1 -Mode schema
    .\backup-database.ps1 -Mode full
#>

param(
    [string]$Mode = "both"
)

# Load environment variables
$envFile = Join-Path $PSScriptRoot ".." "backend" ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.+)\s*$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Parse DATABASE_URL
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
    Write-Host "❌ DATABASE_URL not found in .env file" -ForegroundColor Red
    exit 1
}

# Extract connection info
if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPass = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
} else {
    Write-Host "❌ Invalid DATABASE_URL format" -ForegroundColor Red
    exit 1
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPass

# Create backup directory
$backupDir = Join-Path $PSScriptRoot ".." "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "           DATABASE BACKUP UTILITY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Database Info:" -ForegroundColor Green
Write-Host "   Host:     $dbHost:$dbPort"
Write-Host "   Database: $dbName"
Write-Host "   User:     $dbUser"
Write-Host "   Mode:     $Mode"
Write-Host ""

# Function to check if pg_dump is available
function Test-PgDump {
    try {
        $null = Get-Command pg_dump -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-PgDump)) {
    Write-Host "❌ pg_dump not found in PATH!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions:" -ForegroundColor Yellow
    Write-Host "   1. Install PostgreSQL client tools"
    Write-Host "   2. Add PostgreSQL bin to PATH"
    Write-Host "   3. Use Docker: docker exec dacn_db pg_dump ..."
    Write-Host ""
    
    # Check if running in Docker
    $dockerRunning = docker ps --filter "name=dacn_db" --format "{{.Names}}" 2>$null
    if ($dockerRunning -eq "dacn_db") {
        Write-Host "🐳 Found Docker container 'dacn_db', using Docker method..." -ForegroundColor Cyan
        $useDocker = $true
    } else {
        exit 1
    }
} else {
    $useDocker = $false
}

# Backup Schema Only
if ($Mode -eq "schema" -or $Mode -eq "both") {
    Write-Host "🔧 Creating SCHEMA-ONLY backup..." -ForegroundColor Yellow
    $schemaFile = Join-Path $backupDir "schema_only_backup_$timestamp.sql"
    
    if ($useDocker) {
        docker exec dacn_db pg_dump -U $dbUser -d $dbName --schema-only --no-owner --no-acl -f "/tmp/schema_backup.sql"
        docker cp "dacn_db:/tmp/schema_backup.sql" $schemaFile
        docker exec dacn_db rm /tmp/schema_backup.sql
    } else {
        pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName --schema-only --no-owner --no-acl -f $schemaFile
    }
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $schemaFile)) {
        $size = (Get-Item $schemaFile).Length / 1KB
        Write-Host "   ✅ Schema backup created: $([System.IO.Path]::GetFileName($schemaFile))" -ForegroundColor Green
        Write-Host "   📦 Size: $([math]::Round($size, 2)) KB" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Schema backup failed!" -ForegroundColor Red
    }
}

# Backup Full Data
if ($Mode -eq "full" -or $Mode -eq "both") {
    Write-Host ""
    Write-Host "💾 Creating FULL DATA backup..." -ForegroundColor Yellow
    $fullFile = Join-Path $backupDir "full_backup_$timestamp.sql"
    
    if ($useDocker) {
        docker exec dacn_db pg_dump -U $dbUser -d $dbName --no-owner --no-acl -f "/tmp/full_backup.sql"
        docker cp "dacn_db:/tmp/full_backup.sql" $fullFile
        docker exec dacn_db rm /tmp/full_backup.sql
    } else {
        pg_dump -h $dbHost -p $dbPort -U $dbUser -d $dbName --no-owner --no-acl -f $fullFile
    }
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $fullFile)) {
        $size = (Get-Item $fullFile).Length / 1KB
        Write-Host "   ✅ Full backup created: $([System.IO.Path]::GetFileName($fullFile))" -ForegroundColor Green
        Write-Host "   📦 Size: $([math]::Round($size, 2)) KB" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Full backup failed!" -ForegroundColor Red
    }
}

# Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📊 BACKUP SUMMARY" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$backupFiles = Get-ChildItem -Path $backupDir -Filter "*backup_$timestamp.sql"
if ($backupFiles.Count -gt 0) {
    Write-Host ""
    foreach ($file in $backupFiles) {
        $sizeKB = [math]::Round($file.Length / 1KB, 2)
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "✅ $($file.Name)" -ForegroundColor Green
        Write-Host "   📂 Location: $($file.FullName)"
        Write-Host "   📦 Size: $sizeKB KB ($sizeMB MB)"
        Write-Host ""
    }
    
    Write-Host "💡 Restore Instructions:" -ForegroundColor Yellow
    Write-Host "   Schema only: psql -U $dbUser -d $dbName -f schema_only_backup_$timestamp.sql"
    Write-Host "   Full data:   psql -U $dbUser -d $dbName -f full_backup_$timestamp.sql"
    Write-Host ""
    Write-Host "   Or using Docker:"
    Write-Host "   docker exec -i dacn_db psql -U $dbUser -d $dbName < backups\full_backup_$timestamp.sql"
} else {
    Write-Host "❌ No backup files created!" -ForegroundColor Red
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = $null
