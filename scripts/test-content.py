"""Behavioral tests of the publishing workflow in isolated temporary copies."""
import argparse
from datetime import datetime, timezone
import importlib.util
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('content_sync', ROOT / 'scripts/sync-content.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class ContentTests(unittest.TestCase):
  def setUp(self):
    self.temporary = tempfile.TemporaryDirectory(prefix='sywen-content-test-')
    self.addCleanup(self.temporary.cleanup)
    self.root = Path(self.temporary.name)
    for folder in ('content', 'templates', 'posts', 'css', 'js', 'assets'):
      shutil.copytree(ROOT / folder, self.root / folder)
    for page in sync.pages():
      shutil.copy2(ROOT / page, self.root / page)
    self.data = sync.load(self.root / 'content/posts.json')

  def save(self):
    (self.root / 'content/posts.json').write_text(json.dumps(self.data, ensure_ascii=False), encoding='utf-8')

  def body(self, source):
    parser = sync.ArticleBody(source)
    parser.feed(source)
    a, b = parser.bodies[0]
    return source[a:b]

  def add(self, slug, date, post_id=7):
    item = dict(self.data['posts'][0], id=post_id, slug=slug, date=date, title='新文 < & " >',
      summary='元数据 & <内容>', tags=['a & b', '论文 阅读'], researchNote=False)
    self.data['posts'].append(item)
    self.save()
    return item

  def test_idempotence_and_author_owned_bytes(self):
    outputs = sync.render(self.root)
    self.assertEqual(sync.synchronize(self.root, outputs), [])
    post = outputs['posts/ncs-figure-design.html']
    updated = post.replace('科研', '科研', 1).replace('<div class="post-body">', '<div class="post-body">\r\n<div><p>自写 &amp; 内容</p></div>', 1)
    (self.root / 'posts/ncs-figure-design.html').write_bytes(updated.encode('utf-8'))
    self.data['posts'][0]['title'] = '修改标题'
    self.save()
    rendered = sync.render(self.root)
    self.assertEqual(self.body(updated), self.body(rendered['posts/ncs-figure-design.html']))
    sync.synchronize(self.root, rendered, True)
    self.assertEqual(sync.synchronize(self.root, sync.render(self.root)), [])

  def test_insert_first_middle_last_and_same_day(self):
    for slug, date, position in [('new-first', '2026-10-04', 0), ('new-middle', '2026-09-16', 3),
        ('new-last', '2020-01-01', 5), ('new-same-day', '2026-09-18', 3)]:
      with self.subTest(slug=slug):
        original = list(self.data['posts'])
        self.add(slug, date)
        outputs = sync.render(self.root, slug)
        _, posts = sync.dataset(self.root, slug)
        self.assertEqual(posts[position]['slug'], slug)
        new = outputs['posts/' + slug + '.html']
        self.assertIn('A-' + str(position + 1).zfill(2), new)
        self.assertIn('新文 &lt; &amp; &quot; &gt;', new)
        self.assertIn('q=a%20%26%20b', new)
        for i, p in enumerate(posts):
          generated = outputs[p['url']]
          nav = re.search(r'<nav class="post-nav"[^>]*>(.*?)</nav>', generated, re.S).group(1)
          expected = ['./' + posts[j]['slug'] + '.html' for j in (i - 1, i + 1) if 0 <= j < len(posts)]
          self.assertEqual(re.findall(r'href="([^"]+)"', nav), expected)
          self.assertIn('A-' + str(i + 1).zfill(2), generated)
          if p['slug'] != slug:
            path = p['url']
            self.assertEqual(self.body(sync.read(self.root / path)), self.body(outputs[path]))
        self.assertEqual(outputs['index.html'].count('class="post-entry"'), 3)
        self.assertEqual(outputs['blog.html'].count('class="post-entry"'), 6)
        self.data['posts'] = original
        self.save()

  def test_skeleton_cannot_overwrite_existing_file(self):
    with self.assertRaisesRegex(ValueError, 'overwrite'):
      sync.render(self.root, 'ncs-figure-design')

  def test_new_article_cli_writes_once_and_checks_cleanly(self):
    self.add('cli-new-article', '2026-10-04')
    scripts = self.root / 'scripts'
    scripts.mkdir()
    script = scripts / 'sync-content.py'
    shutil.copy2(ROOT / 'scripts/sync-content.py', script)
    run = subprocess.run([sys.executable, str(script), '--new', 'cli-new-article'], capture_output=True)
    self.assertEqual(run.returncode, 0, run.stderr)
    created = self.root / 'posts/cli-new-article.html'
    self.assertTrue(created.is_file())
    self.assertIn('data-post="cli-new-article"', sync.read(created))
    self.assertEqual(subprocess.run([sys.executable, str(script), '--check'], capture_output=True).returncode, 0)
    before = {p: p.read_bytes() for p in self.root.rglob('*.html')}
    run = subprocess.run([sys.executable, str(script), '--new', 'cli-new-article'], capture_output=True)
    self.assertNotEqual(run.returncode, 0)
    self.assertEqual(before, {p: p.read_bytes() for p in before})

  def test_zero_and_fewer_than_three_articles(self):
    home = self.root / 'index.html'
    home.write_bytes(sync.read(home).replace('./posts/deskmate-with-firefly.html', './blog.html').encode('utf-8'))
    for count in [0, 1, 2]:
      with self.subTest(count=count):
        self.data['posts'] = self.data['posts'][:count] if count == 0 else sync.load(ROOT / 'content/posts.json')['posts'][:count]
        for path in (self.root / 'posts').glob('*.html'):
          path.unlink()
        for p in self.data['posts']:
          shutil.copy2(ROOT / ('posts/' + p['slug'] + '.html'), self.root / 'posts')
          path = self.root / 'posts' / (p['slug'] + '.html')
          source = sync.read(path)
          body = self.body(source)
          source = source.replace(body, '<div class="post-body"><p>独立测试正文。</p></div>')
          path.write_bytes(source.encode('utf-8'))
        self.save()
        outputs = sync.render(self.root)
        self.assertEqual(outputs['index.html'].count('class="post-entry"'), count)
        self.assertEqual(outputs['blog.html'].count('class="post-entry"'), count)
        if count == 1:
          self.assertNotIn('<nav class="post-nav"', outputs['posts/ncs-figure-design.html'])

  def test_invalid_metadata_never_writes(self):
    original = json.loads(json.dumps(self.data))
    variants = [('duplicate id', lambda d: d['posts'][1].update(id=1)),
      ('duplicate slug', lambda d: d['posts'][1].update(slug='ncs-figure-design')),
      ('bad date', lambda d: d['posts'][0].update(date='2026-02-30')),
      ('bad category', lambda d: d['posts'][0].update(category='research')),
      ('bad url', lambda d: d['posts'][0].update(url='../escape.html')),
      ('missing article', lambda d: d['posts'][0].update(slug='missing')),
      ('bad duration', lambda d: d['posts'][0].update(readingTime=True)),
      ('bad flag', lambda d: d['posts'][0].update(researchNote='true'))]
    before = {p: p.read_bytes() for p in self.root.rglob('*.html')}
    for label, mutate in variants:
      with self.subTest(label=label):
        self.data = json.loads(json.dumps(original))
        mutate(self.data)
        self.save()
        with self.assertRaises(ValueError):
          sync.render(self.root)
        self.assertEqual(before, {p: p.read_bytes() for p in before})

  def test_missing_duplicate_and_overlapping_regions(self):
    path = self.root / 'posts/ncs-figure-design.html'
    original = sync.read(path)
    for broken in [original.replace('<!-- sywen:post-tags:start -->', ''),
        original.replace('<!-- sywen:post-tags:start -->', '<!-- sywen:post-tags:start --><!-- sywen:post-tags:start -->'),
        original.replace('<!-- sywen:post-header:end -->', '').replace('<div class="post-body">', '<div class="post-body"><!-- sywen:post-header:end -->')]:
      path.write_bytes(broken.encode('utf-8'))
      with self.assertRaises(ValueError):
        sync.render(self.root)
      self.assertEqual(path.read_bytes(), broken.encode('utf-8'))

  def test_explicit_research_notes_share_original_url_and_number(self):
    self.data['posts'][1]['researchNote'] = True
    self.save()
    output = sync.render(self.root)['research.html']
    self.assertIn('./posts/research-reading.html', output)
    self.assertIn('A-02', output)
    self.assertNotIn('./posts/ncs-figure-design.html', output)
    for index in (2, 3, 4):
      self.data['posts'][index]['researchNote'] = True
      self.save()
      with self.assertRaisesRegex(ValueError, 'real study article'):
        sync.render(self.root)
      self.data['posts'][index]['researchNote'] = False

  def test_missing_reference_is_rejected(self):
    path = self.root / 'posts/ncs-figure-design.html'
    path.write_bytes(sync.read(path).replace('<div class="post-body">', '<div class="post-body"><img src="../assets/missing.png" alt="x">').encode('utf-8'))
    with self.assertRaisesRegex(ValueError, 'Missing local reference'):
      sync.render(self.root)

  def test_read_only_check_and_shared_identity(self):
    self.data['posts'][0]['title'] = '静态标题改变'
    self.save()
    before = (self.root / 'index.html').read_bytes()
    self.assertIn('index.html', sync.synchronize(self.root, sync.render(self.root)))
    self.assertEqual(before, (self.root / 'index.html').read_bytes())
    identity = sync.load(self.root / 'content/identity.json')
    identity['name'] = 'Test Name'
    (self.root / 'content/identity.json').write_text(json.dumps(identity), encoding='utf-8')
    outputs = sync.render(self.root)
    for page in ['index.html', 'research.html', 'profile.html']:
      self.assertIn('Test Name', outputs[page])


if __name__ == '__main__':
  parser = argparse.ArgumentParser(add_help=False)
  parser.add_argument('--report', type=Path)
  args, remaining = parser.parse_known_args()
  program = unittest.main(argv=[sys.argv[0], *remaining], verbosity=2, exit=False)
  result = program.result
  if args.report:
    report = {'at': datetime.now(timezone.utc).isoformat(), 'tests': result.testsRun,
      'passed': result.testsRun - len(result.failures) - len(result.errors),
      'failed': len(result.failures) + len(result.errors),
      'failures': [{'name': str(test), 'error': error} for test, error in result.failures + result.errors],
      'isolatedTemporaryCopies': True}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
  sys.exit(0 if result.wasSuccessful() else 1)
