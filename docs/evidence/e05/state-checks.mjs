// E05 local HTTP evidence. --before captures the unchanged Blog matrix.
import { chromium, firefox } from '../../../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../..');
const articleCount = JSON.parse(fs.readFileSync(path.join(root, 'content/posts.json'))).posts.length;
const before = process.argv.includes('--before');
const stage = before ? 'before' : 'after';
const evidenceRoot = process.env.SYWEN_EVIDENCE_DIR ? path.resolve(process.env.SYWEN_EVIDENCE_DIR) : import.meta.dirname;
const output = path.join(evidenceRoot, stage);
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  try {
    const name = new URL(req.url, 'http://local').pathname.replace(/^\/course\/blog\//, '/');
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep)) throw Error('path');
    res.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const report = { stage, at: new Date().toISOString(), parentCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), checks: [], limitations: ['No physical phone, browser UI zoom or screen reader testing.'] };
async function check(browser, name, fn) {
  try { report.checks.push({ browser, name, pass: true, detail: await fn() }); }
  catch (error) { report.checks.push({ browser, name, pass: false, error: error.stack }); }
}
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
try {
  for (const engine of (before ? ['edge'] : ['edge', 'chrome', 'firefox'])) {
    const browser = await (engine === 'firefox' ? firefox.launch() : chromium.launch({ channel: engine === 'edge' ? 'msedge' : 'chrome' }));
    try {
      for (const width of [320, 390, 768, 1440]) {
        for (const theme of ['light', 'dark']) {
          const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
          const page = await context.newPage();
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          for (const state of ['list', 'empty']) {
            await check(engine, `${width}/${theme}/${state}`, async () => {
              await page.goto(base + '/blog.html' + (state === 'empty' ? '?q=e05-no-match-xyz' : ''));
              await page.locator('#blog-filters').waitFor({ state: 'visible' });
              if (state === 'empty') await page.locator('.empty-state__avatar').evaluate(img => img.decode());
              const details = await page.evaluate(({ before, state, width, articleCount }) => {
                const ensure = (ok, message) => { if (!ok) throw Error(message); };
                ensure(document.documentElement.scrollWidth <= innerWidth, 'overflow');
                ensure(document.querySelectorAll('#blog-results img').length === 0, 'list images');
                if (state === 'list') {
                  ensure(document.querySelector('#blog-empty').hidden, 'empty state visible');
                  ensure(document.querySelectorAll('#blog-results .post-entry').length === articleCount, 'article count');
                  return { count: 5 };
                }
                const img = document.querySelector('.empty-state__avatar');
                const box = img.getBoundingClientRect();
                const reset = document.querySelector('#empty-reset').getBoundingClientRect();
                const footer = document.querySelector('footer').getBoundingClientRect();
                const style = getComputedStyle(img);
                if (!before) {
                  ensure(box.width === (width < 768 ? 96 : 120) && box.height === box.width, 'display size');
                  ensure(img.naturalWidth === 320 && img.naturalHeight === 320, 'export size');
                  ensure(img.alt === '' && img.getAttribute('aria-hidden') === 'true' && img.tabIndex === -1, 'decorative accessibility');
                  ensure(style.pointerEvents === 'none' && style.float === 'none', 'decoration layout');
                  ensure(style.filter === 'none' && style.opacity === '1', 'art recolored');
                  ensure(box.top >= reset.bottom && box.bottom < footer.top, 'art overlap');
                }
                return { width: box.width, height: box.height, footerGap: footer.top - box.bottom };
              }, { before, state, width, articleCount });
              if (engine === 'edge') {
                const filename = `blog-${state}-${width}-${theme}.png`;
                const file = path.join(output, filename);
                await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
                if (!before && state === 'list') assert.equal(hash(file), hash(path.join(evidenceRoot, 'before', filename)), 'normal list screenshot changed');
              }
              assert.deepEqual(errors, []);
              return details;
            });
          }
          await context.close();
        }
      }
      if (before) continue;
      async function scenario(name, options, fn) {
        await check(engine, name, async () => {
          const context = await browser.newContext({ viewport: { width: 390, height: 900 }, ...options });
          try { return await fn(await context.newPage()); }
          finally { await context.close(); }
        });
      }
      await scenario('keyboard reset, category/query and history', {}, async page => {
        await page.goto(base + '/blog.html?category=life&q=unmatched-e05');
        assert.equal(await page.locator('#blog-empty').isVisible(), true);
        await page.locator('#empty-reset').focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#search-input').evaluate(el => el === document.activeElement), true);
        assert.equal(await page.locator('#blog-results .post-entry').count(), articleCount);
        assert.equal(new URL(page.url()).search, '');
        await page.locator('button[data-category="life"]').click();
        assert.equal(await page.locator('#blog-results .post-entry').count(), 1);
        await page.goto(base + '/about.html');
        await page.goBack();
        assert.equal(await page.locator('button[data-category="life"]').getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('#blog-results .post-entry').count(), 1);
        await page.evaluate(() => {
          history.pushState(null, '', '?q=e05-no-match');
          dispatchEvent(new PopStateEvent('popstate'));
        });
        assert.equal(await page.locator('#blog-empty').isVisible(), true);
      });
      await scenario('Chinese composition waits until compositionend', {}, async page => {
        await page.goto(base + '/blog.html');
        await page.locator('#search-input').evaluate(input => {
          input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
          input.value = '完全不存在的文章';
          input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
        });
        assert.equal(await page.locator('#blog-results .post-entry').count(), articleCount);
        await page.locator('#search-input').dispatchEvent('compositionend');
        assert.equal(await page.locator('#blog-empty').isVisible(), true);
      });
      await scenario('empty favorites fixture and generic keyword empty state', {}, async page => {
        await page.route('**/js/posts-data.js', async route => {
          const response = await route.fetch();
          await route.fulfill({ response, body: (await response.text()) + '\nwindow.Sywen.posts = window.Sywen.posts.filter(post => post.category !== "favorites");' });
        });
        await page.goto(base + '/blog.html?category=favorites');
        assert.equal(await page.locator('#empty-title').innerText(), '这里还没有文章');
        assert.match(await page.locator('.empty-state__text').innerText(), /美食、游戏、动漫/);
        await page.locator('#search-input').fill('不存在');
        assert.equal(await page.locator('#empty-title').innerText(), '没找到匹配的文章');
      });
      await scenario('image failure preserves text and reset', {}, async page => {
        await page.route('**/a09-empty-state.webp', route => route.abort());
        await page.goto(base + '/blog.html?q=e05-no-match');
        await page.locator('.empty-state__avatar').waitFor({ state: 'hidden' });
        assert.equal(await page.locator('#empty-title').isVisible(), true);
        await page.locator('#empty-reset').click();
        assert.equal(await page.locator('#blog-results .post-entry').count(), articleCount);
      });
      for (const js of [false, true]) {
        await scenario(js ? 'initialization failure retains static content' : 'no script retains static content', { javaScriptEnabled: js }, async page => {
          if (js) await page.route('**/js/posts-data.js', route => route.abort());
          await page.goto(base + '/blog.html?q=e05-no-match');
          assert.equal(await page.locator('#blog-empty').isVisible(), false);
          assert.equal(await page.locator('#blog-filters').isVisible(), false);
          assert.equal(await page.locator('#blog-static-list').isVisible(), true);
          assert.equal(await page.locator('#blog-static-list .post-entry').count(), articleCount);
        });
      }
      await scenario('subdirectory, reduced motion, resource budget', { reducedMotion: 'reduce' }, async page => {
        const failed = [];
        page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
        await page.goto(base + '/course/blog/blog.html?q=e05-no-match');
        await page.locator('.empty-state__avatar').evaluate(img => img.decode());
        const img = page.locator('.empty-state__avatar');
        assert.match(await img.evaluate(el => el.currentSrc), /\/course\/blog\/assets\/images\/a09-empty-state.webp$/);
        assert.equal(await img.evaluate(el => getComputedStyle(el).animationName), 'none');
        assert.deepEqual(failed, []);
        assert.ok(fs.statSync(path.join(root, 'assets/images/a09-empty-state.webp')).size <= 40 * 1024);
      });
    } finally { await browser.close(); }
  }
} finally {
  server.close();
  fs.writeFileSync(path.join(evidenceRoot, `${stage}-checks.json`), JSON.stringify(report, null, 2) + '\n');
}
const failures = report.checks.filter(item => !item.pass);
console.log(JSON.stringify({ stage, passed: report.checks.length - failures.length, failed: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
