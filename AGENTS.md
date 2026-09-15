# Repository Guidelines

## Project Structure & Module Organization

Sywen's Space is a planned manga line-art personal blog using native HTML, CSS, and JavaScript. Currently, `PROJECT_PLAN.html` contains the 29-section specification, and `参考素材/` contains four reference PNGs. Read the plan before implementing features; the application directories do not exist yet.

Follow the planned structure when adding code:

- `index.html`, `blog.html`, `about.html`: top-level pages; `posts/`: four article pages with descriptive kebab-case filenames.
- `css/`: `base.css` for foundations and themes, `components.css` for shared controls, `pages.css` for page layouts.
- `js/`: classic scripts organized by feature, including `theme.js`, `posts-data.js`, `site.js`, `blog.js`, `reading.js`, and `context-menu.js`.
- `assets/images/` and `assets/icons/`: published artwork; keep reference material in `参考素材/`.
- `docs/acceptance.md`: planned manual verification record.

## Build, Test, and Development Commands

No build step, package manifest, production dependencies, or automated test command exists.

- `Start-Process .\PROJECT_PLAN.html`: open the specification locally in the default browser on Windows.
- `py -m http.server 8000 --bind 127.0.0.1`: serve the repository locally if Python is installed. Visit `http://127.0.0.1:8000/PROJECT_PLAN.html`; use `/index.html` once implemented.

Use HTTP for functional checks and HTTPS for deployment acceptance.

## Coding Style & Naming Conventions

Preserve existing formatting in the plan. For new files, use two-space indentation, semantic HTML, kebab-case filenames and CSS classes, and camelCase JavaScript identifiers. No formatter or linter is configured.

Use CSS custom properties for themes and Grid/Flexbox for layout. Isolate scripts with closures and expose shared functionality only through `window.Sywen`. Keep headers and footers in HTML. Use relative asset paths so subdirectory deployments work. Host core assets locally.

## Testing Guidelines

No test framework, test naming convention, or coverage threshold is established. Follow section 26 of the plan and record results in `docs/acceptance.md` as implementation proceeds. Check navigation, article deep links, search/category combinations, theme persistence and storage failures, reading progress, clipboard fallback, keyboard access, responsive layouts, and reduced motion.

## Commit & Pull Request Guidelines

No Git history is available. Follow the plan's small, verifiable commits with prefixes such as `docs:`, `feat:`, and `style:`. Example: `feat: add semantic pages and global navigation`.

When using pull requests, describe the change, reference the relevant plan section or issue, list verification performed, and include screenshots for visual changes. Update documentation alongside implementation and exclude credentials and temporary files.
