import os
import json
import time

history_path = r'C:\Users\JiiPii\AppData\Roaming\Code\User\History'
project_keyword = 'DACN_Web_quanly_hoatdongrenluyen-master'

# Look back 48 hours
cutoff_time = (time.time() - 48 * 3600) * 1000  # ms

found_files = []

for root, dirs, files in os.walk(history_path):
    if 'entries.json' in files:
        entries_file = os.path.join(root, 'entries.json')
        try:
            with open(entries_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            resource = data.get('resource', '')
            if project_keyword in resource:
                # Get the latest entry
                entries = data.get('entries', [])
                if not entries:
                    continue
                
                # Sort by timestamp descending
                entries.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
                latest_entry = entries[0]
                latest_time = latest_entry.get('timestamp', 0)
                
                if latest_time > cutoff_time:
                    # Found a recently modified file!
                    # Normalize the resource path
                    import urllib.parse
                    clean_path = urllib.parse.unquote(resource.replace('file:///', '').replace('file://', ''))
                    
                    entry_file_path = os.path.join(root, latest_entry.get('id', ''))
                    
                    found_files.append({
                        'path': clean_path,
                        'time': latest_time,
                        'backup_file': entry_file_path
                    })
        except Exception as e:
            pass

# Sort results by time descending
found_files.sort(key=lambda x: x['time'], reverse=True)

print(f"Found {len(found_files)} files modified in the last 48 hours in VS Code Local History!")
for item in found_files:
    dt = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(item['time']/1000))
    print(f"[{dt}] {item['path']}")
    print(f"  -> Backup: {item['backup_file']}")

