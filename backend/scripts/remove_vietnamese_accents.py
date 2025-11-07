#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script để bỏ dấu tiếng Việt trong file SQL backup
"""

import re
import unicodedata

def remove_accents(text):
    """Bỏ dấu tiếng Việt"""
    # Map các ký tự có dấu sang không dấu
    vietnamese_map = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd',
        'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
        'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
        'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
        'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
        'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
        'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
        'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
        'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
        'Đ': 'D',
    }
    
    result = []
    for char in text:
        if char in vietnamese_map:
            result.append(vietnamese_map[char])
        else:
            result.append(char)
    
    return ''.join(result)

def process_sql_file(input_file, output_file):
    """Xử lý file SQL và bỏ dấu tiếng Việt"""
    print(f"📖 Reading: {input_file}")
    
    # Try different encodings
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    content = None
    
    for encoding in encodings:
        try:
            with open(input_file, 'r', encoding=encoding) as f:
                content = f.read()
            print(f"✅ Successfully read with encoding: {encoding}")
            break
        except UnicodeDecodeError:
            continue
    
    if content is None:
        print("❌ Could not read file with any encoding!")
        return
    
    print(f"📝 Original size: {len(content):,} characters")
    
    # Bỏ dấu
    print("🔄 Removing Vietnamese accents...")
    content_no_accent = remove_accents(content)
    
    print(f"✅ Processed size: {len(content_no_accent):,} characters")
    
    # Ghi file mới với encoding UTF-8 không BOM
    print(f"💾 Writing: {output_file}")
    with open(output_file, 'w', encoding='utf-8-sig', newline='\n') as f_temp:
        pass  # Clear file first
    
    # Write without BOM
    with open(output_file, 'wb') as f:
        f.write(content_no_accent.encode('utf-8'))
    
    print(f"✅ Done! File saved: {output_file}")
    
    # Statistics
    accent_count = sum(1 for i, (c1, c2) in enumerate(zip(content, content_no_accent)) if c1 != c2)
    print(f"📊 Removed {accent_count:,} accented characters")

if __name__ == "__main__":
    import sys
    import os
    
    # Default files
    input_file = "backend/backups/fresh_backup_20251031_130012.sql"
    output_file = "backend/backups/fresh_backup_no_accent_20251031_130012.sql"
    
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"❌ File not found: {input_file}")
        sys.exit(1)
    
    process_sql_file(input_file, output_file)
