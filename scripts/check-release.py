"""Verify public Cloudflare files against the committed source, using stdlib only."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import datetime
import hashlib
import json
import subprocess
import urllib.request
import urllib.error
import argparse

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://sywen-blog.pages.dev/'

def git(*args):
  return subprocess.check_output(['git', *args], cwd=ROOT)

def get(path):
  req = urllib.request.Request(BASE + path, headers={'User-Agent': 'Sywen-baseline-check', 'Cache-Control': 'no-cache'})
  try:
    with urllib.request.urlopen(req, timeout=40) as response:
      return response.status, response.read(), response.geturl()
  except urllib.error.HTTPError as error:
    return error.code, error.read(), error.geturl()

def main():
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument('--expected-commit', help='Require the public source to equal this local Git revision.')
  parser.add_argument('--output', type=Path, default=ROOT/'docs/evidence/baseline/deployment-checks.json')
  args = parser.parse_args()
  expected_source = git('rev-parse', '--verify', args.expected_commit + '^{commit}').decode().strip() if args.expected_commit else None
  status, body, _ = get('version.json')
  version = json.loads(body) if status == 200 else {}
  source = version.get('source_commit', '')
  if len(source) != 40 or any(c not in '0123456789abcdef' for c in source):
    raise SystemExit('Public version.json is unavailable or invalid; deployment is not ready.')
  if expected_source and source != expected_source:
    raise SystemExit(f'Deployment is not ready: expected {expected_source}, received {source}.')
  # Source must exist locally and be part of this project's real main history.
  subprocess.run(['git', 'merge-base', '--is-ancestor', source, 'main'], cwd=ROOT, check=True)
  entries = git('ls-tree', '-r', '--name-only', source).decode().splitlines()
  # Read the manifest from the exact deployed source, not the current checkout.
  pages = json.loads(git('show', source + ':content/pages.json')) if 'content/pages.json' in entries else ['index.html', 'blog.html', 'about.html']
  if not set(pages).issubset(entries):
    raise SystemExit('Missing registered production page in source commit')
  files = [p for p in entries if p in pages or p.split('/')[0] in {'posts','css','js','assets'}]
  def verify(file):
    status, content, url = get(file)
    expected = git('show', source + ':' + file)
    sha = hashlib.sha256(content).hexdigest()
    return {'path': file, 'status': status, 'finalUrl': url, 'bytes': len(content), 'sha256': sha,
            'pass': status == 200 and content == expected}
  with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(verify, files))
  home_status, home, _ = get('')
  results.append({'path':'/', 'status':home_status, 'pass':home_status == 200 and home == git('show', source + ':index.html')})
  for path in ['docs/acceptance.md', 'docs/v2-reference.html', 'content/posts.json', 'templates/post.html', 'PROJECT_PLAN.html', 'posts/nonexistent-baseline-check.html', 'assets/missing.webp',
               'posts/attention-intuition.html', 'posts/dom-search-notes.html', 'posts/paper-reading-notes.html',
               'assets/images/search-flow.svg', 'assets/images/paper-fibers.svg']:
    status, _, _ = get(path)
    results.append({'path':path, 'status':status, 'pass':status == 404})
  end_status, end_body, _ = get('version.json')
  end_source = json.loads(end_body).get('source_commit') if end_status == 200 else None
  results.append({'path':'version.json (stable during verification)', 'pass':end_source == source,
                  'initialSource':source, 'finalSource':end_source})
  data = {'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'url':BASE, 'version':version,
          'localHead':git('rev-parse','HEAD').decode().strip(), 'expectedSource':expected_source, 'checks':results,
          'passed':sum(r['pass'] for r in results), 'failed':sum(not r['pass'] for r in results)}
  output = args.output
  output.parent.mkdir(parents=True, exist_ok=True)
  output.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
  print(json.dumps({'source':source,'passed':data['passed'],'failed':data['failed']},ensure_ascii=False))
  raise SystemExit(1 if data['failed'] else 0)

if __name__ == '__main__':
  main()
