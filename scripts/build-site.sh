#!/bin/sh
# Build the static production artifact for Cloudflare Pages.
#
# Cloudflare Pages configuration:
#   Build command:           bash scripts/build-site.sh
#   Build output directory:  dist
#   Root directory:          (leave blank = repository root)
#
# Local (Git Bash / WSL / Linux / macOS):
#   bash scripts/build-site.sh
#
# The repository is a hand-written static site: this script only assembles a
# clean publish directory. It never compiles, bundles or rewrites the pages.
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
dist="$root/dist"

# Top-level pages that are part of the published website. Development
# documents such as PROJECT_PLAN.html are deliberately excluded; add new
# website pages to this list when they are created.
PAGES='index.html blog.html about.html'

# Runtime directories. A missing directory is skipped, not an error.
DIRS='css js posts assets'

log() { printf '[build] %s\n' "$*"; }
fail() { printf '[build] error: %s\n' "$*" >&2; exit 1; }

if [ -z "$dist" ] || [ "$dist" = '/' ]; then
  fail "refusing to use '$dist' as the output directory"
fi

log 'cleaning dist'
rm -rf -- "$dist"
mkdir -p -- "$dist"

[ -f "$root/index.html" ] || fail 'index.html is required but was not found'

log 'copying html'
for page in $PAGES; do
  if [ -f "$root/$page" ]; then
    cp -- "$root/$page" "$dist/$page"
  else
    log "skipping missing $page"
  fi
done

# Make top-level pages that are intentionally not published visible in the log,
# so a forgotten page cannot silently disappear from the website.
for file in "$root"/*.html; do
  [ -e "$file" ] || continue
  name=$(basename -- "$file")
  case " $PAGES " in
    *" $name "*) ;;
    *) log "not publishing: $name" ;;
  esac
done

for dir in $DIRS; do
  if [ -d "$root/$dir" ]; then
    log "copying $dir"
    cp -R -- "$root/$dir" "$dist/$dir"
  else
    log "skipping missing $dir/"
  fi
done

# Expose the exact source revision for deployment acceptance (no credentials).
commit=${CF_PAGES_COMMIT_SHA:-$(git -C "$root" rev-parse HEAD)}
case "$commit" in ''|*[!0-9a-fA-F]*) fail 'invalid source commit';; esac
published_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
printf '{"source_commit":"%s","published_at":"%s"}\n' "$commit" "$published_at" > "$dist/version.json"

# Cloudflare otherwise treats missing paths as a SPA and serves the homepage.
# This plain hosting response is not the deferred illustrated 404 feature.
cat > "$dist/404.html" <<'HTML'
<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>页面未找到 · Sywen's Space</title>
<main><h1>页面未找到</h1><p>这个地址没有对应的页面。</p><a href="https://sywen-blog.pages.dev/">返回首页</a></main></html>
HTML

count=$(find "$dist" -type f | wc -l | tr -d ' ')
log "done: $count files in dist/"
