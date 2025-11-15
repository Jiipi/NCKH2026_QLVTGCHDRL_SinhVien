# Batch update all imports to FSD structure
$rootPath = "d:\DACN_Web_quanly_hoatdongrenluyen-master\frontend\src"

Write-Host "=== Batch updating imports to FSD structure ===" -ForegroundColor Cyan

# Phase 1: Update imports from components/ to new FSD paths
$files = Get-ChildItem -Path "$rootPath\pages","$rootPath\features","$rootPath\widgets" -Filter "*.js" -Recurse -File

$replacements = @{
    # Components → shared/ui
    "from '../../components/Pagination'" = "from '../../shared/ui/Pagination'"
    "from '../../../components/Pagination'" = "from '../../../shared/ui/Pagination'"
    "from '../../components/Card'" = "from '../../shared/ui/Card'"
    "from '../../../components/Card'" = "from '../../../shared/ui/Card'"
    "from '../../components/EmptyState'" = "from '../../shared/ui/EmptyState'"
    "from '../../../components/EmptyState'" = "from '../../../shared/ui/EmptyState'"
    "from '../../components/FileUpload'" = "from '../../shared/ui/FileUpload'"
    "from '../../../components/FileUpload'" = "from '../../../shared/ui/FileUpload'"
    "from '../../components/AdminTable'" = "from '../../shared/ui/Table'"
    "from '../components/AdminTable'" = "from '../shared/ui/Table'"
    "from '../../components/Modal'" = "from '../../shared/ui/Modal'"
    "from '../../../components/Modal'" = "from '../../../shared/ui/Modal'"
    
    # Components → entities
    "from '../../components/AvatarUpload'" = "from '../../entities/user/ui/Avatar'"
    "from '../../../components/AvatarUpload'" = "from '../../../entities/user/ui/Avatar'"
    "from '../../components/ActivityDetailModal'" = "from '../../entities/activity/ui/ActivityDetailModal'"
    "from '../../../components/ActivityDetailModal'" = "from '../../../entities/activity/ui/ActivityDetailModal'"
    
    # Components → widgets
    "from '../../components/SemesterFilter'" = "from '../../widgets/semester/ui/SemesterSwitcher'"
    "from '../../../components/SemesterFilter'" = "from '../../../widgets/semester/ui/SemesterSwitcher'"
    "from '../../../components/ModernHeader'" = "from '../../../widgets/header/ui/ModernHeader'"
    "from '../../components/ModernHeader'" = "from '../../widgets/header/ui/ModernHeader'"
    "from '../../../components/ModernFooter'" = "from '../../../widgets/header/ui/ModernFooter'"
    "from '../../components/ModernFooter'" = "from '../../widgets/header/ui/ModernFooter'"
    "from '../../../components/StudentLayout'" = "from '../../../widgets/layout/ui/StudentLayout'"
    "from '../../components/StudentLayout'" = "from '../../widgets/layout/ui/StudentLayout'"
    "from '../../../components/ModernTeacherLayout'" = "from '../../../widgets/layout/ui/TeacherLayout'"
    "from '../../components/ModernTeacherLayout'" = "from '../../widgets/layout/ui/TeacherLayout'"
    "from '../../../components/MonitorLayout'" = "from '../../../widgets/layout/ui/MonitorLayout'"
    "from '../../components/MonitorLayout'" = "from '../../widgets/layout/ui/MonitorLayout'"
    
    # Services → shared/api
    "from '../../services/http'" = "from '../../shared/api/http'"
    "from '../services/http'" = "from '../shared/api/http'"
    "from '../../../services/http'" = "from '../../../shared/api/http'"
    "from '../../services/sessionStorageManager'" = "from '../../shared/api/sessionStorageManager'"
    "from '../services/sessionStorageManager'" = "from '../shared/api/sessionStorageManager'"
    "from '../../../services/sessionStorageManager'" = "from '../../../shared/api/sessionStorageManager'"
    
    # Utils → shared/lib
    "from '../../utils/dateFormat'" = "from '../../shared/lib/date'"
    "from '../../../utils/dateFormat'" = "from '../../../shared/lib/date'"
    "from '../../utils/avatarUtils'" = "from '../../shared/lib/avatar'"
    "from '../../../utils/avatarUtils'" = "from '../../../shared/lib/avatar'"
    "from '../../utils/role'" = "from '../../shared/lib/role'"
    "from '../utils/role'" = "from '../shared/lib/role'"
    "from '../../../utils/role'" = "from '../../../shared/lib/role'"
    "from '../../utils/activityImages'" = "from '../../shared/lib/activityImages'"
    "from '../../../utils/activityImages'" = "from '../../../shared/lib/activityImages'"
}

$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    $fileChanged = $false
    
    foreach ($search in $replacements.Keys) {
        $replace = $replacements[$search]
        if ($content -match [regex]::Escape($search)) {
            $content = $content -replace [regex]::Escape($search), $replace
            $fileChanged = $true
            $totalReplacements++
        }
    }
    
    if ($fileChanged) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $totalFiles++
        Write-Host "✓ Updated: $($file.FullName.Replace($rootPath, 'src'))" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Files updated: $totalFiles" -ForegroundColor Yellow
Write-Host "Total replacements: $totalReplacements" -ForegroundColor Yellow
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
