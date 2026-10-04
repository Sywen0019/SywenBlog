"""Synchronize bounded static regions; article bodies remain author-owned.

Python standard library only. Run with --check, --write, or --new SLUG.
"""
import argparse
from datetime import date
from html import escape
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
from urllib.parse import quote, unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
POST_REGIONS = ('post-head', 'post-header', 'post-rail', 'post-tags', 'post-nav')


def read(path):
  return path.read_bytes().decode('utf-8')


def load(path):
  return json.loads(read(path))


def require(condition, message):
  if not condition:
    raise ValueError(message)


def text(value):
  return escape(str(value), quote=True)


def valid_text(value):
  return isinstance(value, str) and bool(value.strip()) and '\x00' not in value


def pages(root=ROOT):
  result = load(root / 'content/pages.json')
  require(isinstance(result, list) and len(result) == len(set(result)), 'Invalid page manifest')
  require(all(isinstance(p, str) and re.fullmatch(r'[a-z0-9-]+\.html', p) for p in result),
    'Invalid top-level page path')
  require(set(('index.html', 'blog.html', 'research.html', 'profile.html', 'about.html')).issubset(result),
    'Required V2 page is not registered')
  return result


def dataset(root, new_slug=None):
  data = load(root / 'content/posts.json')
  require(isinstance(data, dict), 'Invalid article dataset')
  categories, posts = data.get('categories'), data.get('posts')
  require(isinstance(categories, list) and isinstance(posts, list), 'Missing categories/posts arrays')
  category_ids = set()
  for category in categories:
    require(isinstance(category, dict), 'Invalid category')
    key = category.get('id')
    require(key in ('study', 'life', 'favorites') and key not in category_ids, 'Invalid/duplicate category')
    category_ids.add(key)
    require(all(valid_text(category.get(k)) for k in ('name', 'note', 'mark', 'image')), 'Incomplete category')
    require(re.fullmatch(r'[a-z0-9-]+', category['mark']) is not None, 'Invalid category mark')
    require(re.fullmatch(r'assets/images/[a-z0-9-]+\.webp', category['image']) is not None,
      'Invalid category image path')
    require((root / category['image']).is_file(), 'Missing category image: ' + category['image'])
  require(category_ids == {'study', 'life', 'favorites'}, 'V2 retains the three existing categories')
  ids, slugs = set(), set()
  result = []
  for original in posts:
    require(isinstance(original, dict), 'Invalid article metadata')
    post = dict(original)
    slug, post_id = post.get('slug'), post.get('id')
    require(isinstance(slug, str) and SLUG.fullmatch(slug), 'Invalid article slug')
    require(type(post_id) is int and post_id > 0 and post_id not in ids, 'Invalid/duplicate article id')
    require(slug not in slugs, 'Duplicate article slug: ' + slug)
    ids.add(post_id)
    slugs.add(slug)
    require(all(valid_text(post.get(k)) for k in ('title', 'summary', 'date')), 'Incomplete article: ' + slug)
    require(re.fullmatch(r'\d{4}-\d{2}-\d{2}', post['date']) is not None, 'Invalid date: ' + slug)
    date.fromisoformat(post['date'])
    require(post.get('category') in category_ids, 'Unknown category: ' + slug)
    require(isinstance(post.get('tags'), list) and all(valid_text(t) for t in post['tags']), 'Invalid tags: ' + slug)
    require(type(post.get('readingTime')) is int and post['readingTime'] > 0, 'Invalid readingTime: ' + slug)
    for key in ('isDemo', 'isTestSample', 'researchNote'):
      require(type(post.get(key, False)) is bool, 'Invalid ' + key + ': ' + slug)
    require('isDemo' in post, 'Missing isDemo: ' + slug)
    post['researchNote'] = post.get('researchNote', False)
    require(not post['researchNote'] or (post['category'] == 'study'
      and not post['isDemo'] and not post.get('isTestSample')), 'Research Notes requires a real study article: ' + slug)
    url = 'posts/' + slug + '.html'
    require('url' not in post or post['url'] == url, 'Article URL disagrees with slug: ' + slug)
    post['url'] = url
    require((root / url).is_file() or slug == new_slug, 'Missing article: ' + url)
    result.append(post)
  require(new_slug is None or new_slug in slugs, 'Register the new article metadata before creating its skeleton')
  registered = {p['url'] for p in result}
  require(all(p.relative_to(root).as_posix() in registered for p in (root / 'posts').glob('*.html')),
    'Unregistered article HTML in posts/')
  result.sort(key=lambda p: (-date.fromisoformat(p['date']).toordinal(), p['id']))
  return categories, result


def replace_region(source, name, replacement):
  start, end = '<!-- sywen:' + name + ':start -->', '<!-- sywen:' + name + ':end -->'
  require(source.count(start) == 1 and source.count(end) == 1, 'Missing/duplicate region: ' + name)
  a, b = source.index(start) + len(start), source.index(end)
  require(a <= b, 'Reversed region: ' + name)
  require('class="post-body"' not in source[a:b], 'Generated region overlaps article body: ' + name)
  newline = '\r\n' if '\r\n' in source else '\n'
  replacement = replacement.replace('\r\n', '\n').replace('\n', newline)
  return source[:a] + newline + replacement + newline + source[b:]


def mark(category, prefix):
  return ('<span class="category-mark" aria-hidden="true"><svg class="mark mark--small" '
    'aria-hidden="true" focusable="false"><use href="' + prefix + 'assets/icons/marks.svg#mark-'
    + text(category['mark']) + '"></use></svg></span>')


def entry(post, category, index, level=2, prefix='./'):
  meta = '/ ' + str(post['readingTime']) + ' 分钟'
  if post['isDemo']:
    meta += ' · 示例'
  if post.get('isTestSample'):
    meta += ' · 测试样例'
  return '\n'.join([
    '        <li class="post-entry" data-post-id="' + post['slug'] + '">',
    '          <time class="post-entry__date" datetime="' + post['date'] + '">' + post['date'] + '</time>',
    '          <div class="post-entry__content">',
    '            <p class="post-entry__category"><span class="post-entry__number" aria-hidden="true">A-'
      + str(index + 1).zfill(2) + '</span>' + mark(category, prefix) + text(category['name'])
      + ' <span class="post-entry__meta">' + meta + '</span></p>',
    '            <h' + str(level) + ' class="post-entry__title"><a class="post-entry__link" href="'
      + prefix + post['url'] + '">' + text(post['title']) + '</a></h' + str(level) + '>',
    '            <p class="post-entry__summary">' + text(post['summary']) + '</p>',
    '          </div>',
    '        </li>'
  ])


def article_regions(post, category, index, posts):
  number = 'A-' + str(index + 1).zfill(2)
  header = '\n'.join([
    '      <header class="post-header">',
    '        <p class="post-header__index" aria-hidden="true">' + number + '</p>',
    '        <p class="post-meta"><a class="post-meta__category" href="../blog.html?category=' + post['category']
      + '">' + text(category['name']) + '</a><time class="post-meta__date" datetime="' + post['date'] + '">'
      + post['date'] + '</time><span class="post-meta__time">约 ' + str(post['readingTime']) + ' 分钟</span></p>',
    '        <h1 class="page-title post-header__title">' + text(post['title']) + '</h1>'
  ])
  if post['isDemo']:
    header += '\n        <p class="post-demo-note">示例文章</p>'
  if post.get('isTestSample'):
    header += '\n        <p class="post-demo-note">测试样例 · 用于验证文档发布流程</p>'
  header += '\n      </header>'
  rail = '\n'.join([
    '      <div class="post-rail narrative" aria-hidden="true">',
    '        <span class="post-rail__mark"><svg class="mark" aria-hidden="true" focusable="false"><use href="../assets/icons/marks.svg#mark-'
      + text(category['mark']) + '"></use></svg></span>',
    '        <span class="post-rail__number">' + number + '</span>',
    '      </div>'
  ])
  tags = '      <ul class="tag-list" aria-label="文章标签">' + ''.join(
    '<li><a class="tag" href="../blog.html?q=' + quote(t, safe='') + '">' + text(t) + '</a></li>' for t in post['tags']) + '</ul>'
  neighbors = []
  for position, label in ((index - 1, '下一篇 · 更新'), (index + 1, '上一篇 · 更早')):
    if 0 <= position < len(posts):
      other = posts[position]
      neighbors.append('<a href="./' + other['slug'] + '.html"><span class="post-nav__label">'
        + label + '</span>' + text(other['title']) + '</a>')
  nav = '      <nav class="post-nav" aria-label="相邻文章">' + ''.join(neighbors) + '</nav>' if neighbors else ''
  return {
    'post-head': '<title>' + text(post['title']) + ' · Sywen\'s Space</title>\n<meta name="description" content="' + text(post['summary']) + '">',
    'post-header': header, 'post-rail': rail, 'post-tags': tags, 'post-nav': nav
  }


class ArticleBody(HTMLParser):
  """Locate the author-owned div, including nested divs, without serializing it."""
  def __init__(self, source):
    super().__init__()
    self.offsets = [0]
    for line in source.splitlines(keepends=True):
      self.offsets.append(self.offsets[-1] + len(line))
    self.depth = 0
    self.bodies = []

  def source_offset(self):
    line, column = self.getpos()
    return self.offsets[line - 1] + column

  def handle_starttag(self, tag, attrs):
    if tag != 'div':
      return
    if self.depth:
      self.depth += 1
    elif 'post-body' in dict(attrs).get('class', '').split():
      self.bodies.append([self.source_offset(), None])
      self.depth = 1

  def handle_endtag(self, tag):
    if tag == 'div' and self.depth:
      self.depth -= 1
      if not self.depth:
        self.bodies[-1][1] = self.source_offset() + len('</div>')


def validate_article_regions(source):
  parser = ArticleBody(source)
  parser.feed(source)
  require(len(parser.bodies) == 1 and parser.bodies[0][1] is not None, 'Article needs one complete post-body')
  body_start, body_end = parser.bodies[0]
  previous_end = -1
  for name in POST_REGIONS:
    start, end = '<!-- sywen:' + name + ':start -->', '<!-- sywen:' + name + ':end -->'
    require(source.count(start) == source.count(end) == 1, 'Missing/duplicate region: ' + name)
    a, b = source.index(start), source.index(end) + len(end)
    require(previous_end < a < b, 'Overlapping/reordered article region: ' + name)
    require(b <= body_start if name in POST_REGIONS[:3] else a >= body_end, 'Region overlaps article body: ' + name)
    if name == 'post-head':
      require(b < source.index('</head>'), 'post-head must be inside head')
    previous_end = b


class LocalReferences(HTMLParser):
  def __init__(self):
    super().__init__()
    self.paths = []

  def handle_starttag(self, tag, attrs):
    attrs = dict(attrs)
    for key in ('href', 'src'):
      if attrs.get(key):
        self.paths.append(attrs[key])
    if attrs.get('srcset'):
      self.paths.extend(part.strip().split()[0] for part in attrs['srcset'].split(',') if part.strip())


def validate_references(root, outputs):
  for name, source in outputs.items():
    if not name.endswith('.html'):
      continue
    parser = LocalReferences()
    parser.feed(source)
    for value in parser.paths:
      url = urlsplit(value)
      if url.scheme or url.netloc or not url.path:
        continue
      target = (root / Path(name).parent / unquote(url.path)).resolve()
      require(target.is_relative_to(root.resolve()), 'Reference leaves the site: ' + value)
      relative = target.relative_to(root.resolve()).as_posix()
      require(relative in outputs or target.is_file(), 'Missing local reference in ' + name + ': ' + value)


def render(root=ROOT, new_slug=None):
  categories, posts = dataset(root, new_slug)
  category_map = {c['id']: c for c in categories}
  registered_pages = pages(root)
  identity = load(root / 'content/identity.json')
  require(isinstance(identity, dict) and all(valid_text(identity.get(k)) for k in
    ('nickname', 'name', 'lensName', 'university', 'major', 'description')), 'Incomplete identity')
  require(isinstance(identity.get('interests'), list) and all(valid_text(v) for v in identity['interests']), 'Invalid interests')
  outputs = {name: read(root / name) for name in registered_pages}
  for index, post in enumerate(posts):
    name = post['url']
    if post['slug'] == new_slug:
      require(not (root / name).exists(), 'Refusing to overwrite an existing article: ' + name)
      source = read(root / 'templates/post.html').replace('@@SLUG@@', new_slug)
    else:
      source = read(root / name)
    require('data-post="' + post['slug'] + '"' in source and 'data-post-id="' + post['slug'] + '"' in source,
      'Article identity disagrees with metadata: ' + name)
    validate_article_regions(source)
    for key, value in article_regions(post, category_map[post['category']], index, posts).items():
      source = replace_region(source, key, value)
    outputs[name] = source

  outputs['index.html'] = replace_region(outputs['index.html'], 'latest', '\n'.join(
    entry(post, category_map[post['category']], index, 3) for index, post in enumerate(posts[:3])))
  outputs['blog.html'] = replace_region(outputs['blog.html'], 'archive', '\n'.join(
    entry(post, category_map[post['category']], index) for index, post in enumerate(posts)))
  counts = '\n'.join('        <li><a href="./blog.html?category=' + c['id'] + '">' + text(c['name'])
    + '</a> <span class="category-count" data-category-count="' + c['id'] + '">'
    + str(sum(p['category'] == c['id'] for p in posts)) + '</span> 篇</li>' for c in categories)
  outputs['blog.html'] = replace_region(outputs['blog.html'], 'category-counts', counts)
  notes = [(i, p) for i, p in enumerate(posts) if p['researchNote']]
  note_content = '<ol class="post-list">\n' + '\n'.join(entry(p, category_map[p['category']], i, 3) for i, p in notes) + '\n</ol>'
  if not notes:
    note_content = '      <p class="page-intro">研究笔记尚未收录。</p>\n      <p><a href="./blog.html?category=study">阅读学业文章</a></p>'
  outputs['research.html'] = replace_region(outputs['research.html'], 'research-notes', note_content)

  hero = '\n'.join([
    '        <h1 class="hero__title" id="hero-title" lang="en"><span class="hero-name">',
    '          <span class="hero-name__public">' + text(identity['nickname']) + '</span>',
    '          <span class="hero-name__formal" aria-hidden="true">' + text(identity['lensName']) + '</span>',
    '        </span></h1>',
    '        <p class="hero__identity" lang="en">' + text(identity['university']) + '<br>' + text(identity['major']) + '</p>',
    '        <p class="hero__interests" lang="en">Interests — ' + text(' / '.join(identity['interests'])) + '</p>',
    '        <p class="hero__intro" lang="en">' + text(identity['description']) + '</p>',
    '        <div class="hero__actions">',
    '          <a class="button button--primary" href="./blog.html">阅读文章</a>',
    '          <a class="button button--secondary" href="./profile.html">履历 · <span lang="en">' + text(identity['name']) + '</span></a>',
    '        </div>'
  ])
  outputs['index.html'] = replace_region(outputs['index.html'], 'hero-identity', hero)
  outputs['profile.html'] = replace_region(outputs['profile.html'], 'profile-identity', '\n'.join([
    '      <h1 class="page-title">履历 · <span lang="en">' + text(identity['name']) + '</span></h1>',
    '      <p class="page-intro" lang="en">' + text(identity['university']) + '<br>' + text(identity['major']) + '</p>'
  ]))
  outputs['research.html'] = replace_region(outputs['research.html'], 'research-identity',
    '      <p class="page-intro" lang="en">' + text(identity['name']) + '</p>')
  outputs['research.html'] = replace_region(outputs['research.html'], 'research-interests',
    '      <ul class="research-interests">' + ''.join('<li lang="en">' + text(v) + '</li>' for v in identity['interests']) + '</ul>')
  encoded_categories = json.dumps(categories, ensure_ascii=False, indent=2)
  encoded_posts = json.dumps(posts, ensure_ascii=False, indent=2)
  outputs['js/posts-data.js'] = ('// Generated by scripts/sync-content.py from content/posts.json.\n'
    '(function () {\n  \'use strict\';\n  const site = window.Sywen = window.Sywen || {};\n'
    '  site.categories = ' + encoded_categories + ';\n  site.posts = ' + encoded_posts + ';\n})();\n')
  validate_references(root, outputs)
  return outputs


def synchronize(root, outputs, write=False):
  changed = []
  for name, source in outputs.items():
    path = root / name
    data = source.encode('utf-8')
    if path.is_file() and path.read_bytes() == data:
      continue
    changed.append(name)
    if write:
      path.parent.mkdir(parents=True, exist_ok=True)
      temporary = path.with_name(path.name + '.tmp')
      temporary.write_bytes(data)
      os.replace(temporary, path)
  return changed


def main():
  parser = argparse.ArgumentParser(description=__doc__)
  mode = parser.add_mutually_exclusive_group(required=True)
  mode.add_argument('--check', action='store_true', help='Report stale outputs without writing')
  mode.add_argument('--write', action='store_true', help='Update explicitly marked generated regions')
  mode.add_argument('--new', metavar='SLUG', help='Create a registered, missing article from the static skeleton and synchronize')
  mode.add_argument('--list-pages', action='store_true', help='Print the production top-level page manifest')
  args = parser.parse_args()
  try:
    if args.list_pages:
      print(' '.join(pages()))
      return 0
    outputs = render(new_slug=args.new)
    changed = synchronize(ROOT, outputs, args.write or args.new is not None)
    if changed:
      print(('Updated: ' if not args.check else 'Stale generated output: ') + ', '.join(changed))
    else:
      print('Content is synchronized.')
    return 1 if args.check and changed else 0
  except (ValueError, KeyError, TypeError, OSError) as error:
    print('Content error: ' + str(error), file=sys.stderr)
    return 1


if __name__ == '__main__':
  sys.exit(main())
