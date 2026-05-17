import os
import json

history_path = r'C:\Users\JiiPii\AppData\Roaming\Code\User\History'
project_keyword = 'DACN_Web_quanly_hoatdongrenluyen-master'

for root, dirs, files in os.walk(history_path):
    if 'entries.json' in files:
        entries_file = os.path.join(root, 'entries.json')
        try:
            with open(entries_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            resource = data.get('resource', '')
            if 'FaceAttendanceCard.tsx' in resource and project_keyword in resource:
                entries = data.get('entries', [])
                if entries:
                    entries.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
                    print(f"Resource: {resource}")
                    for e in entries[:3]:
                        print(f"  id: {e.get('id')}, ts: {e.get('timestamp')}")
                break
        except Exception as e:
            pass
