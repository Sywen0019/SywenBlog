"""Deterministic E02 exports. Masters are local and never published."""
from pathlib import Path
from PIL import Image
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
records = []

def export(source, filename, width, limit):
    source = ROOT / source
    image = Image.open(source)
    image = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
    target = ROOT / 'assets/images' / filename
    for quality in (90, 86, 82, 78):
        image.save(target, 'WEBP', quality=quality, method=6)
        if target.stat().st_size <= limit:
            break
    assert target.stat().st_size <= limit, filename
    records.append(dict(file=str(target.relative_to(ROOT)).replace('\\', '/'), source=str(source.relative_to(ROOT)).replace('\\', '/'), width=image.width, height=image.height, bytes=target.stat().st_size, quality=quality, sha256=hashlib.sha256(target.read_bytes()).hexdigest(), sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest()))

if __name__ == '__main__':
    for width in (640, 1280):
        export('art-work/about/selected.png', f'about-reading-{width}.webp', width, 200_000)
    export('art-work/decorations/a07-plant-v04.png', 'a07-plant.webp', 330, 25_000)
    export('art-work/decorations/a08-transition-branch-v01.png', 'a08-transition-branch.webp', 720, 25_000)
    (ROOT / 'docs/about-assets.json').write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(records, indent=2))
