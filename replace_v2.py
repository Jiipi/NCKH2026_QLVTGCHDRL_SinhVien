import pathlib
from pathlib import Path

root = Path('.')
TARGET_SUFFIXES = {".js", ".jsx", ".ts", ".tsx", ".md", ".json", ".yml", ".yaml"}

changed_files = []
for path in root.rglob('*'):
    if not path.is_file():
        continue
    if path.suffix.lower() not in TARGET_SUFFIXES:
        continue
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    if '/v2/' not in text and '/api/v2' not in text:
        continue
    new_text = text.replace('/v2/', '/core/').replace('/api/core', '/api/core')
    if text != new_text:
        path.write_text(new_text, encoding='utf-8')
        changed_files.append(str(path))

print('Updated', len(changed_files), 'files')
