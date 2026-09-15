# T04 follow-up pixel verification (programmatic, no image viewing)

Method: PowerShell + System.Drawing, PNG loaded via `LockBits`/`Marshal.Copy` into an
`int[]` of packed 0xRRGGBB (one entry per pixel); exact-colour bounding boxes, run-length
profiles (row and column), colour histograms, and text/patch separation by colour signature.
All numbers below are device pixels read from the listed PNG.

Coordinate-frame note: the captures are 1425 px wide (home-1440, about-1440, home-768:
753 px; home-390: 375 px), i.e. the 1440/768/390 layout viewport minus the 15 px vertical
scrollbar strip. The 1120 px content column of a 1440 px layout is therefore at x160..1279
(left margin 160 px, visible right margin 145 px). The DOM rects recorded in
`render-checks.json` were taken in a 1425 px layout frame and run 8 px to the left of the
PNG pixels (artFrame DOM x=952 ↔ PNG x=960; heroTape DOM x=1140 ↔ PNG x=1148).

## 1. Content column width - FIXED
`home-1440-light.png` (1425x1715), exact `#D6CFC2` article-entry dividers:

| row | #D6CFC2 px in x160..1279 | run |
|---|---|---|
| y=833 | 1120 | x160..1279 |
| y=978 | 1120 | x160..1279 |
| y=832 / y=834 | 0 / 0 | (1 px line confirmed) |
| y=976 / y=979 | 0 / 0 | (1 px line confirmed) |

Divider horizontal extent = **1120 px exactly** (design value; previous 1056).
Whole column also 1120: ink bbox of content x160..1279, surface panel bbox x162..1277.
Full-bleed rules at y=92 and y=1596 span all 1425 px (header/footer, different elements).

## 2. Art heights - FIXED
Frame outer box = 2 px ink border + 8 px padding; art box = height - 4 - 16.

| capture | frame ink border box | art (near-white) box | derived height | cap |
|---|---|---|---|---|
| about-1440-light.png | (976,258)-(1155,577) 180x320 | (986,268)-(1145,567) **160x300** | 320-4-16 = 300 | 300 (was 360) |
| home-1440-light.png | (960,141)-(1171,520) 212x380 | (970,151)-(1161,510) **192x360** | 380-4-16 = 360 | 360 |
| home-768-light.png | (515,125)-(694,444) 180x320 | (525,135)-(684,434) **160x300** | 320-4-16 = 300 | 300 (was 220) |

Strict `#FFFFFF` inside the art is sparse (799 px in home-1440 within a 180x353 bbox;
636 px in about-1440/768 within 150x294) because the WebP's own paper renders `#FEFEFE`
(31 389 px filling the home art box; 22 694 px in the about/768 art box) over the CSS
`--color-art-paper` background. Element boxes are confirmed independently by frame geometry.

## 3. Dot pattern - FIXED (after a second revision; re-measured on the current captures)

First pass: the patch rendered **nothing** - 0 non-paper pixels of 4096 inside the dots rect
(PNG x1228..1291, y511..574) and 0 of 6560 in the padded union, 100.00 % exactly `#F7F3EA`.
Cause: `radial-gradient(ink .5px, transparent .5px)` at 8 px pitch - the tile centre is
0.707 px from the nearest pixel centre, so a 0.5 px-radius hard-stop circle covers none of
them and nothing rasterises. The previous 2 px defect was gone, but the halftone was invisible.

Revision (current `css/components.css` `.hero-art__dots`): the background keeps the
radial-gradient, and an 8x8 SVG mask with a circle at (4,4) r=0.5 selects the tile-centre
pixel; `mask-size: 8px 8px` is set explicitly to the SVG's own size; colour comes from
`background-color: var(--color-ink)` so the dots follow the theme.

Re-measured on the re-captured `home-1440-light.png`, dots rect (1228,511) 64x64:

| quantity | measured value |
|---|---|
| pitch | **8 px** (inked rows at y=514,522,530,... i.e. every 8 px; same in x) |
| dot footprint | **2x2 device px** per dot (`--dot-size` declares 1 px - see tolerance below) |
| dots per 64x64 patch | 64 (256 inked px of 4096 = 6.25 %) |
| dot colour (light) | `rgb(242,238,229)`, uniform - exactly `#F2EEE5` ink at `opacity .08` over `#F7F3EA` paper |
| dot colour (dark) | `rgb(37,38,39)`, uniform - exactly `#F2EEE5` at .08 over `#202223` paper |

Colour histogram over the patch: light `{rgb(247,243,234): 3840, rgb(242,238,229): 256}`;
dark `{rgb(32,34,35): 3840, rgb(37,38,39): 256}`. The blend matches the token arithmetic to
the byte, so the dots are correctly themed and the declared `--dot-opacity: 0.08` is honoured.
Two alternative geometries were measured and rejected: a 1x1 mask tile scales the circle to
the whole tile (3806 of 7056 px inked, i.e. a 78 % fill), and a 2x2 tile with r=0.5 renders
4x4 blobs with three uneven blend values.

**Remaining tolerance (objective, non-blocking):** the rendered dot is 2x2 device px at 1x
zoom while `--dot-size` declares 1 px. At `opacity .08` the difference is a barely visible
speck that preserves the intended sparse screentone; it is recorded here for VC1 rather than
further micro-tuned, because any further geometry change re-enters the rasterisation floor
that produced the 4x4-blob variant above.

## 4. Tape position - FIXED (straddles the corner on both pages)
| capture | tape bbox (exact #D9E8EC) | frame border box | above / below top edge | inside / beyond right edge |
|---|---|---|---|---|
| home-1440-light.png | (1148,133)-(1195,148) 48x16 | (960,141)-(1171,520) | 8 px / 8 px | 24 px / 24 px |
| about-1440-light.png | (1132,250)-(1179,265) 48x16 | (976,258)-(1155,577) | 8 px / 8 px | 24 px / 24 px |

Overlap is real, not adjacent: in home-1440 the frame's top border (y141-142) runs only
x960..1147 (interrupted for 24 px) and its right border (x1170-1171) starts at y=150; in
about-1440 the top border (y258-259) stops at x=1131 and the right border (x1154-1155)
starts at y=267. Tape centre y=140.5 sits on the frame's outer top edge y=141 -> a 50/50
straddle. Matches CSS `inset-block-start:-8px; inset-inline-end:-24px`.

## 5. Dark-theme heading colour - FIXED
`home-1440-dark.png` (1425x1715), hero h1 band y267-331, x150-900:

* exact `#F2EEE5` = **9338 px**, bbox (162,267)-(676,331)
* light capture `home-1440-light.png`, same band: `#242424` = **9338 px**, identical bbox
* `#DCD8D0` = **0 px** in the band and **0 px in the entire image**; within ±3/channel only
  179 stray px image-wide
* `#F2EEE5` is **77.6 %** of the 12 038 near-white (R,G,B>150) px in the band; the remaining
  22.4 % are 97 antialiasing values, largest 276 px (`#A6A39E`)

## 6. Mobile decoration - FIXED (absent as required)
`home-390-light.png` (375x1935):

* only exact `#D9E8EC` region in the image = (18,339)-(113,380) **96x42** = the hero primary
  CTA accent fill (its ink label knocked out), not a 48x16 tape; 13 px left of and 27 px
  above the frame
* character frame (126,407)-(263,646) 138x240: top border y407-408 runs the full x126..263,
  right border x262-263 runs the full y407..646 -> nothing overlaps or interrupts the corner
* no dot patch: warm-gray (paper-adjacent ink tint) census in x100-330, y370-720 = 49
  scattered px (rows 379-386 button edge, 464-470, 673); whole-image row scan shows no
  ~57-row dot band, only 1-2 row text/rule bands
* corroborated by `render-checks.json`: heroTape {0,0,0,0} and heroDots {0,0,0,0} at
  320/360/390 (display:none)

## 7. Blog empty state - FIXED
`blog-preview-empty-1440-light.png` (1440x900):

* reset button (`#empty-reset`) ink border box x160..259 (100 px wide) x y591..636 (46 px
  tall), with its 3 px ink shadow reaching x262 / y639
* avatar = exact **80x80** block at x720..799, y615..694 (rows 615..694 are 80/80 non-paper;
  y614 and y695 are 0/80)
* avatar is right of the button: its left edge (720) is 461 px right of the button's right
  edge (259); its right edge 799 coincides with the empty-state block's right edge
  (x160+640-1 = 799, `float: right`)
* vertical overlap (button 591-636, avatar 615-694; avatar top = button top + 24 px =
  declared `margin-top: 24px`) -> the avatar sits beside the button, not below it
* DOM order is button then avatar (`blog.html` line 68 `<button id="empty-reset">`,
  line 69 `<img class="empty-state__avatar">`)
* 80x80 matches `--avatar-size: 80px` (>=1024) and harness `avatarRect` 80x80 / natural 225x225

## Summary
| # | item | verdict |
|---|---|---|
| 1 | content column width | FIXED (1120 px) |
| 2 | about / home / 768 art heights | FIXED (300 / 360 / 300) |
| 3 | dot pattern | FIXED after revision: 8 px pitch, 64 dots per patch, blend colour exact in both themes; dot footprint 2x2 px vs the declared 1 px (recorded tolerance for VC1) |
| 4 | tape position | FIXED (straddles corner 8/8 px, 24/24 px) |
| 5 | dark-theme heading colour | FIXED (9338 px exactly #F2EEE5, #DCD8D0 = 0) |
| 6 | mobile decoration | FIXED (no tape, no dots) |
| 7 | blog empty state | FIXED (button left x160..259, avatar right 80x80 at x720..799) |

## Status of the captures

Sections 1, 2, 4, 5, 6 and 7 were measured on the captures taken after the first fix round.
Section 3 was re-measured on the captures regenerated after the dots revision (all
`home-*`, `blog-*`, `about-*`, `post-*`, `focus-*` and `blog-preview-empty-*` PNGs are from
that later run; the three `*-nojs-*.png` were re-captured against the same final CSS). The
listed measurements remain valid because the dots revision changed only the `.hero-art__dots`
rendering; layout geometry, colours, tape and text metrics are unchanged by it.

Reproduce with `docs/evidence/t04/dots-pixel-check.mjs` (region and paper colour are
arguments) and `docs/evidence/t04/render-checks.mjs` (DOM-level probe over 24 + 12 scenarios).
