"""Read-only image inspection; writes the E06 asset inventory, never edits images."""
from pathlib import Path
from PIL import Image
import hashlib
import json

root = Path(__file__).resolve().parents[3]
assets = []
for file in sorted((root / 'assets/images').iterdir()):
  if file.suffix.lower() not in ['.webp', '.jpg', '.png']:
    continue
  with Image.open(file) as im:
    alpha = im.getchannel('A').getextrema() if 'A' in im.getbands() else None
    mask = file.name in ['a07-plant.webp', 'a08-transition-branch.webp']
    kind = ('transparent-monochrome-decoration' if mask else
            'photo' if file.suffix.lower() == '.jpg' else
            'category-illustration-on-paper' if file.name.startswith('cat-') else
            'character-illustration')
    assets.append({'path': file.relative_to(root).as_posix(), 'size': im.size, 'mode': im.mode,
                   'alphaRange': alpha, 'kind': kind, 'darkTreatment': 'original-alpha-mask' if mask else 'preserve-original',
                   'sha256': hashlib.sha256(file.read_bytes()).hexdigest()})
out = Path(__file__).with_name('asset-audit.json')
out.write_text(json.dumps({'assets': assets, 'svgIcons': 'currentColor; no global image inversion',
                          'derivatives': 'none; A07 and A08 already have transparent line silhouettes'}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(assets)} images inspected; originals unchanged')
