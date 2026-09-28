import { chromium, firefox } from '../../../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const base = process.env.SYWEN_PUBLIC_URL || 'https://sywen-blog.pages.dev/';
const out = path.resolve('docs/evidence/e06/final/public');
fs.mkdirSync(out, { recursive: true });
const report = { at: new Date().toISOString(), url: base, checks: [], browsers: {} };
for (const engine of ['edge', 'chrome', 'firefox']) {
  const browser = await (engine === 'firefox' ? firefox.launch() : chromium.launch({ channel: engine === 'edge' ? 'msedge' : 'chrome' }));
  report.browsers[engine] = browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' });
  const p = await context.newPage();
  async function check(name, fn) {
    try { await fn(); report.checks.push({ engine, name, pass: true }); }
    catch (error) { report.checks.push({ engine, name, pass: false, error: error.stack }); }
  }
  await check('version, categories and system dark mask', async () => {
    await p.goto(base);
    const version = await p.evaluate(async () => (await fetch('version.json', { cache: 'no-store' })).json());
    if (process.env.SYWEN_EXPECTED_COMMIT) assert.equal(version.source_commit, process.env.SYWEN_EXPECTED_COMMIT);
    report.version = version;
    assert.deepEqual(await p.locator('[data-category-count]').allTextContents(), ['3', '1', '1']);
    await p.locator('.now-slip').scrollIntoViewIfNeeded();
    assert.equal(await p.locator('.line-art').evaluate(n => getComputedStyle(n, '::after').display), 'block');
  });
  await check('AND search, A09 and keyboard reset', async () => {
    await p.goto(base + 'blog.html?q=' + encodeURIComponent('科研绘图 视觉规范') + '&category=study');
    assert.equal(await p.locator('#blog-results .post-entry').count(), 1);
    await p.locator('button[data-category="life"]').click();
    await p.locator('.empty-state__avatar').evaluate(img => img.decode());
    assert.equal(await p.locator('#blog-empty').isVisible(), true);
    await p.locator('#empty-reset').focus(); await p.keyboard.press('Enter');
    assert.equal(await p.locator('#blog-results .post-entry').count(), 5);
    assert.equal(await p.locator('#search-input').evaluate(n => n === document.activeElement), true);
  });
  await check('About gray branch, preserved character and theme switch', async () => {
    await p.goto(base + 'about.html');
    await p.locator('.line-art--branch').scrollIntoViewIfNeeded();
    assert.equal(await p.locator('.line-art--branch').evaluate(n => getComputedStyle(n, '::after').display), 'block');
    assert.equal(await p.locator('.about-hero-art img').evaluate(n => getComputedStyle(n).filter), 'none');
    await p.locator('#theme-toggle').click();
    assert.equal(await p.locator('.line-art--branch').evaluate(n => getComputedStyle(n, '::after').display), 'none');
    await p.reload(); assert.equal(await p.locator('html').getAttribute('data-theme'), 'light');
  });
  await check('long reading, continuous paper, numbering and return focus', async () => {
    await p.goto(base + 'posts/scrna-grn-notes.html');
    assert.equal(await p.locator('.post-body').evaluate(n => getComputedStyle(n).backgroundColor), 'rgba(0, 0, 0, 0)');
    assert.equal(await p.locator('.post-section-number').count(), 14);
    await p.evaluate(() => scrollTo(0, 1500)); await p.waitForTimeout(300);
    assert.ok(await p.evaluate(() => window.Sywen.getReadingProgress() > 0));
    await p.locator('#back-to-top').click();
    assert.equal(await p.locator('h1').evaluate(n => n === document.activeElement), true);
  });
  await check('quick menu and original photo rendering at mobile width', async () => {
    await p.setViewportSize({ width: 390, height: 844 });
    await p.goto(base + 'posts/deskmate-with-firefly.html');
    await p.locator('#quick-menu-button').click();
    const copyItem = p.getByRole('menuitem', { name: '复制文章链接', exact: true });
    await copyItem.waitFor({ state: 'visible' });
    assert.equal(await copyItem.isVisible(), true);
    await p.keyboard.press('Escape');
    assert.equal(await p.locator('.post-body img').first().evaluate(n => getComputedStyle(n).filter), 'none');
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await p.screenshot({ path: path.join(out, engine + '-photo.png'), fullPage: true });
  });
  await context.close(); await browser.close();
}
report.passed = report.checks.filter(c => c.pass).length;
report.failed = report.checks.length - report.passed;
fs.writeFileSync(path.join(out, 'enhancement-checks.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
if (report.failed) process.exitCode = 1;
