"""Key a pure-white-background black line-art master into a transparent PNG.

Used for the blog's manga line-art stickers (A07 plant, A08 transitions):
the image model emits opaque white backgrounds, so the master is keyed with a
luminance alpha instead of asking the model to fake transparency.

Usage:
  py scripts/lineart-key-transparent.py SRC OUT [--min-margin 0.12]
      [--white-cut 250] [--full-ink 160]

Steps:
  1. Find the ink bounding box (luminance below WHITE_CUT).
  2. Place the source on a canvas (same aspect ratio; square input stays
     square) whose empty margin on every side is at least MIN_MARGIN
     (offsets are centered within the feasible range, so a lopsided
     composition still gets balanced safety area).
  3. Derive alpha from luminance: L >= WHITE_CUT -> 0 (kills faint paper
     haze), L <= FULL_INK -> 255, linear between.
  4. Flatten RGB to the sampled ink color everywhere ink is present, so
     anti-aliased edges composite correctly over light and dark backgrounds.
  5. Drop isolated floating specks (tiny components far from the main body);
     small enclosed details such as stamen dots are kept by the gap rule.

The source must be pure black line art on a pure white background.
"""

import argparse
import math
import sys

import numpy as np
from PIL import Image
from scipy import ndimage


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("out")
    ap.add_argument("--min-margin", type=float, default=0.12)
    ap.add_argument("--white-cut", type=int, default=250)
    ap.add_argument("--full-ink", type=int, default=160)
    ap.add_argument("--speck-gap", type=int, default=45,
                    help="remove tiny components farther than this (px) "
                         "from the main body")
    ap.add_argument("--speck-area", type=int, default=25,
                    help="components smaller than this many pixels are "
                         "treated as specks")
    ap.add_argument("--square", action="store_true",
                    help="force a square output canvas (small accent assets)")
    args = ap.parse_args()

    src = Image.open(args.src).convert("RGB")
    w, h = src.size
    rgb = np.asarray(src).astype(np.float32)
    lum = np.asarray(src.convert("L"))

    ys, xs = np.where(lum < args.white_cut)
    if len(xs) == 0:
        print("error: no ink pixels found", file=sys.stderr)
        return 1
    x0, x1 = int(xs.min()), int(xs.max())
    y0, y1 = int(ys.min()), int(ys.max())
    span_x, span_y = x1 - x0 + 1, y1 - y0 + 1

    # Smallest canvas (same aspect ratio) allowing MIN_MARGIN on every side.
    m = args.min_margin
    nx = max(w, math.ceil(span_x / (1 - 2 * m)))
    ny = max(h, math.ceil(span_y / (1 - 2 * m)))

    def center_offset(lo_ink: int, hi_ink: int, src_len: int,
                      canvas_len: int) -> int:
        lo = m * canvas_len - lo_ink
        hi = canvas_len - 1 - hi_ink - m * canvas_len
        off = int(round((lo + hi) / 2))
        return max(0, min(off, canvas_len - src_len))

    dx = center_offset(x0, x1, w, nx)
    dy = center_offset(y0, y1, h, ny)

    if args.square:
        n = max(nx, ny)
        # Re-center within the enlarged square, then shift the paste origin.
        ox = (n - nx) // 2
        oy = (n - ny) // 2
        nx = ny = n
        dx += ox
        dy += oy

    canvas = np.full((ny, nx, 3), 255, dtype=np.float32)
    canvas[dy:dy + h, dx:dx + w] = rgb
    lum_pad = np.full((ny, nx), 255, dtype=np.uint8)
    lum_pad[dy:dy + h, dx:dx + w] = lum

    # Ink color: mean RGB of the darkest core pixels (warm near-black).
    core = rgb.reshape(-1, 3)[np.asarray(lum).reshape(-1) < 60]
    ink = tuple(int(round(v)) for v in core.mean(axis=0))
    print(f"ink RGB: {ink}")

    lo, hi = args.full_ink, args.white_cut
    alpha = np.clip((hi - lum_pad.astype(np.float32)) / (hi - lo) * 255,
                    0, 255).astype(np.uint8)

    # Remove isolated floating specks: tiny components far from the body.
    mask = alpha > 15
    labels, total = ndimage.label(mask, structure=np.ones((3, 3), int))
    if total > 1:
        sizes = np.bincount(labels.ravel())
        sizes[0] = 0
        body = sizes.argmax()
        dist = ndimage.distance_transform_edt(labels != body)
        removed = []
        for lbl in range(1, total + 1):
            if lbl == body or sizes[lbl] >= args.speck_area:
                continue
            ys_l, xs_l = np.where(labels == lbl)
            if dist[ys_l, xs_l].min() > args.speck_gap:
                alpha[ys_l, xs_l] = 0
                removed.append((int(sizes[lbl]),
                                (int(xs_l.min()), int(ys_l.min()),
                                 int(xs_l.max()), int(ys_l.max()))))
        if removed:
            print(f"removed {len(removed)} floating specks: {removed}")

    out_rgb = np.broadcast_to(np.asarray(ink, dtype=np.uint8),
                              (ny, nx, 3)).copy()
    out = np.dstack([out_rgb, alpha])
    Image.fromarray(out, "RGBA").save(args.out, optimize=True)

    ay, ax = np.where(alpha > 0)
    margins = {
        "L": ax.min() / nx, "R": (nx - 1 - ax.max()) / nx,
        "T": ay.min() / ny, "B": (ny - 1 - ay.max()) / ny,
    }
    print(f"canvas: {nx}x{ny}, offset: ({dx},{dy})")
    print("margins: " + ", ".join(
        f"{k} {v * 100:.1f}%" for k, v in margins.items()))
    if min(margins.values()) < m - 0.001:
        print("warning: margin target not met", file=sys.stderr)
        return 1
    print(f"saved: {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
