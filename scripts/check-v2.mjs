// V2 architecture and progressive enhancement checks; local HTTP only.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium, firefox } from '../.tmp-browser/node_modules/playwright/index.mjs';

const root = path.resolve(import.meta.dirname, '..');
const out = path.resolve(root, process.env.SYWEN_EVIDENCE_DIR || 'docs/evidence/v2/browser');
fs.mkdirSync(out, { recursive: true });
const topPages = JSON.parse(fs.readFileSync(path.join(root, 'content/pages.json')));
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'content/posts.json')));
const pages = [...topPages, ...metadata.posts.map(p => `posts/${p.slug}.html`)];
const report = { at: new Date().toISOString(), sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  workingTree: true, checks: [], screenshots: [], limitations: ['No physical phone, screen reader, real IME or browser UI zoom certification. No public deployment.'] };
const server = http.createServer((req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://local').pathname).replace(/^\/course\/blog\//, '/');
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep)) throw Error('outside root');
    const type = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg' }[path.extname(file)];
    res.setHeader('Content-Type', type || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;
async function check(name, fn) {
  try { report.checks.push({ name, pass: true, detail: await fn() }); }
  catch (e) { report.checks.push({ name, pass: false, error: e.stack }); console.error('FAIL', name, e.message); }
}
async function ready(page) {
  await page.evaluate(() => { document.querySelectorAll('img').forEach(img => { img.loading = 'eager'; }); });
  await page.waitForFunction(() => [...document.images].every(img => img.complete), null, { timeout: 8000 });
  await page.evaluate(() => Promise.race([Promise.all([...document.images].map(img => img.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 1500))]));
  await page.evaluate(() => {
    document.querySelectorAll('.motion-reveal').forEach(el => el.classList.add('is-visible'));
    return Promise.race([Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))), new Promise(resolve => setTimeout(resolve, 700))]);
  });
}
async function shot(page, name, selector) {
  const file = name + '.png';
  const target = selector ? page.locator(selector) : page;
  await target.screenshot({ path: path.join(out, file), ...(selector ? {} : { fullPage: true }), animations: 'disabled' });
  report.screenshots.push(file);
}
const sha = data => createHash('sha256').update(data).digest('hex');
const engines = (process.argv.find(a => a.startsWith('--browser='))?.split('=')[1] || 'edge,chrome,firefox').split(',');

try {
  await check('Category masters remain exported, valid and unchanged', async () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/category-assets.json')));
    for (const item of manifest) {
      const data = fs.readFileSync(path.join(root, item.file));
      assert.equal(sha(data), item.sha256);
      assert.equal(data.length, item.bytes);
      assert.ok(data.length <= 40 * 1024);
      assert.equal(data.subarray(0, 4).toString(), 'RIFF');
      assert.equal(data.subarray(8, 12).toString(), 'WEBP');
      assert.deepEqual([item.width, item.height], [640, 480]);
    }
    return { assets: manifest.length, use: 'Retained assets; retired Home category placement.' };
  });
  for (const engine of engines) {
    const browser = await (engine === 'firefox' ? firefox : chromium).launch({ headless: true,
      ...(engine === 'firefox' ? {} : { channel: engine === 'edge' ? 'msedge' : 'chrome' }) });
    try {
      report.checks.push({ name: `${engine} version`, pass: true, detail: browser.version() });
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({ colorScheme: theme, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
        for (const width of [320, 390, 768, 1024, 1440]) {
          await check(`${engine}/${theme}/${width}: V2 flow, navigation and formal pages`, async () => {
            await page.setViewportSize({ width, height: 900 });
            for (const name of topPages) {
              await page.goto(base + name);
              await ready(page);
              assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
              assert.deepEqual(await page.locator('.site-nav a').allTextContents(), ['首页', '文章', '研究', '履历', '关于']);
              assert.deepEqual(await page.locator('.site-footer__links a').allTextContents(), ['首页', '文章', '研究', '履历', '关于', 'Gitee 仓库', 'GitHub 仓库']);
              assert.equal(await page.locator('.site-nav [aria-current]').count(), 1);
              const headings = await page.locator('h1').count();
              assert.equal(headings, 1);
              const links = await page.locator('.site-nav a').evaluateAll(els => els.map(el => {
                const b = el.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, height: b.height };
              }));
              assert.ok(links.every(b => b.left >= 0 && b.right <= width && b.height >= 40));
              if (width <= 1023) {
                const tools = await page.locator('.site-tools').boundingBox();
                if (tools?.height) assert.ok(links[0].top >= tools.y + tools.height);
              }
              if (name === 'index.html') {
                assert.deepEqual(await page.locator('main > .container > section').evaluateAll(els => els.map(el => el.id || el.classList[0])),
                  ['hero', 'home-section', 'home-selected-now', 'off-the-desk']);
                assert.equal(await page.locator('#home-categories').count(), 0);
                assert.equal(await page.locator('#home-recent img').count(), 0);
                assert.equal(await page.locator('#home-recent .post-entry').count(), Math.min(3, metadata.posts.length));
                assert.deepEqual(await page.locator('.selected-links a').evaluateAll(els => els.map(el => el.getAttribute('href'))),
                  ['./research.html#research-interests', './research.html#publications', './research.html#research-notes']);
                const selected = await page.locator('.home-selected').boundingBox();
                const now = await page.locator('.home-now').boundingBox();
                if (width < 768) assert.ok(now.y >= selected.y + selected.height);
                else assert.ok(now.x > selected.x && Math.abs(now.y - selected.y) <= 1);
                assert.deepEqual(await page.locator('.now-list dt').allTextContents(), ['Researching', 'Learning', 'Watching']);
                assert.equal(await page.locator('#off-the-desk [aria-hidden="true"] img').count(), 0);
                assert.ok(await page.locator('#off-the-desk img').getAttribute('alt'));
                assert.equal(await page.locator('#off-the-desk img').evaluate(img => getComputedStyle(img).filter), 'none');
              } else if (name === 'research.html') {
                assert.equal(await page.locator('#research-notes .post-entry').count(), 0);
                assert.match(await page.locator('#research-notes').innerText(), /研究笔记尚未收录/);
                assert.match(await page.locator('#publications').innerText(), /公开论文条目尚未整理/);
                assert.match(await page.locator('main').innerText(), /Luo Wenxi/);
              } else if (name === 'profile.html') {
                assert.match(await page.locator('main').innerText(), /Luo Wenxi/);
                assert.match(await page.locator('main').innerText(), /University of South China/);
              } else if (name === 'about.html') {
                assert.equal(await page.locator('.about-now .note-panel').count(), 0);
                assert.equal(await page.locator('.about-now a[href="./index.html#home-now"]').count(), 1);
              }
              if (engine === 'edge' && [390, 1440].includes(width)) await shot(page, `${name.replace('.html', '')}-${width}-${theme}`);
            }
          });
        }
        await check(`${engine}/${theme}: no page or resource failures`, async () => assert.deepEqual(errors, []));
        await context.close();
      }

      await check(`${engine}: ten static footers link both repositories without mobile overflow`, async () => {
        const c = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 700 } });
        const p = await c.newPage();
        for (const name of pages) {
          await p.goto(base + name);
          const repoLinks = p.locator('.site-footer__links a').filter({ hasText: /仓库/ });
          assert.deepEqual(await repoLinks.evaluateAll(els => els.map(el => [el.textContent, el.href])), [
            ['Gitee 仓库', 'https://gitee.com/Sywen7777/Blog'],
            ['GitHub 仓库', 'https://github.com/Sywen0019/SywenBlog']
          ]);
          assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
          const bounds = await repoLinks.evaluateAll(els => els.map(el => {
            const b = el.getBoundingClientRect(); return { left: b.left, right: b.right };
          }));
          assert.ok(bounds.every(b => b.left >= 0 && b.right <= 320));
        }
        await c.close();
        return { pages: pages.length, width: 320, javaScript: false };
      });

      await check(`${engine}: static and dynamic lists match, including markers`, async () => {
        const c = await browser.newContext({ reducedMotion: 'reduce' });
        const p = await c.newPage();
        await p.goto(base + 'blog.html');
        const lists = await p.evaluate(() => {
          const collect = selector => [...document.querySelectorAll(selector)].map(el => ({
            slug: el.dataset.postId, fields: ['.post-entry__date', '.post-entry__category', '.post-entry__title', '.post-entry__summary'].map(s => el.querySelector(s).textContent.trim()), link: el.querySelector('a.post-entry__link').getAttribute('href'),
            number: el.querySelector('.post-entry__number').textContent, children: el.querySelector('.post-entry__category').children.length
          }));
          return { a: collect('#blog-static-list .post-entry'), b: collect('#blog-results .post-entry') };
        });
        for (let i = 0; i < lists.a.length; i++) {
          assert.equal(lists.a[i].slug, lists.b[i].slug);
          assert.deepEqual(lists.a[i].fields, lists.b[i].fields);
          assert.equal(new URL(lists.a[i].link, p.url()).href, new URL(lists.b[i].link, p.url()).href);
          assert.equal(lists.a[i].children, lists.b[i].children);
        }
        assert.equal(await p.locator('#blog-results img, #blog-static-list img').count(), 0);
        await p.goto(base + 'index.html');
        const before = await p.locator('#home-recent').innerText();
        const n = await browser.newContext({ javaScriptEnabled: false });
        const np = await n.newPage();
        await np.goto(base + 'index.html');
        assert.equal((await np.locator('#home-recent').innerText()).replace(/\s+/g, ' '), before.replace(/\s+/g, ' '));
        await n.close();
        await c.close();
      });

      await check(`${engine}: independent search fixture checks AND/category/IME/legacy states`, async () => {
        const p = await browser.newPage({ reducedMotion: 'reduce' });
        const fixture = [
          { id: 101, slug: 'fixture-alpha', title: 'Alpha method', summary: 'Beta observation', category: 'study', tags: ['Gamma'], date: '2026-01-01', url: 'posts/fixture-alpha.html', isDemo: false, readingTime: 1 },
          { id: 102, slug: 'fixture-beta', title: 'Alpha diary', summary: 'Delta', category: 'life', tags: ['Gamma'], date: '2026-01-01', url: 'posts/fixture-beta.html', isDemo: true, readingTime: 2 }
        ];
        await p.route('**/js/posts-data.js', r => r.fulfill({ contentType: 'text/javascript', body: `window.Sywen.categories=${JSON.stringify(metadata.categories)};window.Sywen.posts=${JSON.stringify(fixture)};` }));
        await p.goto(base + 'blog.html?q=ALPHA%20beta&category=research');
        assert.equal(await p.locator('#blog-results .post-entry').count(), 1);
        assert.equal(new URL(p.url()).searchParams.get('category'), 'study');
        assert.equal(await p.locator('#blog-results .post-entry').getAttribute('data-post-id'), 'fixture-alpha');
        await p.locator('#search-input').fill('alpha gamma');
        await p.locator('[data-category="all"]').click();
        assert.equal(await p.locator('#blog-results .post-entry').count(), 2);
        await p.locator('#search-input').evaluate(input => {
          input.dispatchEvent(new CompositionEvent('compositionstart'));
          input.value = '无匹配';
          input.dispatchEvent(new InputEvent('input', { isComposing: true }));
        });
        assert.equal(await p.locator('#blog-results .post-entry').count(), 2);
        await p.locator('#search-input').evaluate(input => input.dispatchEvent(new CompositionEvent('compositionend')));
        assert.equal(await p.locator('#blog-empty').isVisible(), true);
        await p.locator('#empty-reset').click();
        assert.equal(await p.locator('#search-input').evaluate(el => el === document.activeElement), true);
        assert.equal(await p.locator('#blog-results .post-entry').count(), 2);
        await p.close();
      });

      await check(`${engine}: name lens reveals locally, resets and stays idle`, async () => {
        const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
        await c.addInitScript(() => {
          const request = window.requestAnimationFrame.bind(window);
          window.__v2Frames = 0;
          window.requestAnimationFrame = fn => { window.__v2Frames++; return request(fn); };
        });
        const p = await c.newPage();
        await p.goto(base + 'index.html');
        await ready(p);
        p.setDefaultTimeout(8000);
        const name = p.locator('.hero-name');
        const before = await name.boundingBox();
        const original = await name.screenshot();
        await p.mouse.move(before.x + 100, before.y + before.height / 2);
        await p.waitForFunction(() => document.querySelector('.hero-name').classList.contains('is-lens-active'));
        assert.deepEqual(await name.boundingBox(), before);
        const style = await name.evaluate(el => ({ mask: getComputedStyle(el.querySelector('.hero-name__public')).maskImage,
          clip: getComputedStyle(el.querySelector('.hero-name__formal')).clipPath }));
        assert.match(style.mask, /radial-gradient/);
        assert.match(style.clip, /circle/);
        assert.notEqual(sha(await name.screenshot()), sha(original));
        if (engine === 'edge') await shot(p, 'hero-lens', '.hero-name');
        await p.waitForTimeout(150);
        const count = await p.evaluate(() => window.__v2Frames);
        await p.waitForTimeout(150);
        assert.equal(await p.evaluate(() => window.__v2Frames), count);
        await p.emulateMedia({ reducedMotion: 'reduce' });
        await p.waitForFunction(() => !document.querySelector('.hero-name').classList.contains('is-lens-active'));
        await p.mouse.move(before.x + 130, before.y + before.height / 2);
        assert.equal(await name.getAttribute('class'), 'hero-name');
        await p.emulateMedia({ reducedMotion: 'no-preference' });
        await p.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await p.mouse.move(before.x + 120, before.y + before.height / 2);
        await p.waitForFunction(() => document.querySelector('.hero-name').classList.contains('is-lens-active'));
        await p.mouse.move(0, 0);
        await p.waitForFunction(() => !document.querySelector('.hero-name').classList.contains('is-lens-active'));
        assert.equal(await p.locator('.hero-name__formal').getAttribute('aria-hidden'), 'true');
        await c.close();
      });

      await check(`${engine}: touch/no-script/unsupported masks keep visible formal identity`, async () => {
        for (const scenario of ['touch', 'no-script', 'unsupported-mask', 'missing-hero-script']) {
          const c = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: scenario === 'touch',
            isMobile: engine !== 'firefox' && scenario === 'touch', javaScriptEnabled: scenario !== 'no-script' });
          if (scenario === 'unsupported-mask') await c.addInitScript(() => {
            const supports = CSS.supports.bind(CSS);
            CSS.supports = (...args) => String(args[0]).includes('mask') ? false : supports(...args);
          });
          if (scenario === 'missing-hero-script') await c.route('**/js/hero.js', r => r.abort());
          const p = await c.newPage();
          await p.goto(base + 'index.html');
          // Firefox disables asynchronous page timers in no-script contexts.
          if (scenario !== 'no-script') await ready(p);
          const name = await p.locator('.hero-name').boundingBox();
          if (scenario === 'touch') await p.touchscreen.tap(name.x + 60, name.y + name.height / 2);
          else await p.mouse.move(name.x + 60, name.y + name.height / 2);
          assert.equal(await p.locator('.hero-name').getAttribute('class'), 'hero-name');
          assert.equal(await p.locator('.hero__actions a[href="./profile.html"]').isVisible(), true);
          if (scenario === 'no-script') assert.equal(await p.locator('#theme-toggle').isVisible(), false);
          await p.locator('.hero__actions a[href="./profile.html"]').click();
          assert.match(await p.locator('main').innerText(), /Luo Wenxi/);
          await c.close();
        }
      });

      await check(`${engine}: new routes work under subdirectory and no scripts`, async () => {
        for (const javaScriptEnabled of [true, false]) {
          const c = await browser.newContext({ javaScriptEnabled, reducedMotion: 'reduce' });
          const p = await c.newPage();
          for (const name of topPages) {
            await p.goto(base + 'course/blog/' + name);
            assert.equal(await p.locator('.site-nav a').count(), topPages.length);
            for (const href of await p.locator('.selected-links a, .profile-research-links a, .site-nav a').evaluateAll(els => els.map(el => el.href))) {
              assert.ok(href.includes('/course/blog/'));
              assert.equal((await p.request.get(href)).status(), 200);
            }
          }
          await p.goto(base + 'course/blog/research.html#research-notes');
          assert.equal(await p.locator('#research-notes').isVisible(), true);
          await c.close();
        }
      });

      await check(`${engine}: Off the Desk image failure retains meaning and links`, async () => {
        const p = await browser.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
        await p.route('**/deskmate-firefly-01.jpg', r => r.abort());
        await p.goto(base + 'index.html');
        await p.locator('#off-the-desk').scrollIntoViewIfNeeded();
        assert.equal(await p.locator('#off-the-desk h3 a').isVisible(), true);
        assert.ok(await p.locator('#off-the-desk img').getAttribute('alt'));
        assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await p.locator('#off-the-desk h3 a').click();
        assert.match(p.url(), /posts\/deskmate-with-firefly.html/);
        await p.close();
      });

      await check(`${engine}: new page long content reflows and reading background stays continuous`, async () => {
        const p = await browser.newPage({ viewport: { width: 320, height: 900 } });
        await p.goto(base + 'research.html');
        await p.locator('#publications').evaluate(el => {
          const link = document.createElement('a');
          link.href = '#publications';
          link.textContent = 'AContinuousLongPublicationTitle'.repeat(12);
          el.append(link);
        });
        assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await p.goto(base + 'posts/scrna-grn-notes.html');
        assert.equal(await p.locator('.post-body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
        assert.ok(await p.locator('.post').evaluate(el => el.getBoundingClientRect().width <= 740));
        await p.close();
      });
      console.log(`${engine}: checks completed`);
    } finally { await browser.close(); }
  }
} finally {
  server.close();
  report.passed = report.checks.filter(c => c.pass).length;
  report.failed = report.checks.length - report.passed;
  fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed: report.passed, failed: report.failed }));
  if (report.failed) process.exitCode = 1;
}
