import os
import json

history_path = r'C:\Users\JiiPii\AppData\Roaming\Code\User\History'
project_keyword = 'DACN_Web_quanly_hoatdongrenluyen-master'

count = 0
for root, dirs, files in os.walk(history_path):
    if 'entries.json' in files:
        entries_file = os.path.join(root, 'entries.json')
        try:
            with open(entries_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            resource = data.get('resource', '')
            if project_keyword.lower() in resource.lower():
                count += 1
                if count <= 5:
                    print(f"Found match: {resource}")
        except Exception as e:
            pass

print(f"Total matching folders: {count}")
