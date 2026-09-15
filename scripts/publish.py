"""Publish only committed site files to the existing GitHub Pages mirror.

Run with the Python standard library: py scripts/publish.py [--enable-pages]
Authentication uses the existing Git credential helper, in memory only.
"""
from pathlib import Path
import datetime
import json
import os
import subprocess
import tempfile
import urllib.error
import urllib.request
import sys

ROOT = Path(__file__).resolve().parents[1]
BRANCH = 'codex/pages'
REPO = 'Sywen0019/SywenBlog'
ALLOWED_ROOT = {'index.html', 'blog.html', 'about.html'}
ALLOWED_DIRS = {'posts', 'css', 'js', 'assets'}

def git(*args, data=None, env=None):
  return subprocess.check_output(['git', '-c', 'http.sslBackend=openssl', *args], cwd=ROOT, input=data, env=env).decode('utf-8').strip()

def main():
  source = git('rev-parse', 'HEAD')
  entries = git('ls-tree', '-r', '--name-only', source).splitlines()
  keep = [p for p in entries if p in ALLOWED_ROOT or p.split('/')[0] in ALLOWED_DIRS]
  # Paths in this whitelist are ASCII. Reference images, art sources and docs are never published.
  if not ALLOWED_ROOT.issubset(keep):
    raise SystemExit('Missing entry pages in the committed version')
  remote = git('ls-remote', 'github', 'refs/heads/' + BRANCH)
  parent = remote.split()[0] if remote else source
  if remote:
    git('fetch', 'github', BRANCH)
  with tempfile.TemporaryDirectory(prefix='sywen-publish-') as folder:
    env = dict(os.environ, GIT_INDEX_FILE=str(Path(folder) / 'index'))
    git('read-tree', '--empty', env=env)
    for p in keep:
      blob = git('rev-parse', source + ':' + p)
      git('update-index', '--add', '--cacheinfo', '100644', blob, p, env=env)
    version = json.dumps({'source_commit': source, 'published_at': datetime.datetime.now(datetime.timezone.utc).isoformat()}, indent=2).encode()
    for name, content in [('version.json', version), ('.nojekyll', b'')]:
      blob = git('hash-object', '-w', '--stdin', data=content)
      git('update-index', '--add', '--cacheinfo', '100644', blob, name, env=env)
    tree = git('write-tree', env=env)
    commit = git('commit-tree', tree, '-p', parent, '-m', 'deploy: publish site from ' + source[:12])
  git('update-ref', 'refs/heads/' + BRANCH, commit)
  git('push', 'github', BRANCH)
  print(json.dumps({'source_commit': source, 'deploy_commit': commit, 'files': len(keep), 'url': 'https://sywen0019.github.io/SywenBlog/'}, indent=2))
  if '--enable-pages' in sys.argv:
    enable_pages()

def enable_pages():
  proc = subprocess.run(['git','-c','credential.interactive=never','credential','fill'], cwd=ROOT,
                        input='protocol=https\nhost=github.com\n\n', text=True, capture_output=True)
  fields = dict(line.split('=',1) for line in proc.stdout.splitlines() if '=' in line)
  token = fields.get('password')
  if not token:
    raise SystemExit('GitHub credentials unavailable; enable Pages manually for codex/pages at /')
  headers = {'Authorization': 'Bearer ' + token, 'Accept':'application/vnd.github+json',
             'User-Agent':'Sywen-coursework-deploy', 'X-GitHub-Api-Version':'2022-11-28'}
  url = 'https://api.github.com/repos/' + REPO + '/pages'
  try:
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
      current = json.load(r)
    if current.get('source') == {'branch':BRANCH,'path':'/'}:
      print('Pages source already configured')
      return
    raise SystemExit('Existing Pages source differs; preserved without changing it')
  except urllib.error.HTTPError as error:
    if error.code != 404:
      raise SystemExit('Pages read failed: HTTP ' + str(error.code))
  body = json.dumps({'source':{'branch':BRANCH,'path':'/'}, 'build_type':'legacy'}).encode()
  try:
    with urllib.request.urlopen(urllib.request.Request(url,data=body,headers=headers,method='POST'),timeout=30) as r:
      result=json.load(r)
      print('Pages enabled: ' + result.get('html_url',''))
  except urllib.error.HTTPError as error:
    raise SystemExit('Pages enable failed: HTTP ' + str(error.code))

if __name__ == '__main__':
  main()
