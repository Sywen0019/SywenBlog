#!/usr/bin/env python3
"""Deterministically export the E01 category illustrations for the site.

Input masters are local Seedream exports kept under art-work/ (git-ignored and
never published). This script resizes each chosen 4:3 master to a fixed canvas
and writes a hosted WebP plus docs/category-assets.json. It is the only
supported transform for these assets; do not hand-edit the WebP files.

Run from the repository root:

    py scripts/export-category-art.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent

OUT_W, OUT_H = 640, 480
QUALITY = 88
LIMIT_BYTES = 40 * 1024

# Chosen masters (candidate history stays in art-work/categories/).
ASSETS = [
    ("study", "art-work/categories/study-candidate-3.png"),
    ("life", "art-work/categories/life-candidate-1.png"),
    ("favorites", "art-work/categories/favorites-candidate-2.png"),
]


def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def export_one(category: str, source: str) -> dict:
    src = ROOT / source
    out = ROOT / "assets" / "images" / f"cat-{category}.webp"
    with Image.open(src) as im:
        im = im.convert("RGB")
        if im.width * 3 != im.height * 4:
            raise SystemExit(f"{source} is not 4:3 ({im.width}x{im.height})")
        im = im.resize((OUT_W, OUT_H), Image.LANCZOS)
        # No exif/xmp/icc: line art only, metadata must not ship.
        im.save(out, format="WEBP", quality=QUALITY, method=6)
    size = out.stat().st_size
    return {
        "file": out.relative_to(ROOT).as_posix(),
        "category": category,
        "source": source,
        "width": OUT_W,
        "height": OUT_H,
        "quality": QUALITY,
        "bytes": size,
        "sha256": sha256_of(out),
    }


def main() -> None:
    records = [export_one(category, source) for category, source in ASSETS]
    manifest = ROOT / "docs" / "category-assets.json"
    manifest.write_text(
        json.dumps(records, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    over = [r["file"] for r in records if r["bytes"] > LIMIT_BYTES]
    for record in records:
        status = "OK" if record["bytes"] <= LIMIT_BYTES else "OVER BUDGET"
        print(f"{record['file']}: {record['width']}x{record['height']} "
              f"{record['bytes']} bytes [{status}]")
    print("wrote", manifest.relative_to(ROOT))
    if over:
        raise SystemExit(f"Over {LIMIT_BYTES} bytes: {', '.join(over)}")


if __name__ == "__main__":
    main()
