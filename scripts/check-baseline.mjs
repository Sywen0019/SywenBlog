// Verification only; the website has no npm/runtime dependencies.
// npm install --prefix .tmp-browser playwright@1.63.0
// node .tmp-browser/node_modules/playwright/cli.js install firefox
// node scripts/check-baseline.mjs [--smoke | --public]
import { chromium, firefox } from '../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const publicRun = process.argv.includes('--public');
const smoke = process.argv.includes('--smoke') || publicRun;
const siteFiles = ['index.html', 'blog.html', 'about.html', ...['posts', 'css', 'js', 'assets'].flatMap((dir) =>
  fs.readdirSync(path.join(root, dir), { recursive: true, withFileTypes: true }).filter((item) => item.isFile()).map((item) =>
    path.relative(root, path.join(item.parentPath, item.name)).replaceAll('\\', '/')))];
const out = path.join(root, 'docs/evidence/baseline');
fs.mkdirSync(out, { recursive: true });
const report = {
  baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sourceFilesSha256: Object.fromEntries(siteFiles.sort().map((file) => [file, createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')])),
  at: new Date().toISOString(), mode: publicRun ? 'public' : smoke ? 'smoke' : 'full', checks: [], screenshots: [], limitations: ['No physical phone test; mobile and 200% layout checks are browser emulations.']
};
const server = http.createServer((req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (name.startsWith('/course/blog/')) name = name.slice('/course/blog'.length);
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw new Error('not found');
    const type = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.json': 'application/json' }[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(fs.readFileSync(file));
  } catch (_) { res.writeHead(404); res.end('Not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = publicRun ? (process.env.SYWEN_PUBLIC_URL || 'https://sywen-blog.pages.dev/').replace(/\/?$/, '/') : `http://127.0.0.1:${server.address().port}/`;
report.baseUrl = base;
const pages = [
  'index.html', 'blog.html', 'about.html',
  'posts/ncs-figure-design.html', 'posts/research-reading.html',
  'posts/leave-some-space.html', 'posts/deskmate-with-firefly.html',
  'posts/scrna-grn-notes.html'
];
let failures = 0;
async function check(name, fn) {
  try { const detail = await fn(); report.checks.push({ name, pass: true, detail }); }
  catch (error) { failures++; report.checks.push({ name, pass: false, error: error.message }); console.error('FAIL', name, error.message); }
}
const visibleCount = async (p) => p.locator('#blog-results .post-entry').count();
async function shot(p, name) {
  if (publicRun || smoke) return;
  const file = path.join(out, name + '.png');
  // 本机偶发 "UNKNOWN: unknown error, open …png"（约 0.6%，随机落在某个截图上）。
  // 失败一次后重试即可稳定通过，不改变截图参数，也不削弱任何断言。
  try {
    await p.screenshot({ path: file, fullPage: true });
  } catch (error) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await p.screenshot({ path: file, fullPage: true });
  }
  report.screenshots.push(name + '.png');
}

async function core(browser, label) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const p = await context.newPage();
  const exceptions = [];
  p.on('pageerror', (e) => exceptions.push(e.message));
  await check(label + ': search/category/reset/URL/keyboard', async () => {
    await p.goto(base + 'blog.html');
    await p.locator('#search-input').waitFor({ state: 'visible' });
    // js/motion.js 会给 .blog-filters 补一段 opacity/translateY(12px) 入场过渡，而 Playwright 的
    // 「visible」不排除 opacity:0。等入场过渡结束后再交互，避免首次点击落在仍在位移的按钮上
    // （2026-09-18 在 Firefox 上实测到一次 5 !== 3 的偶发失败；断言本身未放宽）。
    await p.waitForFunction(() => document.querySelector('#blog-filters').classList.contains('is-visible'));
    await p.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
    assert.equal(await visibleCount(p), 5);
    assert.deepEqual(await p.locator('#blog-categories [data-category]').evaluateAll((els) => els.map((el) => el.dataset.category)),
      ['all', 'study', 'life', 'favorites']);
    await p.locator('[data-category="study"]').click();
    assert.equal(await visibleCount(p), 3);
    await p.locator('[data-category="life"]').click();
    assert.equal(await visibleCount(p), 1);
    await p.locator('[data-category="favorites"]').click();
    // 2026-09-18 起「我喜欢的」已有文章，空状态不再由该分类触发。
    assert.equal(await visibleCount(p), 1);
    assert.match(await p.locator('#blog-results').innerText(), /和流萤做同桌/);
    await p.locator('#search-input').fill('美食');
    assert.equal(await p.locator('#blog-empty').isVisible(), true);
    assert.equal(await p.locator('#empty-title').innerText(), '没找到匹配的文章');
    await p.locator('[data-category="all"]').click();
    await p.locator('#reset-filters').click();
    assert.equal(await visibleCount(p), 5);
    await p.locator('#search-input').fill('  NCS-FIGURE-DESIGN  ');
    assert.equal(await visibleCount(p), 1);
    assert.match(await p.locator('#blog-results').innerText(), /ncs-figure-design 的设计思路/);
    assert.equal(new URL(p.url()).searchParams.get('q'), 'NCS-FIGURE-DESIGN');
    await p.locator('[data-category="life"]').click();
    assert.equal(await p.locator('#blog-empty').isVisible(), true);
    assert.equal(await p.locator('#empty-title').innerText(), '没找到匹配的文章');
    await p.locator('#empty-reset').click();
    assert.equal(await visibleCount(p), 5);
    assert.equal(await p.locator('#search-input').evaluate((el) => el === document.activeElement), true);
    await p.locator('#search-input').fill('research-reading');
    await p.locator('[data-category="study"]').click();
    assert.equal(await visibleCount(p), 1);
    await p.reload();
    assert.equal(await visibleCount(p), 1);
    assert.equal(await p.locator('[data-category="study"]').getAttribute('aria-pressed'), 'true');
    await p.goto(base + 'blog.html?category=unknown&focus=search');
    assert.equal(await visibleCount(p), 5);
    assert.equal(await p.locator('#search-input').evaluate((el) => el === document.activeElement), true);
    await p.keyboard.type('ncs-figure-design');
    await p.keyboard.press('Enter');
    assert.equal(await visibleCount(p), 1);
    await p.goto(base + 'blog.html?category=study&q=NCS-FIGURE-DESIGN');
    assert.equal(await visibleCount(p), 1);
    await p.goto(base + 'blog.html?category=life');
    assert.equal(await visibleCount(p), 1);
    await p.goBack();
    await p.locator('#search-input').waitFor({ state: 'visible' });
    assert.equal(await visibleCount(p), 1);
    assert.equal(await p.locator('[data-category="study"]').getAttribute('aria-pressed'), 'true');
    await p.goForward();
    await p.locator('#search-input').waitFor({ state: 'visible' });
    assert.equal(await visibleCount(p), 1);
    assert.equal(await p.locator('[data-category="life"]').getAttribute('aria-pressed'), 'true');
  });
  await check(label + ': legacy category parameters map to study', async () => {
    for (const legacy of ['ai', 'coding', 'research']) {
      await p.goto(base + 'blog.html?q=research-reading&category=' + legacy);
      assert.equal(await visibleCount(p), 1, legacy);
      assert.equal(await p.locator('[data-category="study"]').getAttribute('aria-pressed'), 'true', legacy);
      assert.equal(new URL(p.url()).searchParams.get('category'), 'study', legacy);
      assert.equal(new URL(p.url()).searchParams.get('q'), 'research-reading', legacy);
    }
  });
  await check(label + ': composition and text-only query', async () => {
    await p.goto(base + 'blog.html');
    await p.locator('#search-input').evaluate((el) => {
      el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      el.value = '科研绘图';
      el.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    });
    assert.equal(await visibleCount(p), 5);
    await p.locator('#search-input').evaluate((el) => el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })));
    assert.equal(await visibleCount(p), 1);
    await p.locator('#search-input').fill('<img src=x onerror=alert(1)>');
    assert.equal(await p.locator('#blog-empty').isVisible(), true);
    assert.equal(await p.locator('#blog-results img').count(), 0);
    await p.waitForTimeout(350);
    assert.equal(await p.locator('#result-count').innerText(), '找到 0 篇文章');
  });
  await check(label + ': theme persistence and explicit selection', async () => {
    await p.goto(base + 'index.html');
    await p.locator('#theme-toggle').click();
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
    await p.reload();
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
    await p.goto(base + 'posts/ncs-figure-design.html');
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await p.locator('#theme-toggle').innerText(), '切换至浅色');
    await p.emulateMedia({ colorScheme: 'light' });
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
    // E04 起「快捷菜单」按钮在具备 (hover: hover) and (pointer: fine) 的页面上会显示；
    // 断言改为与浏览器实际报告的能力一致，触摸/键盘设备上仍须保持 hidden 且不参与布局。
    const menuState = await p.evaluate(() => {
      const button = document.getElementById('quick-menu-button');
      if (!button) return null;
      const style = getComputedStyle(button);
      return {
        capable: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
        visible: style.display !== 'none' && style.visibility !== 'hidden',
        haspopup: button.getAttribute('aria-haspopup'),
        expanded: button.getAttribute('aria-expanded'),
        menuHidden: document.getElementById('context-menu').hasAttribute('hidden'),
      };
    });
    assert.ok(menuState, 'missing #quick-menu-button');
    assert.equal(menuState.haspopup, 'menu');
    assert.equal(menuState.expanded, 'false');
    assert.equal(menuState.visible, menuState.capable, `quick-menu-button visibility ${menuState.visible} vs capability ${menuState.capable}`);
    assert.equal(menuState.menuHidden, true);
  });
  await check(label + ': no uncaught JS exceptions', async () => assert.deepEqual(exceptions, []));
  await context.close();
}

try {
  for (const [label, type, options] of [['Edge', chromium, { channel: 'msedge' }], ['Chrome', chromium, { channel: 'chrome' }], ['Firefox', firefox, {}]]) {
    let browser;
    try {
      browser = await type.launch({ ...options, headless: true });
      report.checks.push({ name: label + ' version', pass: true, detail: browser.version() });
      await core(browser, label);
      if (label !== 'Edge' || smoke) continue;

      await check('All eight pages: local targets and unique headings', async () => {
        const p = await browser.newPage();
        const targets = new Set();
        for (const name of pages) {
          const response = await p.goto(base + name);
          assert.equal(response.status(), 200);
          assert.equal(await p.locator('h1').count(), 1);
          const links = await p.locator('a[href]').evaluateAll((els) => els.map((el) => el.href));
          links.filter((u) => u.startsWith(base)).forEach((u) => targets.add(u));
          assert.equal(await p.locator('[aria-current]').count(), 1);
        }
        for (const u of targets) assert.equal((await p.request.get(u)).status(), 200, u);
        await p.close();
        return { internalTargets: targets.size };
      });

      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({ colorScheme: theme });
        const p = await context.newPage();
        const errors = [];
        p.on('pageerror', (e) => errors.push(e.message));
        p.on('response', (r) => { if (r.status() >= 400) errors.push(r.status() + ' ' + r.url()); });
        for (const name of pages) {
          for (const width of [320, 390, 767, 768, 769, 1023, 1024, 1025, 1440]) {
            await check(`${theme} ${name} ${width}px`, async () => {
              await p.setViewportSize({ width, height: 900 });
              await p.goto(base + name);
              const size = await p.evaluate(async () => {
                await Promise.all(Array.from(document.images).filter((img) => img.loading !== 'lazy').map((img) => img.decode().catch(() => {})));
                return { scroll: document.documentElement.scrollWidth, viewport: innerWidth,
                  post: document.querySelector('.post')?.getBoundingClientRect().width,
                  broken: Array.from(document.images).filter((img) => img.complete && !img.naturalWidth).map((img) => img.src) };
              });
              assert.ok(size.scroll <= width + 1, JSON.stringify(size));
              assert.ok(!size.post || size.post <= 741);
              assert.deepEqual(size.broken, []);
              assert.equal(await p.locator('#theme-toggle').isVisible(), true);
              if ([390, 1440].includes(width) && pages.indexOf(name) < 4) {
                const id = name === 'index.html' ? 'home' : name.startsWith('posts') ? 'post' : name.replace('.html', '');
                await shot(p, `${id}-${width}-${theme}`);
              } else if (width === 1440 && theme === 'light' && pages.indexOf(name) >= 4) {
                await shot(p, name.replace('posts/', '').replace('.html', ''));
              }
            });
          }
        }
        await check(theme + ': no resource/JS failures in layout matrix', async () => assert.deepEqual(errors, []));
        await context.close();
      }

      await check('No JavaScript: eight pages and static index', async () => {
        const c = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 }, colorScheme: 'dark' });
        const p = await c.newPage();
        for (const name of pages) {
          await p.goto(base + name);
          assert.equal(await p.locator('#theme-toggle').isVisible(), false);
          assert.equal(await p.locator('.site-nav a').count(), 3);
          if (name === 'blog.html') {
            assert.equal(await p.locator('#blog-static-list .post-entry').count(), 5);
            assert.equal(await p.locator('#blog-filters').isVisible(), false);
          }
        }
        await p.goto(base + 'index.html');
        await shot(p, 'home-nojs-390-dark');
        await c.close();
      });

      for (const script of ['posts-data.js', 'site.js', 'blog.js']) {
        await check('Initialization fallback: missing ' + script, async () => {
          const p = await browser.newPage();
          await p.route('**/js/' + script, (route) => route.abort());
          await p.goto(base + 'blog.html');
          assert.equal(await p.locator('#blog-static-list').isVisible(), true);
          assert.equal(await p.locator('#blog-static-list .post-entry').count(), 5);
          assert.equal(await p.locator('#blog-filters').isVisible(), false);
          await p.close();
        });
      }

      await check('Malformed article data preserves static list', async () => {
        const p = await browser.newPage();
        await p.route('**/js/posts-data.js', (r) => r.fulfill({ contentType: 'text/javascript', body: 'window.Sywen.posts=[{title:null}];window.Sywen.categories=[];' }));
        await p.goto(base + 'blog.html');
        assert.equal(await p.locator('#blog-static-list').isVisible(), true);
        assert.equal(await p.locator('#blog-filters').isVisible(), false);
        await p.close();
      });

      await check('Storage read/write failures and system follow', async () => {
        const c = await browser.newContext({ colorScheme: 'light' });
        await c.addInitScript(() => {
          Storage.prototype.getItem = () => { throw new Error('disabled'); };
          Storage.prototype.setItem = () => { throw new Error('disabled'); };
        });
        const p = await c.newPage();
        await p.goto(base + 'index.html');
        assert.equal(await p.locator('html').getAttribute('data-theme'), 'light');
        await p.emulateMedia({ colorScheme: 'dark' });
        await p.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
        await p.locator('#theme-toggle').click();
        assert.equal(await p.locator('html').getAttribute('data-theme'), 'light');
        await p.emulateMedia({ colorScheme: 'light' });
        await p.emulateMedia({ colorScheme: 'dark' });
        assert.equal(await p.locator('html').getAttribute('data-theme'), 'light');
        await c.close();
      });

      await check('Invalid saved theme follows system', async () => {
        const c = await browser.newContext({ colorScheme: 'dark' });
        await c.addInitScript(() => localStorage.setItem('sywen.theme', 'not-a-theme'));
        const p = await c.newPage(); await p.goto(base + 'index.html');
        assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
        await c.close();
      });

      await check('URL update failure does not stop filtering', async () => {
        const p = await browser.newPage();
        await p.addInitScript(() => { history.replaceState = () => { throw new Error('blocked'); }; });
        await p.goto(base + 'blog.html'); await p.locator('#search-input').fill('NCS-FIGURE-DESIGN');
        assert.equal(await visibleCount(p), 1);
        await p.close();
      });

      await check('Subdirectory, tags and article assets', async () => {
        const p = await browser.newPage();
        await p.goto(base + 'course/blog/blog.html?q=ncs-figure-design&category=coding');
        assert.equal(await visibleCount(p), 1);
        assert.equal(await p.locator('[data-category="study"]').getAttribute('aria-pressed'), 'true');
        assert.equal(new URL(p.url()).searchParams.get('category'), 'study');
        const link = p.locator('#blog-results .post-entry__link');
        assert.ok((await link.getAttribute('href')).includes('/course/blog/posts/'));
        await link.click();
        assert.match(p.url(), /course\/blog\/posts\/ncs-figure-design.html/);
        await p.locator('.tag').filter({ hasText: 'ncs-figure-design' }).click();
        assert.equal(await visibleCount(p), 1);
        await p.close();
      });

      await check('Images fail without collapsing the Hero', async () => {
        const p = await browser.newPage({ viewport: { width: 390, height: 900 } });
        await p.goto(base + 'index.html');
        const before = await p.locator('.hero-art--desk').boundingBox();
        await p.route('**/hero-desk-*.webp', (r) => r.abort());
        await p.reload();
        const after = await p.locator('.hero-art--desk').boundingBox();
        assert.ok(Math.abs(before.height - after.height) < 1);
        assert.equal(await p.locator('.art-frame.is-failed').count(), 1);
        await shot(p, 'home-image-failed-390');
        await p.close();
      });

      await check('Keyboard, focus and reduced motion', async () => {
        const p = await browser.newPage({ reducedMotion: 'reduce' });
        await p.goto(base + 'index.html');
        await p.keyboard.press('Tab');
        assert.equal(await p.locator('.skip-link').evaluate((el) => el === document.activeElement), true);
        await p.keyboard.press('Enter');
        assert.equal(await p.locator('#main').evaluate((el) => el === document.activeElement), true);
        await p.locator('#theme-toggle').focus();
        assert.notEqual(await p.locator('#theme-toggle').evaluate((el) => getComputedStyle(el).outlineStyle), 'none');
        assert.equal(await p.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
        await shot(p, 'keyboard-focus');
        await p.close();
      });

      await check('200% equivalent layout and long text', async () => {
        const p = await browser.newPage({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
        for (const name of ['index.html', 'blog.html', 'posts/ncs-figure-design.html']) {
          await p.goto(base + name);
          await p.locator('h1').evaluate((el) => { el.textContent += ' LongTitleWithoutSpaces'.repeat(8); });
          assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        }
        await p.close();
      });

      await check('Cold-cache homepage transfer and slow loading', async () => {
        const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        await p.route('**/hero-desk-*.webp', async (r) => { await new Promise((resolve) => setTimeout(resolve, 600)); await r.continue(); });
        await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded' });
        const before = await p.locator('.hero-art--desk').boundingBox();
        await p.waitForLoadState('networkidle');
        const after = await p.locator('.hero-art--desk').boundingBox();
        assert.equal(before.height, after.height);
        const bytes = await p.evaluate(() => performance.getEntriesByType('resource').reduce((n, e) => n + e.transferSize, 0));
        assert.ok(bytes <= 800000, String(bytes));
        await p.evaluate(() => scrollTo(0, document.body.scrollHeight));
        await p.waitForTimeout(150);
        const total = await p.evaluate(() => performance.getEntriesByType('resource').reduce((n, e) => n + e.transferSize, 0));
        assert.ok(total <= 1200000);
        await p.close();
        return { initialSubresourcesBytes: bytes, totalSubresourcesBytes: total };
      });

      await check('Default / no-result screenshots', async () => {
        const p = await browser.newPage({ viewport: { width: 390, height: 900 }, colorScheme: 'dark' });
        await p.goto(base + 'blog.html?q=no-results');
        await shot(p, 'blog-empty-390-dark');
        await p.goto(base + 'blog.html?category=favorites');
        assert.equal(await visibleCount(p), 1);
        await shot(p, 'blog-favorites-390-dark');
        await p.close();
      });
    } catch (error) {
      failures++; report.checks.push({ name: label + ' availability', pass: false, error: error.message });
    } finally { if (browser) await browser.close(); }
  }
} finally {
  server.close();
  report.passed = report.checks.filter((c) => c.pass).length;
  report.failed = failures;
  fs.writeFileSync(path.join(out, publicRun ? 'public-checks.json' : smoke ? 'smoke-checks.json' : 'checks.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ mode: report.mode, passed: report.passed, failed: failures }));
}
process.exitCode = failures ? 1 : 0;
