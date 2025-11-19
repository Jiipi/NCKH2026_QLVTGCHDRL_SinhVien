import pathlib
from pathlib import Path

file_path = Path('frontend/src/pages/teacher/ModernReports.js')

try:
    text = file_path.read_text(encoding='utf-8')
except Exception as e:
    print(f'Error reading file: {e}')
    exit(1)

# Mojibake Vietnamese replacements
replacements = {
    'Tuáº§n nĂ y': 'Tuần này',
    'ThĂ¡ng nĂ y': 'Tháng này',
    'NÄƒm nĂ y': 'Năm này',
    'LĂ m má»›i': 'Làm mới',
    'Xuáº¥t Excel': 'Xuất Excel',
    'Xuáº¥t PDF': 'Xuất PDF',
    'Tá»•ng hoáº¡t Ä'á»™ng': 'Tổng hoạt động',
    'Trong khoáº£ng thá»i gian': 'Trong khoảng thời gian',
    'Sinh viĂªn tham gia': 'Sinh viên tham gia',
    'Tá»•ng sá»' sinh viĂªn': 'Tổng số sinh viên',
    'Tá»· lá»‡ tham gia': 'Tỷ lệ tham gia',
    'Trung bĂ¬nh': 'Trung bình',
    'Äiá»ƒm trung bĂ¬nh': 'Điểm trung bình',
    'Äiá»ƒm rĂ¨n luyá»‡n': 'Điểm rèn luyện',
    'Chi tiáº¿t thá»'ng kĂª': 'Chi tiết thống kê',
    'LÆ°á»£t Ä'Äƒng kĂ½ hoáº¡t Ä'á»™ng': 'Lượt đăng ký hoạt động',
    'Tá»•ng sinh viĂªn quáº£n lĂ½': 'Tổng sinh viên quản lý',
    'Tá»· lá»‡ sinh viĂªn tham gia': 'Tỷ lệ sinh viên tham gia',
    'Hoáº¡t Ä'á»™ng theo thĂ¡ng': 'Hoạt động theo tháng',
    'Biá»ƒu Ä'á»" sáº½ Ä'Æ°á»£c hiá»ƒn thá»‹ á»Ÿ Ä'Ă¢y': 'Biểu đồ sẽ được hiển thị ở đây',
    'BĂ¡o cĂ¡o chi tiáº¿t': 'Báo cáo chi tiết',
    'Lá»c>': 'Lọc>',
    'Xuáº¥t bĂ¡o cĂ¡o': 'Xuất báo cáo',
    'ChÆ°a cĂ³ dá»¯ liá»‡u bĂ¡o cĂ¡o': 'Chưa có dữ liệu báo cáo',
    'Dá»¯ liá»‡u bĂ¡o cĂ¡o sáº½ Ä'Æ°á»£c hiá»ƒn thá»‹ khi cĂ³ hoáº¡t Ä'á»™ng': 'Dữ liệu báo cáo sẽ được hiển thị khi có hoạt động'
}

count = 0
for mojibake, correct in replacements.items():
    if mojibake in text:
        text = text.replace(mojibake, correct)
        count += 1
        print(f'✓ Replaced: {mojibake} -> {correct}')

if count > 0:
    file_path.write_text(text, encoding='utf-8')
    print(f'\n✅ Fixed {count} encoding issues in ModernReports.js')
else:
    print('No encoding issues found')
