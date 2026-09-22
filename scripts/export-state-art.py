#!/usr/bin/env python3
"""Export the selected E05 master; preserve alpha and record the exact crop."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'art-work/states/a09-selected.png'
TARGET = ROOT / 'assets/images/a09-empty-state.webp'


def main():
  with Image.open(SOURCE) as image:
    image = image.convert('RGBA')
    # Full square preserves the ahoge, hands and elbows; no content crop.
    crop = [0, 0, image.width, image.height]
    image.crop(crop).resize((320, 320), Image.Resampling.LANCZOS).save(
      TARGET, 'WEBP', quality=90, method=6, exact=True)
  size = TARGET.stat().st_size
  if size > 40 * 1024:
    raise SystemExit(f'State art exceeds 40 KiB: {size}')
  record = {
    'file': TARGET.relative_to(ROOT).as_posix(),
    'source': SOURCE.relative_to(ROOT).as_posix(),
    'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    'crop': crop, 'width': 320, 'height': 320, 'quality': 90,
    'alpha': 'preserved; CSS paper background', 'bytes': size,
    'sha256': hashlib.sha256(TARGET.read_bytes()).hexdigest(),
  }
  (ROOT / 'docs/state-assets.json').write_text(
    json.dumps(record, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
  print(json.dumps(record, ensure_ascii=False))


if __name__ == '__main__':
  main()
