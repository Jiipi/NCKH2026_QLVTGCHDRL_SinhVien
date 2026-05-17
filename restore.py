import json
import os

log_path = r'C:\Users\JiiPii\.gemini\antigravity\brain\c4d5c496-f148-4a7f-bf98-11574b756740\.system_generated\logs\overview.txt'

def apply_replacement(filepath, target, replacement):
    if not os.path.exists(filepath):
        print(f'File not found: {filepath}')
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try normalizing line endings in case of mismatch
    content_norm = content.replace('\r\n', '\n')
    target_norm = target.replace('\r\n', '\n')
    
    if target_norm in content_norm:
        new_content = content_norm.replace(target_norm, replacement.replace('\r\n', '\n'))
        # Restore CRLF if needed (Windows)
        new_content = new_content.replace('\n', '\r\n')
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)
        print(f'Successfully updated {filepath}')
    else:
        print(f'Target not found in {filepath}')

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line.strip())
            if 'tool_calls' in data:
                for call in data['tool_calls']:
                    if call['name'] == 'replace_file_content':
                        args = call['args']
                        apply_replacement(args['TargetFile'], args['TargetContent'], args['ReplacementContent'])
                    elif call['name'] == 'multi_replace_file_content':
                        args = call['args']
                        chunks = json.loads(args['ReplacementChunks'])
                        for chunk in chunks:
                            apply_replacement(args['TargetFile'], chunk['TargetContent'], chunk['ReplacementContent'])
        except Exception as e:
            if "TargetFile" in str(line):
                print(e)
