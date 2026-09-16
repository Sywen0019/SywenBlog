# Repository Guidelines

## Project Structure & Module Organization

Sywen's Space is a manga line-art personal blog built with native HTML, CSS, and JavaScript. `PROJECT_PLAN.html` holds the 29-section specification, `DESIGN_SPEC.md` the visual rules, `Plan.md` the implementation baseline, and `参考素材/` five reference PNGs that are never published. T01 established the seven semantic HTML pages, T02 added two character WebP assets and an SVG favicon, and T04 (Stage 2) added the three stylesheets, the light/dark theme contract, and the page-level asset references. The current implementation follows B00–B06 in `docs/tasks/00-index.md`; the coursework baseline is delivered, and among the E tasks E03 (back to top and reading progress) is done locally while E01, E02, E04, E05, and E06 stay Deferred. The coursework baseline requires content, CSS, theme/search/filter JavaScript, a desk Hero, Gitee, and verified public HTTPS. Never gate that baseline on deferred reading tools, menus, or the full art library.

Follow the planned structure when adding code:

- `index.html`, `blog.html`, `about.html`: top-level pages; `posts/`: four article pages with descriptive kebab-case filenames.
- `css/`: `base.css` for foundations and themes, `components.css` for shared controls, `pages.css` for page layouts.
- `js/`: classic scripts organized by feature — `theme.js`, `posts-data.js`, `site.js`, `blog.js`, and `reading.js` (back to top and scroll progress) are implemented; `context-menu.js` is still deferred.
- `assets/images/` and `assets/icons/`: published artwork; keep reference material in `参考素材/`.
- `docs/`: execution records — `agent-handoffs.md` for task handoffs and the frozen DOM/path contract, `acceptance.md` for manual verification results, `visual-review.md` for the VC1/VC2 checkpoints.
- `Change_log.md`: project change log, newest entries first.

## Build, Test, and Development Commands

No compilation step, root package manifest or production dependencies exist. `scripts/build-site.sh` assembles a whitelist into `dist/` for Cloudflare Pages and generates version metadata and a plain missing-page response. Optional browser checks use an ignored local Playwright installation (see README).

- `Start-Process .\PROJECT_PLAN.html`: open the specification locally in the default browser on Windows.
- `py -m http.server 8000 --bind 127.0.0.1`: serve the repository locally if Python is installed. Visit `http://127.0.0.1:8000/PROJECT_PLAN.html`; use `/index.html` once implemented.

Use HTTP for functional checks and HTTPS for deployment acceptance.

- `node scripts/check-baseline.mjs`: local browser/layout/failure checks after installing the README verification tools.
- `node scripts/check-baseline.mjs --public`: core checks against the public Cloudflare site.
- `py scripts/check-release.py`: compare public files with the Git source recorded in `version.json`.

## Coding Style & Naming Conventions

Preserve existing formatting in the plan. For new files, use two-space indentation, semantic HTML, kebab-case filenames and CSS classes, and camelCase JavaScript identifiers. No formatter or linter is configured.

Use CSS custom properties for themes and Grid/Flexbox for layout. Isolate scripts with closures and expose shared functionality only through `window.Sywen`. Keep headers and footers in HTML. Use relative asset paths so subdirectory deployments work. Host core assets locally.

Enhanced controls that require JavaScript (theme toggle, quick menu, back to top, reading progress, notices, copy panel, context menu) ship with the `hidden` attribute and are revealed by their own module, so pages stay fully usable without scripts. Keep the ids, class names, `data-*` attributes, and path conventions frozen in `docs/agent-handoffs.md`; rename them only by updating that contract first.

## Testing Guidelines

Baseline browser checks live in `scripts/check-baseline.mjs`; no coverage threshold is established. Follow the current B/E plan and record results in `docs/acceptance.md`. Check navigation, article deep links, search/category combinations, theme persistence and storage failures, keyboard access, responsive layouts, and reduced motion. `docs/evidence/e03/reading-checks.mjs` covers the implemented reading enhancement (progress values and paint width, the 480px threshold, footer clearance, keyboard focus after returning to top, reduced motion, no-script fallback, subdirectory, and pixel comparison against the B05 baseline); clipboard and context-menu checks apply only after E04 is implemented. Real phone and browser-UI zoom are not certified by viewport emulation.

## Commit & Pull Request Guidelines

The repository has real history on `main` with `origin` at Gitee; keep that history truthful. Follow the plan's small, verifiable milestone commits with prefixes such as `docs:`, `feat:`, and `style:`. Example: `feat: add semantic pages and global navigation`. Never squash staged work into one final commit and never rewrite history.

When using pull requests, describe the change, reference the relevant plan section or issue, list verification performed, and include screenshots for visual changes. Update documentation alongside implementation and exclude credentials and temporary files.

For future project changes, update `Change_log.md` with the date, a concise description of the change, and relevant verification results. Keep entries in reverse chronological order.
