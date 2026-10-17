import json
from pathlib import Path
root = Path('.')
old = json.loads((root/'knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/before/package-lock.json').read_text())
path = root/'package-lock.json'
current = json.loads(path.read_text())
for name, package in old['packages'].items():
    if 'libc' in package and name in current['packages']:
        target = current['packages'][name]
        ordered = {}
        for key, value in target.items():
            if key == 'license': ordered['libc'] = package['libc']
            ordered[key] = value
        current['packages'][name] = ordered
path.write_text(json.dumps(current, indent=2)+'\n')
path = root/'package.json'
current = json.loads(path.read_text())
current['scripts'].update({'test':'playwright test','test:unit':'playwright test --project=unit','test:browser':'playwright test --project=desktop --project=mobile'})
path.write_text(json.dumps(current, indent=2)+'\n')
