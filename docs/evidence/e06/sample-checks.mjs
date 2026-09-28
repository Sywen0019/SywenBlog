// E06 sample evidence: self-contained HTTP server, no production dependencies.
import { chromium, firefox } from '../../../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../..');
const stage = process.argv[2] || 'after';
const browserArgument = process.argv.find(arg => arg.startsWith('--browser='))?.split('=')[1];
const engines = stage === 'before' ? ['edge'] : browserArgument ? browserArgument.split(',') : ['edge', 'chrome', 'firefox'];
assert.ok(engines.every(engine => ['edge', 'chrome', 'firefox'].includes(engine)));
assert.ok(['before', 'after'].includes(stage));
const out = process.env.SYWEN_EVIDENCE_DIR ? path.resolve(process.env.SYWEN_EVIDENCE_DIR) : path.join(import.meta.dirname, stage);
const reportName = browserArgument ? `checks-${engines.join('-')}` : 'checks';
if (stage === 'before' && fs.existsSync(path.join(out, 'checks.json'))) throw Error('Before evidence is frozen.');
fs.mkdirSync(out, { recursive: true });
const pages = [['home', 'index.html'], ['about', 'about.html'], ['long', 'posts/scrna-grn-notes.html'], ['photo', 'posts/deskmate-with-firefly.html']];
const tracked = ['index.html', 'blog.html', 'about.html', ...['posts', 'css', 'js', 'assets'].flatMap(dir =>
  fs.readdirSync(path.join(root, dir), { recursive: true, withFileTypes: true }).filter(n => n.isFile()).map(n =>
    path.relative(root, path.join(n.parentPath, n.name)).replaceAll('\\', '/')))];
const sha = file => createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const report = { stage, at: new Date().toISOString(), parentCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), hashes: Object.fromEntries(tracked.map(p => [p, sha(p)])), checks: [], screenshots: [], limitations: ['No physical phone, screen reader or browser UI zoom test.', 'Sample only; user review, full-site expansion and release are pending.'] };
const server = http.createServer((req, res) => {
  try {
    let name = decodeURIComponent(new URL(req.url, 'http://local').pathname).replace(/^\/course\/blog\//, '/');
    if (name.endsWith('/')) name += 'index.html';
    const file = path.resolve(root, '.' + name);
    if (!file.startsWith(root + path.sep)) throw Error('path');
    res.setHeader('Content-Type', { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg' }[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
async function check(name, fn) {
  try { report.checks.push({ name, pass: true, detail: await fn() }); }
  catch (e) { report.checks.push({ name, pass: false, error: e.stack }); console.error(name, e.message); }
  console.log(`${report.checks.at(-1).pass ? 'PASS' : 'FAIL'} ${name}`);
  fs.writeFileSync(path.join(out, `${reportName}.partial.json`), JSON.stringify({ ...report, running: true }, null, 2) + '\n');
}
async function settle(page, scriptless = false) {
  // Actually scroll so IntersectionObserver and lazy images take their normal paths.
  for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 600) {
    await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(70);
  }
  if (!scriptless) await page.evaluate(() => Promise.race([Promise.all([...document.images].filter(img => img.getClientRects().length).map(img => img.decode().catch(() => {}))), new Promise((_, reject) => setTimeout(() => reject(Error('Image decode timed out')), 15000))]));
  await page.waitForTimeout(400);
  if (!scriptless) await page.evaluate(() => Promise.race([Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))), new Promise(resolve => setTimeout(resolve, 2000))]));
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(120);
}
async function facts(page) {
  return page.evaluate(() => {
    const ensure = (v, m) => { if (!v) throw Error(m); };
    ensure(document.documentElement.scrollWidth <= innerWidth, 'horizontal overflow');
    for (const node of document.querySelectorAll('.motion-reveal')) ensure(getComputedStyle(node).opacity === '1', 'unrevealed section');
    for (const img of document.images) if (img.getClientRects().length) ensure(img.naturalWidth > 0, 'image failed: ' + img.src);
    const body = document.querySelector('.post-body');
    if (body) ensure(body.getBoundingClientRect().width <= 740.1, 'reading column >740');
    return { height: document.documentElement.scrollHeight, images: document.images.length, paper: getComputedStyle(document.documentElement).getPropertyValue('--color-paper').trim() };
  });
}
try {
  for (const engine of engines) {
    const browser = await (engine === 'firefox' ? firefox.launch() : chromium.launch({ channel: engine === 'edge' ? 'msedge' : 'chrome' }));
    try {
      for (const width of [1440, 390]) for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme });
        for (const [name, file] of pages) await check(`${engine}/${name}/${width}/${theme}`, async () => {
          const p = await context.newPage();
          try {
            const errors = []; p.on('pageerror', e => errors.push(e.message));
            await p.goto(base + '/' + file); await settle(p);
            const detail = await facts(p); assert.deepEqual(errors, []);
            if (stage === 'after') {
              assert.equal(await p.locator('html').getAttribute('data-visual-stage'), 'e06-sample');
              if (theme === 'dark') for (const el of await p.locator('.line-art').all()) {
                const styles = await el.evaluate(n => ({ image: getComputedStyle(n.querySelector('img')).visibility, mask: getComputedStyle(n, '::after').maskImage }));
                assert.equal(styles.image, 'hidden'); assert.ok(styles.mask.includes('.webp'));
              }
              if (name === 'long' || name === 'photo') {
                assert.equal(await p.locator('.post-header__index').isVisible(), width < 1200);
                if (name === 'long') {
                  assert.equal(await p.locator('.post-section-number').count(), 14);
                  if (width >= 1200) assert.ok(await p.locator('.post-section-number').evaluateAll(ns => ns.every(n => n.getBoundingClientRect().right < document.querySelector('.post-body').getBoundingClientRect().left)));
                }
              }
            }
            if (engine === 'edge') {
              const filename = `${name}-${width}-${theme}.png`;
              await p.screenshot({ path: path.join(out, filename), fullPage: true }); report.screenshots.push(filename);
              await p.screenshot({ path: path.join(out, `${name}-${width}-${theme}-viewport.png`) });
              if (width === 1440) {
                await p.screenshot({ path: path.join(out, `${name}-paper-${theme}.png`), clip: { x: 12, y: 150, width: 128, height: 512 } });
                if (name === 'home') await p.locator('.now-slip').screenshot({ path: path.join(out, `home-now-${theme}.png`) });
                if (name === 'about') {
                  await p.locator('.about-transition').screenshot({ path: path.join(out, `about-branch-${theme}.png`) });
                  await p.locator('.about-now').screenshot({ path: path.join(out, `about-now-${theme}.png`) });
                }
              }
            }
            return detail;
          } finally { await p.close(); }
        });
        await context.close();
      }
      if (stage === 'after') {
        for (const mode of ['no-js', 'image-failure', 'subdirectory', 'theme-toggle', 'reduced-motion']) await check(`${engine}/${mode}`, async () => {
          const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', javaScriptEnabled: mode !== 'no-js', reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference' });
          try {
            const p = await ctx.newPage();
            if (mode === 'image-failure') await p.route('**/assets/images/a0{7,8}*', route => route.abort());
            await p.goto(base + (mode === 'subdirectory' ? '/course/blog/' : '/') + 'about.html'); await settle(p, mode === 'no-js');
            assert.ok(await p.locator('#about-me-title').isVisible());
            assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
            if (mode === 'image-failure') for (const n of await p.locator('.line-art').all()) assert.equal(await n.evaluate(el => getComputedStyle(el, '::after').display), 'none');
            if (mode === 'theme-toggle') {
              await p.locator('#theme-toggle').click(); await p.reload();
              assert.equal(await p.locator('html').getAttribute('data-theme'), 'light');
              assert.equal(await p.locator('.line-art img').first().evaluate(n => getComputedStyle(n).visibility), 'visible');
              await p.locator('#theme-toggle').click();
              assert.equal(await p.locator('.line-art img').first().evaluate(n => getComputedStyle(n).visibility), 'hidden');
            }
            if (mode === 'no-js') { assert.equal(await p.locator('#theme-toggle').isVisible(), false); assert.equal(await p.locator('.line-art img').first().evaluate(n => getComputedStyle(n).visibility), 'hidden'); }
            if (mode === 'subdirectory') await facts(p);
            if (engine === 'edge') await p.screenshot({ path: path.join(out, `${mode}.png`), fullPage: true });
          } finally { await ctx.close(); }
        });
        for (const width of [320, 767, 768, 769, 1023, 1024, 1025, 1199, 1200, 1201]) await check(`${engine}/breakpoint/${width}`, async () => {
          const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
          try {
            const p = await ctx.newPage();
            for (const [, file] of pages) {
              await p.goto(base + '/' + file);
              assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
              if (file.startsWith('posts/')) {
                assert.equal(await p.locator('.post-header__index').isVisible(), width < 1200);
                assert.ok(await p.locator('.post-body').evaluate(n => n.getBoundingClientRect().width <= 740.1));
              }
            }
          } finally { await ctx.close(); }
        });
      }
    } finally { await browser.close(); }
  }
} finally {
  server.close();
  report.passed = report.checks.filter(c => c.pass).length; report.failed = report.checks.filter(c => !c.pass).length;
  fs.writeFileSync(path.join(out, `${reportName}.json`), JSON.stringify(report, null, 2) + '\n');
  fs.rmSync(path.join(out, `${reportName}.partial.json`), { force: true });
  console.log(JSON.stringify({ passed: report.passed, failed: report.failed }));
  process.exitCode = report.failed ? 1 : 0;
}
