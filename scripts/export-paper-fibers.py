#!/usr/bin/env python3
"""Generate a deterministic, seamless SVG of sparse paper fibres (no raster edits)."""
from pathlib import Path
import random
import math

ROOT = Path(__file__).resolve().parents[1]
rng = random.Random(280926)
size = 512
groups = []
for alpha, count, width in [(0.11, 900, 0.40), (0.19, 1000, 0.50), (0.23, 500, 0.55)]:
  paths = []
  for _ in range(count):
    x, y = rng.uniform(0, size), rng.uniform(0, size)
    length, angle = rng.uniform(1.5, 7), rng.uniform(0, math.pi * 2)
    dx, dy = length * math.cos(angle), length * math.sin(angle)
    bend = rng.uniform(-0.5, 0.5)
    # Repeat edge-crossing strokes in adjacent tiles to keep every seam continuous.
    for ox in [-size, 0, size]:
      for oy in [-size, 0, size]:
        xx, yy = x + ox, y + oy
        if xx < -9 or xx > size + 9 or yy < -9 or yy > size + 9:
          continue
        paths.append(f'M{xx:.1f} {yy:.1f}q{dx/2:.1f} {dy/2+bend:.1f} {dx:.1f} {dy:.1f}')
  groups.append(f'<path stroke-opacity="{alpha}" stroke-width="{width}" d="{" ".join(paths)}"/>')
svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}" fill="none" stroke="#65717b" stroke-linecap="round">' + ''.join(groups) + '</svg>\n'
output = ROOT / 'assets/images/paper-fibers.svg'
output.write_text(svg, encoding='utf-8')
print(f'{output.name}: {output.stat().st_size} bytes, seed 280926')
