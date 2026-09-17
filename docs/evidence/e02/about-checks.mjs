// Local E02 evidence; --before captures the unmodified page only.
import { chromium } from '../../../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname, '../../..');
const before = process.argv.includes('--before');
const stage = before ? 'before' : 'after';
const out = path.join(import.meta.dirname, stage);
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((req, res) => {
  try {
    let name = new URL(req.url, 'http://local').pathname.replace(/^\/course\/blog\//, '/');
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep)) throw Error('path');
    res.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const checks = [];
async function check(name, fn) {
  try { checks.push({ name, pass: true, detail: await fn() }); }
  catch (e) { checks.push({ name, pass: false, error: e.message }); }
}
try {
  for (const width of (before ? [1440, 390] : [1440, 390, 320, 768, 1023, 1024])) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
      const p = await context.newPage();
      await p.goto(base + '/about.html');
      await p.locator('.about-hero-art img').evaluate(img => img.decode());
      await p.screenshot({ path: path.join(out, `about-${width}-${theme}.png`), fullPage: true });
      await check(`${width}/${theme}: layout and art`, async () => {
        return await p.evaluate((before) => {
          if (document.documentElement.scrollWidth > innerWidth) throw Error('horizontal overflow');
          const img = document.querySelector('.about-hero-art img');
          const b = img.getBoundingClientRect();
          if (!before && Math.abs(b.width / b.height - 4 / 3) > .01) throw Error('art aspect ratio');
          if (!before && (getComputedStyle(img).filter !== 'none' || getComputedStyle(img).opacity !== '1')) throw Error('art recolored');
          for (const d of document.querySelectorAll('.about-decoration')) {
            if (d.getAttribute('aria-hidden') !== 'true' || getComputedStyle(d).pointerEvents !== 'none') throw Error('decoration accessibility');
            if (d.querySelector('a,button,[tabindex]')) throw Error('focusable decoration');
            const box = d.getBoundingClientRect();
            for (const text of document.querySelectorAll('main p, main h2, main li, main dt, main dd')) {
              const t = text.getBoundingClientRect();
              if (box.left < t.right && box.right > t.left && box.top < t.bottom && box.bottom > t.top) throw Error('decoration overlaps text');
            }
          }
          return { src: img.currentSrc, width: b.width, height: b.height, headings: [...document.querySelectorAll('main h2')].map(x => x.textContent) };
        }, before);
      });
      await context.close();
    }
  }
  if (!before) {
    await check('DPR 2 requests, budgets and stable failure frame', async () => {
      const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
      const p = await c.newPage();
      await p.goto(base + '/about.html');
      await p.locator('.about-hero-art img').evaluate(img => img.decode());
      const size = await p.locator('.about-hero-art .art-frame').boundingBox();
      const source = await p.locator('.about-hero-art img').evaluate(img => img.currentSrc);
      assert.ok(source.endsWith('about-reading-1280.webp'));
      const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/about-assets.json')));
      for (const item of manifest) assert.ok(item.bytes <= (item.file.includes('about-reading') ? 200000 : 25000));
      await p.route('**/about-reading-*.webp', r => r.abort());
      await p.reload();
      const failed = await p.locator('.about-hero-art .art-frame').boundingBox();
      assert.equal(failed.height, size.height);
      await c.close();
      return { source, bytes: manifest.map(x => ({ file: x.file, bytes: x.bytes })), height: size.height };
    });
    for (const scenario of ['failed-images', 'no-script', 'no-script-failed', 'subdirectory', 'storage-failed']) {
      const context = await browser.newContext({ viewport: { width: 390, height: 900 }, javaScriptEnabled: !scenario.startsWith('no-script'), reducedMotion: 'reduce' });
      if (scenario.includes('failed') && scenario !== 'storage-failed') await context.route('**/assets/images/**', r => r.abort());
      if (scenario === 'storage-failed') await context.addInitScript(() => { Storage.prototype.setItem = () => { throw Error('blocked'); }; Storage.prototype.getItem = () => { throw Error('blocked'); }; });
      const p = await context.newPage();
      await p.goto(base + (scenario === 'subdirectory' ? '/course/blog' : '') + '/about.html');
      await check(scenario, async () => {
        assert.equal(await p.locator('main h2').count(), 5);
        assert.equal(await p.locator('main').innerText().then(x => x.includes('Transformer')), true);
        assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        if (scenario === 'failed-images') {
          assert.equal(await p.locator('.about-hero-art .art-frame').evaluate(x => x.classList.contains('is-failed')), true);
          assert.equal(await p.locator('.about-hero-art .art-frame__fallback').isVisible(), true);
        }
        if (scenario === 'subdirectory') assert.equal(await p.locator('.about-hero-art img').evaluate(x => x.naturalWidth > 0), true);
        if (scenario === 'storage-failed') {
          const old = await p.locator('html').getAttribute('data-theme');
          await p.locator('#theme-toggle').click();
          assert.notEqual(await p.locator('html').getAttribute('data-theme'), old);
        }
        await p.keyboard.press('Tab');
        assert.equal(await p.evaluate(() => document.activeElement.classList.contains('skip-link')), scenario !== 'storage-failed');
      });
      await p.screenshot({ path: path.join(out, scenario + '.png'), fullPage: true });
      await context.close();
    }
  }
} finally {
  fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify({ at: new Date().toISOString(), checks }, null, 2));
  await browser.close(); server.close();
}
console.log(JSON.stringify({ stage, passed: checks.filter(x => x.pass).length, failed: checks.filter(x => !x.pass) }, null, 2));
if (checks.some(x => !x.pass)) process.exitCode = 1;
