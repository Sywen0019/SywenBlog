// Record and verify the enhanced public site; preserve the baseline video.
import { chromium } from '../.tmp-browser/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const out = path.resolve(process.env.SYWEN_EVIDENCE_DIR || 'docs/evidence/e06/final/public');
const base = (process.env.SYWEN_PUBLIC_URL || 'https://sywen-blog.pages.dev/').replace(/\/?$/, '/');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light',
  permissions: ['clipboard-read', 'clipboard-write'], recordVideo: { dir: out, size: { width: 1280, height: 800 } } });
const p = await context.newPage();
const report = { at: new Date().toISOString(), url: base, steps: [] };
const pause = () => p.waitForTimeout(1200);
async function step(name, fn) { await fn(); await pause(); report.steps.push({ name, pass: true }); }
let passed = false;
try {
  await step('Home and theme persistence', async () => {
    await p.goto(base);
    assert.deepEqual(await p.locator('[data-category-count]').allTextContents(), ['3','1','1']);
    report.version = await p.evaluate(async () => (await fetch('version.json', { cache: 'no-store' })).json());
    await pause(); await p.locator('#theme-toggle').click(); await p.reload();
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
  });
  await step('Dark decoration and return to light', async () => {
    await p.locator('.now-slip').scrollIntoViewIfNeeded(); await pause();
    assert.equal(await p.locator('.line-art').evaluate(n => getComputedStyle(n, '::after').display), 'block');
    await p.locator('#back-to-top').click(); await p.locator('#theme-toggle').click();
  });
  await step('AND search and empty state', async () => {
    await p.goto(base + 'blog.html'); await p.locator('#search-input').fill('科研绘图 视觉规范');
    await p.locator('[data-category="study"]').click();
    assert.equal(await p.locator('#blog-results .post-entry').count(), 1); await pause();
    await p.locator('[data-category="life"]').click();
    await p.locator('.empty-state__avatar').evaluate(n => n.decode());
    assert.equal(await p.locator('#blog-empty').isVisible(), true);
  });
  await step('Reset and persistent reading query', async () => {
    await p.locator('#empty-reset').click(); assert.equal(await p.locator('#blog-results .post-entry').count(), 5);
    await pause(); await p.locator('#search-input').fill('论文阅读');
    await p.locator('[data-category="study"]').click(); await p.reload();
    assert.equal(await p.locator('#search-input').inputValue(), '论文阅读');
    assert.equal(await p.locator('#blog-results .post-entry').count(), 1);
  });
  await step('Favorites and original photo colors', async () => {
    await p.locator('#search-input').fill(''); await p.locator('[data-category="favorites"]').click();
    assert.equal(await p.locator('#blog-results .post-entry').count(), 1); await pause();
    await p.getByRole('link', { name: '和流萤做同桌', exact: true }).click();
    await p.locator('.post-figure').first().scrollIntoViewIfNeeded();
    assert.equal(await p.locator('.post-figure img').first().evaluate(n => getComputedStyle(n).filter), 'none');
  });
  await step('About reading art and dark plant', async () => {
    await p.goto(base + 'about.html'); await p.locator('.about-hero-art img').evaluate(n => n.decode()); await pause();
    await p.locator('#theme-toggle').click(); await p.locator('.about-now').scrollIntoViewIfNeeded();
    assert.equal(await p.locator('.line-art--plant').evaluate(n => getComputedStyle(n, '::after').display), 'block');
  });
  await step('Reading progress and return focus', async () => {
    await p.goto(base + 'posts/scrna-grn-notes.html');
    await p.evaluate(() => scrollTo({ top: 1500, behavior: 'instant' }));
    await p.locator('#back-to-top').waitFor({ state: 'visible' }); await pause();
    assert.ok(await p.evaluate(() => Sywen.getReadingProgress()) > 0);
    await p.locator('#back-to-top').click(); await p.waitForFunction(() => scrollY < 2);
    await p.waitForFunction(() => document.activeElement?.tagName === 'H1');
    assert.equal(await p.evaluate(() => document.activeElement.tagName), 'H1');
  });
  await step('Quick menu and copy URL', async () => {
    await p.locator('#quick-menu-button').click(); await pause();
    await p.getByRole('menuitem', { name: '复制文章链接', exact: true }).click(); await pause();
    assert.equal(await p.evaluate(() => navigator.clipboard.readText()), p.url());
    await p.locator('#theme-toggle').click();
    assert.equal(await p.locator('.post-body').evaluate(n => getComputedStyle(n).backgroundColor), 'rgba(0, 0, 0, 0)');
  });
  passed = true;
} catch (error) { report.error = error.stack; throw error; }
finally {
  await context.close();
  const target = path.join(out, passed ? 'enhanced-demo.webm' : 'enhanced-demo-failed.webm');
  await p.video().saveAs(target); await p.video().delete(); await browser.close();
  report.passed = passed; report.video = path.basename(target);
  fs.writeFileSync(path.join(out, 'demo-checks.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ passed, steps: report.steps.length, video: target }));
}
