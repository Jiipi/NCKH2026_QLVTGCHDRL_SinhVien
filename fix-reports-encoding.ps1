# Fix Vietnamese encoding in ModernReports.js
$file = 'd:\DACN_Web_quanly_hoatdongrenluyen-master\frontend\src\pages\teacher\ModernReports.js'
$content = Get-Content $file -Raw -Encoding UTF8

# Fix all mojibake characters
$replacements = @{
    'Tuáº§n nĂ y' = 'Tuần này'
    'ThĂ¡ng nĂ y' = 'Tháng này'
    'NÄƒm nĂ y' = 'Năm này'
    'LĂ m má»›i' = 'Làm mới'
    'Xuáº¥t Excel' = 'Xuất Excel'
    'Xuáº¥t PDF' = 'Xuất PDF'
    'Tá»•ng hoáº¡t Ä'á»™ng' = 'Tổng hoạt động'
    'Trong khoáº£ng thá»i gian' = 'Trong khoảng thời gian'
    'Sinh viĂªn tham gia' = 'Sinh viên tham gia'
    'Tá»•ng sá»' sinh viĂªn' = 'Tổng số sinh viên'
    'Tá»· lá»‡ tham gia' = 'Tỷ lệ tham gia'
    'Trung bĂ¬nh' = 'Trung bình'
    'Äiá»ƒm trung bĂ¬nh' = 'Điểm trung bình'
    'Äiá»ƒm rĂ¨n luyá»‡n' = 'Điểm rèn luyện'
    'Chi tiáº¿t thá»'ng kĂª' = 'Chi tiết thống kê'
    'LÆ°á»£t Ä'Äƒng kĂ½ hoáº¡t Ä'á»™ng' = 'Lượt đăng ký hoạt động'
    'Tá»•ng sinh viĂªn quáº£n lĂ½' = 'Tổng sinh viên quản lý'
    'Tá»· lá»‡ sinh viĂªn tham gia' = 'Tỷ lệ sinh viên tham gia'
    'Hoáº¡t Ä'á»™ng theo thĂ¡ng' = 'Hoạt động theo tháng'
    'Biá»ƒu Ä'á»" sáº½ Ä'Æ°á»£c hiá»ƒn thá»‹ á»Ÿ Ä'Ă¢y' = 'Biểu đồ sẽ được hiển thị ở đây'
    'BĂ¡o cĂ¡o chi tiáº¿t' = 'Báo cáo chi tiết'
    'Lá»c>' = 'Lọc>'
    'Xuáº¥t bĂ¡o cĂ¡o' = 'Xuất báo cáo'
    'ChÆ°a cĂ³ dá»¯ liá»‡u bĂ¡o cĂ¡o' = 'Chưa có dữ liệu báo cáo'
    'Dá»¯ liá»‡u bĂ¡o cĂ¡o sáº½ Ä'Æ°á»£c hiá»ƒn thá»‹ khi cĂ³ hoáº¡t Ä'á»™ng' = 'Dữ liệu báo cáo sẽ được hiển thị khi có hoạt động'
}

foreach ($key in $replacements.Keys) {
    $content = $content -replace [regex]::Escape($key), $replacements[$key]
}

Set-Content $file $content -Encoding UTF8 -NoNewline
Write-Host "Fixed all Vietnamese encoding issues in ModernReports.js"
